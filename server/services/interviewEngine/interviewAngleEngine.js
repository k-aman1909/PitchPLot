/**
 * INTERVIEW ANGLE ENGINE
 * Manages question angles and categories for realistic presentation viva & Q&A.
 */

export const QUESTION_TYPES = [
  { id: 'why', label: 'Why & Strategy', category: 'Strategic Decision' },
  { id: 'how', label: 'Practical Execution', category: 'Implementation' },
  { id: 'problem_solving', label: 'Problem Solving & Scenarios', category: 'Scenario' },
  { id: 'limitation', label: 'Limitations & Trade-offs', category: 'Critical Thinking' },
  { id: 'decision', label: 'Key Decisions & Assumptions', category: 'Decision Making' },
  { id: 'followup', label: 'Presentation Follow-up', category: 'Follow-up' },
  { id: 'understanding', label: 'Core Concept Clarity', category: 'Understanding' },
  { id: 'impact', label: 'Value & Impact', category: 'Outcome & Metrics' }
];

export const selectUnusedType = (usedTypes = []) => {
  const normUsed = (usedTypes || []).map(t => String(t).toLowerCase());
  const unused = QUESTION_TYPES.filter(type => 
    !normUsed.includes(type.id.toLowerCase()) && !normUsed.includes(type.label.toLowerCase())
  );

  if (unused.length > 0) {
    return unused[Math.floor(Math.random() * unused.length)];
  }
  return QUESTION_TYPES[Math.floor(Math.random() * QUESTION_TYPES.length)];
};

export const selectUnusedAngle = selectUnusedType;
