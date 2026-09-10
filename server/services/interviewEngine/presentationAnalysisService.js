/**
 * STAGE 1 REASONING ENGINE: PRESENTATION ANALYSIS SERVICE
 * Compares Complete PPT Knowledge Map against Presenter's Spoken Pitch Transcript.
 * Evaluates pptFacts, coveredFacts, missingFacts, incorrectFacts, confidenceScore, and conceptStatus for every concept.
 * Returns ONLY structured JSON analysis (Zero questions generated in Stage 1).
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

let aiInstance = null;
const getAIModel = () => {
  if (!aiInstance && process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      aiInstance = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    } catch (e) {
      console.warn('[Stage 1 Analysis Engine] Notice:', e.message);
    }
  }
  return aiInstance;
};

export const runStage1PresentationAnalysis = async ({
  presentationTitle,
  concepts = [],
  conceptDetails = [],
  spokenTranscript = ''
}) => {
  const isDirectPptOnly = !spokenTranscript || spokenTranscript.trim().length < 15;
  const model = getAIModel();

  if (isDirectPptOnly) {
    // Direct Q&A Mode: Speech not recorded, mark concepts as skipped / baseline for testing
    const baselineAnalysis = concepts.map((cTitle, idx) => {
      const detailObj = conceptDetails.find(d => (d.topic || d.conceptTitle) === cTitle) || {};
      const slideNum = detailObj.slideNumber || 1;
      const facts = detailObj.details || [`Slide ${slideNum} concept topic`];
      const conceptId = detailObj.conceptId || `c_slide${slideNum}_${idx + 1}`;

      return {
        conceptId,
        conceptTitle: cTitle,
        slideNumber: slideNum,
        pptFacts: facts,
        coveredFacts: [],
        missingFacts: facts,
        incorrectFacts: [],
        confidenceScore: 0,
        conceptStatus: 'skipped',
        priorityReason: 'skipped'
      };
    });

    return {
      presentationTitle,
      analysisMode: 'DIRECT_PPT_ONLY',
      totalConceptsAnalyzed: baselineAnalysis.length,
      conceptAnalysisList: baselineAnalysis
    };
  }

  // LLM Stage 1 Analysis Call
  if (model) {
    try {
      const prompt = `
You are a Lead AI Speech Auditor and Executive Examiner performing STAGE 1 PRESENTATION REASONING ANALYSIS.

PRESENTATION TITLE: "${presentationTitle}"

PRESENTER'S SPOKEN PITCH TRANSCRIPT:
"${spokenTranscript}"

PPT SLIDE KNOWLEDGE MAP CONCEPTS:
${JSON.stringify(concepts, null, 2)}

DETAILED CONCEPT DETAILS & SPECIFICATIONS:
${JSON.stringify(conceptDetails, null, 2)}

STAGE 1 TASK:
Compare the presenter's spoken pitch transcript against the PPT slide concepts.
For EVERY concept in the list, extract:
1. "conceptId": string (e.g. "c_slide2_rev")
2. "conceptTitle": string
3. "slideNumber": number
4. "pptFacts": array of strings (All factual claims, numbers, technologies, specs from the slide)
5. "coveredFacts": array of strings (Facts correctly explained by the presenter during their pitch)
6. "missingFacts": array of strings (Important facts/metrics from the slide completely omitted from pitch)
7. "incorrectFacts": array of strings (What inaccurate statements or misstatements did the presenter make?)
8. "confidenceScore": number (0 to 100 based on pitch clarity and detail)
9. "conceptStatus": string -> MUST be one of: ["incorrect", "skipped", "weak", "strong"]
   - "incorrect": Presenter made false or misleading statements about this slide concept.
   - "skipped": Presenter completely skipped this slide concept during pitch speech.
   - "weak": Presenter mentioned it briefly but omitted key figures/specs.
   - "strong": Presenter thoroughly and accurately explained this concept.
10. "priorityReason": string -> MUST be one of: ["incorrect", "skipped", "weak", "strong-followup"]

CRITICAL STAGE 1 RULE:
Return ONLY structured JSON analysis. Do NOT generate any interview questions!

Return ONLY a valid JSON object matching this schema:
{
  "presentationTitle": "${presentationTitle}",
  "totalConceptsAnalyzed": ${concepts.length},
  "conceptAnalysisList": [
    {
      "conceptId": "c_slide2_rev",
      "conceptTitle": "Intel 5-Year Revenue Trend ($71.9B in 2019 to $63.1B in 2023)",
      "slideNumber": 2,
      "pptFacts": ["2019 $71.9B", "2021 $79.0B", "2023 $63.1B", "Foundry capex investments"],
      "coveredFacts": ["2019 $71.9B", "2021 $79.0B"],
      "missingFacts": ["2023 $63.1B revenue drop", "Foundry capex investments"],
      "incorrectFacts": ["Stated revenue grew continuously every year"],
      "confidenceScore": 30,
      "conceptStatus": "incorrect",
      "priorityReason": "incorrect"
    }
  ]
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text() || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed && Array.isArray(parsed.conceptAnalysisList)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[Stage 1 Analysis Engine Fallback Notice]:', err.message);
    }
  }

  // Fallback Stage 1 Analysis Generator
  const fallbackList = concepts.map((cTitle, idx) => {
    const detailObj = conceptDetails.find(d => (d.topic || d.conceptTitle) === cTitle) || {};
    const slideNum = detailObj.slideNumber || 1;
    const facts = detailObj.details || [`Slide ${slideNum} concept topic`];
    const conceptId = detailObj.conceptId || `c_slide${slideNum}_${idx + 1}`;

    return {
      conceptId,
      conceptTitle: cTitle,
      slideNumber: slideNum,
      pptFacts: facts,
      coveredFacts: [],
      missingFacts: facts,
      incorrectFacts: [],
      confidenceScore: 20,
      conceptStatus: 'skipped',
      priorityReason: 'skipped'
    };
  });

  return {
    presentationTitle,
    analysisMode: 'FALLBACK_ALGORITHMIC',
    totalConceptsAnalyzed: fallbackList.length,
    conceptAnalysisList: fallbackList
  };
};
