export const FILLER_WORDS_LIST = [
  'um', 'uh', 'ah', 'er', 'like', 'you know', 'basically', 'so', 'actually', 'honestly', 'literally', 'sort of', 'kind of', 'i mean'
];

export const detectFillerWords = (text) => {
  if (!text) return { count: 0, breakdown: {}, words: [] };

  const regex = new RegExp(`\\b(${FILLER_WORDS_LIST.join('|')})\\b`, 'gi');
  const matches = text.match(regex) || [];
  
  const breakdown = {};
  matches.forEach(m => {
    const word = m.toLowerCase();
    breakdown[word] = (breakdown[word] || 0) + 1;
  });

  return {
    count: matches.length,
    breakdown,
    matches
  };
};
