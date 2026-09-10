/**
 * STAGE 2 INTERVIEW GENERATOR: STAGE 2 QUESTION GENERATOR
 * Generates direct, natural, human interviewer questions grounded strictly in the
 * uploaded presentation slides and user pitch transcript.
 */

import { selectUnusedType } from './interviewAngleEngine.js';
import { updateCoverage } from './conceptCoverageEngine.js';
import { isDuplicateQuestion, addToMemory } from './questionMemoryEngine.js';
import { rankAndFilterQuestions } from './questionRankingEngine.js';
import { cleanQuestionText, generateCleanFallbackQuestion } from './cleanQuestionText.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

let aiInstance = null;
const getAIModel = () => {
  if (!aiInstance && process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      aiInstance = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    } catch (e) {
      console.warn('[Stage 2 Question Generator] Notice:', e.message);
    }
  }
  return aiInstance;
};

/**
 * Prioritizes Stage 1 concept items by status:
 * Priority 1: "incorrect" (Presenter misstated something)
 * Priority 2: "skipped" (Presenter skipped key slide point)
 * Priority 3: "weak" (Presenter was brief)
 * Priority 4: "strong-followup" (Presenter explained well, ask advanced follow-up)
 */
export const prioritizeStage1AnalysisList = (conceptAnalysisList = []) => {
  const statusPriority = {
    'incorrect': 1,
    'skipped': 2,
    'weak': 3,
    'strong': 4,
    'strong-followup': 4
  };

  return [...conceptAnalysisList].sort((a, b) => {
    const pA = statusPriority[a.priorityReason || a.conceptStatus] || 2;
    const pB = statusPriority[b.priorityReason || b.conceptStatus] || 2;
    if (pA !== pB) return pA - pB;
    return (a.confidenceScore || 0) - (b.confidenceScore || 0);
  });
};

/**
 * Generates structured questions for a single Stage 1 concept item.
 */
