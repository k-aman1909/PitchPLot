/**
 * CONCEPT COVERAGE ENGINE
 * Tracks concept coverage %, questions asked per concept, and interview angles used.
 */

export const initCoverageTable = (concepts = [], conceptDetails = [], speechCoverageMap = []) => {
  const detailsMap = new Map();
  if (Array.isArray(conceptDetails)) {
    conceptDetails.forEach(d => {
      const key = (d.topic || d.conceptTitle || '').toLowerCase().trim();
      if (key) detailsMap.set(key, d);
    });
  }

  const speechMap = new Map();
  if (Array.isArray(speechCoverageMap)) {
    speechCoverageMap.forEach(s => {
      const key = (s.conceptTitle || '').toLowerCase().trim();
      if (key) speechMap.set(key, s);
    });
  }

  return (concepts || []).map((cTitle, idx) => {
    const normKey = String(cTitle).toLowerCase().trim();
    const detailObj = detailsMap.get(normKey) || {};
    const speechObj = speechMap.get(normKey) || {};

    const status = speechObj.explanationStatus || detailObj.explanationStatus || 'Not Explained';
    let priorityLevel = 1;
    if (status === 'Partially Explained') priorityLevel = 2;
    if (status === 'Fully Explained') priorityLevel = 3;

    return {
      conceptId: detailObj.conceptId || `c_${idx + 1}_${Date.now()}`,
      conceptTitle: cTitle,
      slideNumber: detailObj.slideNumber || 1,
      details: detailObj.details || [],
      explanationStatus: status,
      confidenceScore: speechObj.confidenceScore !== undefined ? speechObj.confidenceScore : 0,
      priorityLevel,
      coveragePercent: 0,
      questionsAsked: 0,
      interviewAnglesUsed: []
    };
  });
};

export const updateCoverage = (coverageTable = [], conceptTitle = '', angleLabel = '') => {
  const normTarget = String(conceptTitle).toLowerCase().trim();
  let item = coverageTable.find(c => String(c.conceptTitle).toLowerCase().trim() === normTarget);

  if (!item) {
    // Search for partial topic match
    item = coverageTable.find(c => normTarget.includes(String(c.conceptTitle).toLowerCase().trim()) || String(c.conceptTitle).toLowerCase().trim().includes(normTarget));
  }

  if (item) {
    item.questionsAsked += 1;
    if (angleLabel && !item.interviewAnglesUsed.includes(angleLabel)) {
      item.interviewAnglesUsed.push(angleLabel);
    }
    // 2 questions = 100% coverage
    item.coveragePercent = Math.min(100, Math.round((item.questionsAsked / 2) * 100));
  }

  return coverageTable;
};

export const getLowestCoverageConcepts = (coverageTable = []) => {
  return [...coverageTable].sort((a, b) => {
    // 1. Sort by Priority Level (Priority 1: Not Explained -> Priority 2: Partially Explained -> Priority 3: Fully Explained)
    if (a.priorityLevel !== b.priorityLevel) {
      return a.priorityLevel - b.priorityLevel;
    }
    // 2. Sort by Coverage Percent ascending
    if (a.coveragePercent !== b.coveragePercent) {
      return a.coveragePercent - b.coveragePercent;
    }
    // 3. Sort by Questions Asked ascending
    return a.questionsAsked - b.questionsAsked;
  });
};
