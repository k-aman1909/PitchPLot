/**
 * QUESTION MEMORY ENGINE
 * Maintains complete session memory of asked questions, concepts, angles/types, difficulty, & timestamps.
 * Prevents exact duplicates, semantic duplicates, and repeated concept + angle combinations.
 */

export const normalizeQuestion = (str) =>
  String(str || '')
    .toLowerCase()
    .replace(/^(what is|explain|define|can you describe|what do you understand by|describe|detail|outline|tell me about|how would you explain|looking at|regarding|in terms of)/i, '')
    .replace(/[^\w\s]/g, '')
    .trim();

export const isDuplicateQuestion = (newQText, memoryList = [], conceptId = '', questionType = '') => {
  if (!newQText || !memoryList || memoryList.length === 0) return false;

  const normNew = normalizeQuestion(newQText);
  const wordsNew = new Set(normNew.split(/\s+/).filter(w => w.length > 3));

  for (const item of memoryList) {
    const existingText = typeof item === 'string' ? item : (item.questionText || item.question || '');
    if (!existingText) continue;

    const normExisting = normalizeQuestion(existingText);

    // 1. Exact string match or normalized string match
    if (normNew === normExisting || newQText.toLowerCase().trim() === existingText.toLowerCase().trim()) {
      return true;
    }

    // 2. High token overlap match for reworded/paraphrased questions
    const wordsExisting = normExisting.split(/\s+/).filter(w => w.length > 3);
    if (wordsExisting.length > 0 && wordsNew.size > 0) {
      let sharedCount = 0;
      for (const w of wordsExisting) {
        if (wordsNew.has(w)) sharedCount++;
      }
      const overlapRatio = sharedCount / Math.min(wordsExisting.length, wordsNew.size);
      if (overlapRatio >= 0.70 && Math.abs(wordsExisting.length - wordsNew.size) <= 3) {
        return true;
      }
    }

    // 3. Same conceptId + questionType combination check
    if (typeof item === 'object' && item.conceptId && item.questionType) {
      if (conceptId && questionType && item.conceptId === conceptId && item.questionType === questionType) {
        return true;
      }
    }
  }

  return false;
};

export const addToMemory = (questionObj, memoryList = []) => {
  const memoryEntry = {
    questionId: questionObj.questionId || questionObj._id || `q_mem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    conceptId: questionObj.conceptId || `c_node_${Date.now()}`,
    conceptTitle: questionObj.conceptTitle || questionObj.conceptTopic || 'General Concept',
    questionType: questionObj.questionType || 'scenario',
    priorityReason: questionObj.priorityReason || 'weak',
    questionText: questionObj.questionText,
    roundNumber: questionObj.roundNumber || 1,
    timestamp: new Date()
  };

  memoryList.push(memoryEntry);
  return memoryEntry;
};