export const generateStage2QuestionsForConcept = async ({
  presentationTitle,
  stage1Item,
  qType1,
  qType2,
  askedMemory = [],
  roundNumber = 1
}) => {
  const model = getAIModel();
  const cTitle = stage1Item.conceptTitle || `Slide ${stage1Item.slideNumber} Topic`;
  const cId = stage1Item.conceptId || `c_node_${Date.now()}`;
  const slideNum = stage1Item.slideNumber || 1;
  const priorityReason = stage1Item.priorityReason || stage1Item.conceptStatus || 'weak';
  const factsList = stage1Item.pptFacts || stage1Item.details || [];
  const cleanTitle = cTitle.replace(/^slide\s*\d+\s*[:\-]\s*/i, '').trim();

  if (model) {
    try {
      const prompt = `
You are a real human interviewer (professor, investor, manager, judge) listening to a presentation with the user's uploaded presentation slides in front of you.

Your task is to ask TWO DIRECT, NATURAL questions about the slide topic below.

PRESENTATION TITLE: "${presentationTitle}"
SLIDE NUMBER: ${slideNum}
SLIDE TOPIC: "${cleanTitle}"
KEY FACTS ON THIS SLIDE:
${JSON.stringify(factsList, null, 2)}
PRESENTER'S REMARKS / ACCURACY: ${JSON.stringify(stage1Item.incorrectFacts?.length > 0 ? stage1Item.incorrectFacts : stage1Item.coveredFacts || [])}

GOLDEN RULES FOR QUESTION GENERATION:
1. Speak like a real human interviewer in a live Q&A session.
2. Ask direct, natural, conversational questions.
3. Base questions ONLY on the provided slide topic, facts, and presentation remarks.
4. STRICTLY FORBIDDEN:
   - Do NOT say "Analyzing Slide X", "Looking at Slide X concept...", "Regarding concept..."
   - Do NOT paste bullet point dumps or parenthesized lists into the question text.
   - Do NOT use internal phrases like "applying How Operational Mechanics", "under high volume traffic", "technical trade-offs" (unless the slide is specifically about high traffic or system architecture).
   - Do NOT expose JSON keys or framework labels.
5. Examples of GOOD direct questions:
   - "How would your app build trust among new users?"
   - "Why did you choose reviews and testimonials as a solution to the trust problem?"
   - "How would the trial period help convince users to continue using the app?"
   - "What would you do if users continued using the trial but did not convert to paid customers?"
   - "Why did you decide to target this specific customer segment first?"
   - "What is the biggest practical challenge in executing this strategy?"

Generate Question 1 focusing on: "${qType1.label}" (${qType1.category})
Generate Question 2 focusing on: "${qType2.label}" (${qType2.category})

Return ONLY a valid JSON array of 2 objects:
[
  {
    "questionId": "q_${Date.now()}_1",
    "conceptId": "${cId}",
    "conceptTitle": "${cleanTitle}",
    "questionType": "${qType1.id}",
    "priorityReason": "${priorityReason}",
    "questionText": "Direct, natural interviewer question 1...",
    "category": "${qType1.category}",
    "difficulty": "Medium",
    "slideNumber": ${slideNum},
    "interviewerPersona": "Presentation Judge",
    "roundNumber": ${roundNumber},
    "idealAnswerHint": "Clear key points to address in response.",
    "expectedKeyPoints": ["Key point 1", "Key point 2"]
  },
  {
    "questionId": "q_${Date.now()}_2",
    "conceptId": "${cId}",
    "conceptTitle": "${cleanTitle}",
    "questionType": "${qType2.id}",
    "priorityReason": "${priorityReason}",
    "questionText": "Direct, natural interviewer question 2...",
    "category": "${qType2.category}",
    "difficulty": "Hard",
    "slideNumber": ${slideNum},
    "interviewerPersona": "Executive Panelist",
    "roundNumber": ${roundNumber},
    "idealAnswerHint": "Clear key points to address in response.",
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

        return cleaned.filter(q => q.questionText && !isDuplicateQuestion(q.questionText, askedMemory, cId, q.questionType));
      }
    } catch (err) {
      console.warn(`[Stage 2 Question Generator '${cleanTitle}' Notice]:`, err.message);
    }
  }

  // Fallback: Generate genuine, professional interviewer questions
  const cleanFacts = (Array.isArray(factsList) ? factsList : [])
    .map(f => f.replace(/^[\s•\-\*:]+/, '').trim())
    .filter(f => f.length > 3 && !/^[:\s\-*?]+$/.test(f) && !/^(submitted to|submitted by|thank you|reg no|roll no)/i.test(f));

  const sampleFact = cleanFacts.length > 0 ? cleanFacts[0] : '';
  const secondaryFact = cleanFacts.length > 1 ? cleanFacts[1] : '';

  let fallbackQ1 = '';
  if (/limitation|problem|issue|risk|error/i.test(cleanTitle)) {
    fallbackQ1 = sampleFact
      ? `Why is "${sampleFact}" particularly difficult to manage in ${cleanTitle}?`
      : `What are the most critical risks and limitations associated with ${cleanTitle}?`;
  } else if (/solution|architecture|model|platform|trust/i.test(cleanTitle)) {
    fallbackQ1 = sampleFact
      ? `How does "${sampleFact}" directly help solve the challenges of ${cleanTitle}?`
      : `Why did you choose this specific approach to address ${cleanTitle}?`;
  } else {
    fallbackQ1 = sampleFact
      ? `How does "${sampleFact}" contribute to the overall goals of ${cleanTitle}?`
      : `Why did you prioritize ${cleanTitle} in your presentation?`;
  }

  let fallbackQ2 = '';
  if (secondaryFact) {
    fallbackQ2 = `What are the primary operational challenges your team would face when executing "${secondaryFact}"?`;
  } else {
    fallbackQ2 = `What alternative approaches did you evaluate before deciding on your strategy for ${cleanTitle}?`;
  }

  return [
    {
      questionId: `q_fb_${Date.now()}_1`,
      conceptId: cId,
      conceptTitle: cleanTitle,
      questionType: qType1.id,
      priorityReason: priorityReason,
      questionText: cleanQuestionText(fallbackQ1, cleanTitle, slideNum),
      roundNumber: roundNumber,
      category: qType1.category,
      difficulty: 'Medium',
      slideNumber: slideNum,
      interviewerPersona: 'Presentation Judge',
      idealAnswerHint: `Explain the strategic justification and practical reasoning for ${cleanTitle}.`,
      expectedKeyPoints: ['Strategic justification', 'Practical reasoning']
    },
    {
      questionId: `q_fb_${Date.now()}_2`,
      conceptId: cId,
      conceptTitle: cleanTitle,
      questionType: qType2.id,
      priorityReason: priorityReason,
      questionText: cleanQuestionText(fallbackQ2, cleanTitle, slideNum),
      roundNumber: roundNumber,
      category: qType2.category,
      difficulty: 'Hard',
      slideNumber: slideNum,
      interviewerPersona: 'Executive Panelist',
      idealAnswerHint: `Discuss operational execution, trade-offs, and alternative solutions for ${cleanTitle}.`,
      expectedKeyPoints: ['Execution feasibility', 'Alternative trade-offs']
    }
  ];
};

/**
 * Generates Cross-Concept Relationship Questions when individual concepts are completed.
 */
export const generateCrossConceptQuestions = async ({
  presentationTitle,
  conceptAnalysisList = [],
  askedMemory = [],
  roundNumber = 2,
  neededCount = 5
}) => {
  const model = getAIModel();
  if (model && conceptAnalysisList.length >= 2) {
    try {
      const prompt = `
You are a senior panelist conducting a presentation Q&A session for "${presentationTitle}".
Generate ${neededCount} direct, natural questions that evaluate how different parts of the presentation connect together.

SLIDE CONCEPTS FROM PRESENTATION:
${JSON.stringify(conceptAnalysisList.slice(0, 10).map(c => ({ slide: c.slideNumber, topic: c.conceptTitle, facts: c.pptFacts })), null, 2)}

RULES:
1. Ask natural, direct questions connecting two related points from the presentation.
2. NO "Analyzing Slide X", NO bullet dumps, NO fake buzzwords.
3. Examples of GOOD questions:
   - "How does your pricing model on the business slide align with the target customer profile you introduced earlier?"
   - "How will the technical architecture you presented support the growth targets outlined in your roadmap?"

Return ONLY a valid JSON array of ${neededCount} objects:
[
  {
    "questionId": "q_cross_${Date.now()}_1",
    "conceptId": "c_cross_integrated",
    "conceptTitle": "Cross-Slide Integration",
    "questionType": "followup",
    "priorityReason": "strong-followup",
    "questionText": "Direct, natural cross-concept question...",
    "category": "Cross-Slide Strategy",
    "difficulty": "Hard",
    "slideNumber": 1,
    "interviewerPersona": "Executive Panelist",
    "roundNumber": ${roundNumber},
    "idealAnswerHint": "Synthesize the relationship between presentation sections.",
    "expectedKeyPoints": ["Strategic alignment", "Cross-functional impact"]
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
          questionText: cleanQuestionText(q.questionText, q.conceptTitle, q.slideNumber || 1)
        }));
        return cleaned.filter(q => q.questionText && !isDuplicateQuestion(q.questionText, askedMemory));
      }
    } catch (e) {
      console.warn('[Cross Concept Generator Notice]:', e.message);
    }
  }

  return [];
};

