/**
 * QUESTION RANKING & SANITY CHECK ENGINE
 * Evaluates candidate questions, scores directness and quality, and filters out prompt leaks.
 */

export const scoreQuestionQuality = (qObj) => {
  if (!qObj || !qObj.questionText) return 0;
  let score = 50; // Base score

  const text = qObj.questionText;
  const wordCount = text.split(/\s+/).length;

  // 1. Natural question length preference: 7 to 25 words is the ideal human interviewer length
  if (wordCount >= 7 && wordCount <= 25) {
    score += 30;
  } else if (wordCount > 25 && wordCount <= 40) {
    score += 15;
  } else if (wordCount > 45) {
    // Heavy penalty for overly verbose questions with dumped text
    score -= 40;
  }

  // 2. Strong penalty for AI leakage phrases
  if (
    /analyzing\s+slide/i.test(text) ||
    /how\s+operational\s+mechanics/i.test(text) ||
    /under\s+high\s+volume\s+traffic/i.test(text) ||
    /concept\s+['"]/i.test(text) ||
    /applying\s+technical/i.test(text)
  ) {
    score -= 200;
  }

  // 3. Reward clear question starters (Why, How, What, In what way, Can you explain)
  if (/^(why|how|what|in what way|could you explain|what factors|can you describe)\b/i.test(text.trim())) {
    score += 20;
  }

  // 4. Reward priority reason (incorrect & skipped items get slight boost)
  if (qObj.priorityReason === 'incorrect') score += 25;
  if (qObj.priorityReason === 'skipped') score += 15;

  return score;
};

/**
 * SANITY CHECK: Verifies that a question is a valid, clean question and not a placeholder or prompt leak.
 */
export const isTraceableToPresentationAnalysis = (qObj) => {
  if (!qObj || !qObj.questionText) return false;

  const text = qObj.questionText.toLowerCase().trim();

  // Reject questions containing raw template leakage
  if (
    text.includes('analyzing slide') ||
    text.includes('how operational mechanics') ||
    text.includes('under high volume traffic') ||
    text.includes('what technical trade-offs arise when applying')
  ) {
    return false;
  }

  // Must have a question mark and at least 5 words
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 5) return false;

  return true;
};

export const rankAndFilterQuestions = (candidatePool = [], targetCount = 20) => {
  const saneCandidates = candidatePool.filter(q => isTraceableToPresentationAnalysis(q));
  const poolToRank = saneCandidates.length > 0 ? saneCandidates : candidatePool;

  const scored = poolToRank.map(q => ({
    question: q,
    score: scoreQuestionQuality(q)
  }));

  // Sort descending by quality score
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, targetCount).map(item => item.question);
};
