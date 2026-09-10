/**
 * PRESENTATION COVERAGE ENGINE
 * Compares the complete PPT Knowledge Map against the spoken pitch transcript.
 * Performs semantic matching & term overlap gap analysis for every concept.
 * Classifies each concept into:
 * - "Not Explained" (Priority 1)
 * - "Partially Explained" (Priority 2)
 * - "Fully Explained" (Priority 3 - Deep Follow-up Probing)
 * Stores confidenceScore (0-100) per concept node.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

let aiInstance = null;
const getAIModel = () => {
  if (!aiInstance && process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      aiInstance = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    } catch (e) {
      console.warn('[Presentation Coverage Engine] Notice:', e.message);
    }
  }
  return aiInstance;
};

/**
 * Calculates semantic overlap score between spoken transcript and concept keywords/details.
 */
export const calculateConceptOverlapScore = (transcript = '', conceptObj = {}) => {
  if (!transcript || transcript.trim().length < 10) return { score: 0, status: 'Not Explained' };

  const normTranscript = transcript.toLowerCase();
  const title = (conceptObj.conceptTitle || conceptObj.topic || '').toLowerCase();
  const details = (conceptObj.details || []).join(' ').toLowerCase();

  // Extract key terms (3+ chars)
  const keywords = Array.from(new Set([
    ...title.split(/\s+/).filter(w => w.length > 3),
    ...details.split(/\s+/).filter(w => w.length > 3)
  ]));

  if (keywords.length === 0) return { score: 0, status: 'Not Explained' };

  let matched = 0;
  keywords.forEach(kw => {
    if (normTranscript.includes(kw)) matched++;
  });

  const ratio = matched / keywords.length;
  const confidenceScore = Math.min(100, Math.round(ratio * 120));

  let status = 'Not Explained';
  if (confidenceScore >= 65) {
    status = 'Fully Explained';
  } else if (confidenceScore >= 25) {
    status = 'Partially Explained';
  }

  return { score: confidenceScore, status };
};

/**
 * Analyzes presentation pitch transcript against complete Concept Map.
 */
export const analyzePresentationSpeechCoverage = async ({
  presentationTitle,
  concepts = [],
  conceptDetails = [],
  spokenTranscript = ''
}) => {
  const isDirectPptOnly = !spokenTranscript || spokenTranscript.trim().length < 15;
  const model = getAIModel();

  if (isDirectPptOnly) {
    // If no live speech recorded (Direct Q&A mode), mark concepts as Not Explained / Baseline for equal testing
    return concepts.map((cTitle, idx) => {
      const detailObj = conceptDetails.find(d => (d.topic || d.conceptTitle) === cTitle) || {};
      return {
        conceptId: detailObj.conceptId || `c_sp_${idx + 1}`,
        conceptTitle: cTitle,
        explanationStatus: 'Not Explained',
        confidenceScore: 0,
        priorityLevel: 1, // Priority 1: Unexplained concepts
        reason: 'Direct Q&A Mode: No spoken pitch transcript recorded.'
      };
    });
  }

  // LLM Semantic Pitch Coverage Analysis
  if (model) {
    try {
      const prompt = `
You are a Lead Presentation Speech & Content Auditor.
Compare the Presenter's Spoken Pitch Transcript against the PPT Slide Concept Map for "${presentationTitle}".

PRESENTER'S SPOKEN TRANSCRIPT:
"${spokenTranscript}"

PPT SLIDE CONCEPT MAP:
${JSON.stringify(concepts, null, 2)}

DETAILED CONCEPT DETAILS:
${JSON.stringify(conceptDetails, null, 2)}

TASK:
For EVERY concept in the list, determine whether the presenter explained it during their spoken pitch.
Classify each concept into:
- "Not Explained" (Confidence 0-25) -> Presenter skipped this concept during speech.
- "Partially Explained" (Confidence 26-65) -> Presenter touched upon it briefly but omitted metrics/details.
- "Fully Explained" (Confidence 66-100) -> Presenter thoroughly presented this topic with facts.

Return ONLY a valid JSON array matching this schema:
[
  {
    "conceptTitle": "Intel 5-Year Revenue Trend ($71.9B in 2019 to $63.1B in 2023)",
    "explanationStatus": "Partially Explained",
    "confidenceScore": 45,
    "priorityLevel": 2,
    "reason": "Presenter mentioned revenue decline but omitted exact foundry capex numbers."
  }
]
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text() || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.warn('[Presentation Coverage Engine Fallback]:', err.message);
    }
  }

  // Algorithm fallback coverage calculation
  return concepts.map((cTitle, idx) => {
    const detailObj = conceptDetails.find(d => (d.topic || d.conceptTitle) === cTitle) || {};
    const overlap = calculateConceptOverlapScore(spokenTranscript, { conceptTitle: cTitle, details: detailObj.details });

    let priorityLevel = 1;
    if (overlap.status === 'Partially Explained') priorityLevel = 2;
    if (overlap.status === 'Fully Explained') priorityLevel = 3;

    return {
      conceptId: detailObj.conceptId || `c_sp_${idx + 1}`,
      conceptTitle: cTitle,
      explanationStatus: overlap.status,
      confidenceScore: overlap.score,
      priorityLevel,
      reason: `Algorithm term overlap analysis (${overlap.score}% confidence).`
    };
  });
};

/**
 * Sorts concept map by Question Priority:
 * 1. Concepts NOT EXPLAINED (Priority 1)
 * 2. Concepts PARTIALLY EXPLAINED (Priority 2)
 * 3. Concepts FULLY EXPLAINED - Deep Follow-ups (Priority 3)
 */
export const prioritizeConceptsBySpeechCoverage = (coverageAnalysis = []) => {
  return [...coverageAnalysis].sort((a, b) => {
    const priorityOrder = { 'Not Explained': 1, 'Partially Explained': 2, 'Fully Explained': 3 };
    const pA = priorityOrder[a.explanationStatus] || 1;
    const pB = priorityOrder[b.explanationStatus] || 1;
    if (pA !== pB) return pA - pB;
    return a.confidenceScore - b.confidenceScore;
  });
};
