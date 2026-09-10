/**
 * AI INTERVIEW ENGINE - MASTER ENTRY POINT
 * Coordinates Presentation Analysis, Genuine Question Generation,
 * Quality Ranking, and Question Memory Tracking.
 */

import { initCoverageTable } from './conceptCoverageEngine.js';
import { runStage1PresentationAnalysis } from './presentationAnalysisService.js';
import { generateGenuineInterviewQuestions } from './genuineQuestionGenerator.js';
import { extractAndStoreConcepts } from '../geminiService.js';

export const runAIInterviewEngineV2 = async ({
  presentationTitle,
  slides = [],
  slideText = '',
  spokenTranscript = '',
  existingSession = null,
  askedQuestions = [],
  roundNumber = 1,
  count = 20
}) => {
  // 1. Concept Map Extraction & Stage 1 Analysis
  let concepts = existingSession?.concepts || [];
  let conceptDetails = existingSession?.conceptDetails || [];
  let coverageTable = existingSession?.coverageTable || [];
  let stage1AnalysisJson = existingSession?.stage1AnalysisJson || null;

  if (!concepts || concepts.length === 0) {
    try {
      const extracted = await extractAndStoreConcepts({
        presentationTitle,
        slides,
        slideText,
        spokenTranscript
      });
      concepts = extracted.concepts || [];
      conceptDetails = extracted.conceptDetails || [];
    } catch (e) {
      console.warn('[AI Interview Engine] Concept extraction notice:', e.message);
    }
  }

  if (!stage1AnalysisJson && concepts.length > 0) {
    try {
      stage1AnalysisJson = await runStage1PresentationAnalysis({
        presentationTitle,
        concepts,
        conceptDetails,
        spokenTranscript
      });
      coverageTable = initCoverageTable(concepts, conceptDetails, stage1AnalysisJson?.conceptAnalysisList || []);
    } catch (e) {
      console.warn('[AI Interview Engine] Stage 1 reasoning analysis notice:', e.message);
    }
  }

  const askedMemory = existingSession?.askedMemory || askedQuestions || [];

  // 2. Generate Genuine, Presentation-Specific Interview Questions
  const generatedQuestions = await generateGenuineInterviewQuestions({
    presentationTitle,
    slides,
    slideText,
    spokenTranscript,
    askedQuestions: askedMemory,
    roundNumber,
    targetCount: count
  });

  return {
    concepts,
    conceptDetails,
    stage1AnalysisJson,
    coverageTable,
    askedMemory: [...askedMemory, ...generatedQuestions.map(q => q.questionText)],
    questions: generatedQuestions
  };
};

export { generateGenuineInterviewQuestions } from './genuineQuestionGenerator.js';
export { runStage1PresentationAnalysis } from './presentationAnalysisService.js';
export { runStage2QuestionGeneration } from './stage2QuestionGenerator.js';
export { initCoverageTable, getLowestCoverageConcepts } from './conceptCoverageEngine.js';
export { isDuplicateQuestion, addToMemory } from './questionMemoryEngine.js';
export { rankAndFilterQuestions } from './questionRankingEngine.js';
export { selectUnusedType, QUESTION_TYPES } from './interviewAngleEngine.js';
export { cleanQuestionText } from './cleanQuestionText.js';
