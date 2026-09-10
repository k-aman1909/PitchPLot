import { selectUnusedAngle } from './interviewAngleEngine.js';
import { updateCoverage } from './conceptCoverageEngine.js';
import { isDuplicateQuestion, addToMemory } from './questionMemoryEngine.js';
import { rankAndFilterQuestions } from './questionRankingEngine.js';
import { cleanQuestionText } from './cleanQuestionText.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

let aiInstance = null;
const getAIModel = () => {
  if (!aiInstance && process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      aiInstance = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    } catch (e) {
      console.warn('[Gemini AI Engine V2] Initialization notice:', e.message);
    }
  }
  return aiInstance;
};

/**
 * Generates TWO targeted interview questions for a single concept using natural conversational angles.
 */
export const generateQuestionsForSingleConcept = async ({
  presentationTitle,
  conceptObj,
  angle1,
  angle2,
  spokenTranscript = '',
  askedMemory = []
}) => {
  const model = getAIModel();
  const cTitle = conceptObj.conceptTitle || conceptObj.topic || 'Presentation Topic';
  const cDetails = conceptObj.details || [];
  const slideNum = conceptObj.slideNumber || 1;
  const cleanTitle = cTitle.replace(/^slide\s*\d+\s*[:\-]\s*/i, '').trim();

  if (model) {
    try {
      const prompt = `
You are SlideSense, an intelligent AI interviewer conducting a presentation Q&A session for "${presentationTitle}".

Your task is to generate TWO high-quality questions based on the user's ACTUAL uploaded presentation slide and the user's ACTUAL presentation speech.

You are NOT a generic interview-question generator.
You are NOT a keyword-to-question generator.
You are NOT supposed to invent questions simply because a concept sounds technical or important.
Never expose concept labels or internal AI reasoning in the question text.

============================================================
INPUT DATA
============================================================

Presentation Title: ${presentationTitle}
Current Slide Number: ${slideNum}
Current Slide Topic: "${cleanTitle}"
Facts & Content:
${JSON.stringify(cDetails, null, 2)}
Presenter's Spoken Transcript: "${spokenTranscript && spokenTranscript.length > 10 ? spokenTranscript : 'Direct Q&A Mode'}"
Question 1 Target Angle: "${angle1.label}" (${angle1.category})
Question 2 Target Angle: "${angle2.label}" (${angle2.category})

============================================================
MASTER INTERVIEWER QUALITY RULES
============================================================
1. Ask clean, direct, natural questions like a human interviewer, professor, or project reviewer.
2. Ground questions ONLY in the provided presentation content and speaker transcript.
3. DO NOT repeat the slide text word-for-word. Test UNDERSTANDING, WHY decisions were made, and HOW solutions work.
4. DO NOT invent technical or business buzzwords (e.g. scalability, microservices, ROI, high-volume traffic) unless actually present on this slide.
5. NO internal AI language (e.g., "Analyzing Slide...", "Based on the concept...", "Core priority").
6. The question should sound natural when spoken aloud (10-30 words).

Return ONLY a valid JSON array of 2 objects:
[
  {
    "conceptTopic": "${cleanTitle}",
    "questionText": "Direct interviewer question 1...",
    "category": "${angle1.category}",
    "difficulty": "Medium",
    "slideNumber": ${slideNum},
    "interviewerPersona": "Presentation Judge",
    "angle": "${angle1.label}",
    "idealAnswerHint": "Core points for a strong answer.",
    "expectedKeyPoints": ["Key point 1", "Key point 2"]
  },
  {
    "conceptTopic": "${cleanTitle}",
    "questionText": "Direct interviewer question 2...",
    "category": "${angle2.category}",
    "difficulty": "Hard",
    "slideNumber": ${slideNum},
    "interviewerPersona": "Executive Panelist",
    "angle": "${angle2.label}",
    "idealAnswerHint": "Core points for a strong answer.",
    "expectedKeyPoints": ["Key point 1", "Key point 2"]
  }
]
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text() || '';

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const cleaned = parsed.map(q => ({
          ...q,
          questionText: cleanQuestionText(q.questionText, cleanTitle, slideNum)
        }));
        return {
          rawText: text,
          prompt,
          parsed: cleaned
        };
      }
    } catch (err) {
      console.warn(`[Gemini Engine V2 Concept '${cleanTitle}' Fallback]:`, err.message);
    }
  }

  // Fallback natural questions
  const sampleFact = Array.isArray(cDetails) && cDetails.length > 0
    ? cDetails[0].replace(/^[\s•\-\*]+/, '').trim()
    : cleanTitle;

  return {
    rawText: 'FALLBACK_GENERATED',
    prompt: 'FALLBACK_PROMPT',
    parsed: [
      {
        conceptTopic: cleanTitle,
        questionText: cleanQuestionText(`Why did you choose this specific approach for ${cleanTitle}?`, cleanTitle, slideNum),
        category: angle1.category,
        difficulty: 'Medium',
        slideNumber: slideNum,
        interviewerPersona: 'Presentation Judge',
        angle: angle1.label,
        idealAnswerHint: `Explain the strategic reasoning behind ${cleanTitle}.`,
        expectedKeyPoints: [`Strategic choice`, `Expected impact`]
      },
      {
        conceptTopic: cleanTitle,
        questionText: cleanQuestionText(`What practical challenges or risks do you expect when implementing ${sampleFact}?`, cleanTitle, slideNum),
        category: angle2.category,
        difficulty: 'Hard',
        slideNumber: slideNum,
        interviewerPersona: 'Executive Panelist',
        angle: angle2.label,
        idealAnswerHint: `Discuss risk factors and execution feasibility for ${sampleFact}.`,
        expectedKeyPoints: [`Risk assessment`, `Implementation plan`]
      }
    ]
  };
};

/**
 * ITERATIVE QUESTION GENERATION ENGINE
 */
export const generateIterativeQuestions = async ({
  presentationTitle,
  targetConcepts = [],
  coverageTable = [],
  spokenTranscript = '',
  askedMemory = [],
  targetCount = 20
}) => {
  const candidatePool = [];

  for (const conceptObj of targetConcepts) {
    const usedAngles = conceptObj.interviewAnglesUsed || [];
    const angle1 = selectUnusedAngle(usedAngles);
    const angle2 = selectUnusedAngle([...usedAngles, angle1.id]);

    const generatedResult = await generateQuestionsForSingleConcept({
      presentationTitle,
      conceptObj,
      angle1,
      angle2,
      spokenTranscript,
      askedMemory: [...askedMemory, ...candidatePool.map(q => q.questionText)]
    });

    const generatedTwo = generatedResult.parsed || [];

    for (const q of generatedTwo) {
      if (!isDuplicateQuestion(q.questionText, [...askedMemory, ...candidatePool.map(c => c.questionText)])) {
        candidatePool.push(q);
        updateCoverage(coverageTable, conceptObj.conceptTitle || conceptObj.topic, q.angle || angle1.label);
      }
    }

    if (candidatePool.length >= targetCount * 1.5) break;
  }

  const bestQuestions = rankAndFilterQuestions(candidatePool, targetCount);

  bestQuestions.forEach(q => {
    addToMemory(q, askedMemory);
  });

  return {
    questions: bestQuestions,
    coverageTable,
    askedMemory
  };
};