/**
 * STAGE 2 MASTER GENERATOR: Takes Stage 1 JSON Analysis & synthesizes prioritized questions.
 */
export const runStage2QuestionGeneration = async ({
  stage1AnalysisJson,
  coverageTable = [],
  askedMemory = [],
  targetCount = 20,
  roundNumber = 1
}) => {
  const presentationTitle = stage1AnalysisJson?.presentationTitle || 'Presentation Q&A';
  const conceptList = stage1AnalysisJson?.conceptAnalysisList || [];
  const candidatePool = [];

  // Prioritize concepts: incorrect > skipped > weak > strong
  const prioritizedConcepts = prioritizeStage1AnalysisList(conceptList);

  for (const item of prioritizedConcepts) {
    const qType1 = selectUnusedType([]);
    const qType2 = selectUnusedType([qType1.id]);

    const questions = await generateStage2QuestionsForConcept({
      presentationTitle,
      stage1Item: item,
      qType1,
      qType2,
      askedMemory: [...askedMemory, ...candidatePool.map(q => q.questionText)],
      roundNumber
    });

    for (const q of questions) {
      if (!isDuplicateQuestion(q.questionText, [...askedMemory, ...candidatePool.map(c => c.questionText)])) {
        candidatePool.push(q);
        updateCoverage(coverageTable, item.conceptTitle, q.category);
      }
    }

    if (candidatePool.length >= targetCount * 1.5) break;
  }

  // If we still need more questions, generate cross-concept follow-ups
  if (candidatePool.length < targetCount) {
    const needed = targetCount - candidatePool.length;
    const crossQuestions = await generateCrossConceptQuestions({
      presentationTitle,
      conceptAnalysisList: prioritizedConcepts,
      askedMemory: [...askedMemory, ...candidatePool.map(q => q.questionText)],
      roundNumber,
      neededCount: Math.min(needed, 5)
    });

    for (const cq of crossQuestions) {
      if (!isDuplicateQuestion(cq.questionText, [...askedMemory, ...candidatePool.map(c => c.questionText)])) {
        candidatePool.push(cq);
      }
    }
  }

  // Clean, rank, and select the top questions
  const sanitizedPool = candidatePool.map(q => ({
    ...q,
    questionText: cleanQuestionText(q.questionText, q.conceptTitle, q.slideNumber || 1)
  }));

  const bestQuestions = rankAndFilterQuestions(sanitizedPool, targetCount);

  // Store in memory
  bestQuestions.forEach(q => {
    addToMemory(q, askedMemory);
  });

  return {
    questions: bestQuestions,
    coverageTable,
    askedMemory
  };
};
