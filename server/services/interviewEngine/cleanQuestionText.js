/**
 * CLEAN QUESTION TEXT SANITIZER
 * Strips internal AI prompts, analysis tags, metadata prefixes, framework names,
 * and bullet point dumps to ensure the question is a direct, natural human interviewer question.
 */

export function cleanQuestionText(rawText, fallbackConcept = '', slideNumber = 1) {
  if (!rawText || typeof rawText !== 'string') {
    return generateCleanFallbackQuestion(fallbackConcept, slideNumber);
  }

  let text = rawText.trim();

  // 1. Remove JSON markdown or code fences
  text = text.replace(/^```(json)?\s*/i, '').replace(/\s*```$/i, '');

  // 2. Remove quotation marks around the entire string if present
  text = text.replace(/^["'`]+|["'`]+$/g, '').trim();

  // 3. Remove prefixes like "Question 1:", "Q1:", "Interviewer:", "Slide 5 Question:", etc.
  text = text.replace(/^(question\s*\d*\s*[:\-]|q\s*\d*\s*[:\-]|interviewer\s*[:\-]|examiner\s*[:\-]|slide\s*\d+\s*(question|prompt)?\s*[:\-])\s*/i, '');
  text = text.replace(/^(as an interviewer|as the examiner|as a judge|here is a question|based on slide \d+[,:]?)\s*[:,\-]?\s*/i, '');

  // 4. Remove internal analysis wrappers like: "Analyzing Slide X concept '...'" or "Looking at Slide X..."
  text = text.replace(/^analyzing\s+slide\s+\d+\s+(concept\s+)?['"][^'"]*['"]\s*(\([^)]*\))?,?\s*/i, '');
  text = text.replace(/^looking\s+at\s+(slide\s+\d+\s+)?['"][^'"]*['"]\s*(\([^)]*\))?,?\s*/i, '');
  text = text.replace(/^on\s+slide\s+\d+\s+['"][^'"]*['"],?\s*(your presentation highlights\s+[^.]*\.\s*)?/i, '');
  text = text.replace(/^regarding\s+slide\s+\d+\s+concept\s+['"][^'"]*['"],?\s*/i, '');

  // 5. Remove internal framework phrases like "applying How Operational Mechanics", "under high volume traffic", "core priority"
  text = text.replace(/applying\s+(how\s+)?operational\s+mechanics\s*(under\s+high\s+volume\s+traffic)?/gi, 'implementing this in practice');
  text = text.replace(/applying\s+technical\s+&\s+business\s+trade-offs?\s*(under\s+high\s+volume\s+traffic)?/gi, 'evaluating the key trade-offs');
  text = text.replace(/applying\s+why\s+strategic\s+choice/gi, 'making this strategic choice');
  text = text.replace(/from\s+a\s+(how\s+)?operational\s+mechanics\s+perspective/gi, 'in terms of day-to-day execution');
  text = text.replace(/from\s+a\s+strategic\s+rationale\s+perspective/gi, 'strategically');
  text = text.replace(/under\s+high\s+volume\s+traffic/gi, 'at scale');
  text = text.replace(/as\s+a\s+core\s+priority\s+for/gi, 'for');

  // 6. Remove internal slide label dumps like 'Slide 5: Problems And Solutions'
  text = text.replace(/slide\s+\d+:\s*/gi, '');

  // 7. Remove parenthesized bullet point dumps e.g. (Trust Issues:, Research: ..., Trial: ...)
  text = text.replace(/\([A-Za-z0-9\s,:\-–.—]+\)/g, (match) => {
    if (match.includes(':') && (match.includes(',') || match.length > 40)) {
      return '';
    }
    return match;
  });

  // 8. Strip corrupted punctuation like '":"', '": "', '???'
  text = text.replace(/["']\s*[:\-\*]+\s*["']/g, '');
  text = text.replace(/\s*[:\-\*]+\s*(as|for|in|to)\b/gi, ' $1');

  // 9. Clean up excess whitespace and punctuation
  text = text.replace(/\s+/g, ' ').replace(/\s+([?,.])/g, '$1').trim();

  // 10. Capitalize first letter
  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  // 11. Ensure question ends with '?'
  if (text.length > 0 && !text.endsWith('?')) {
    text = text.replace(/[.,;!]+$/, '') + '?';
  }

  // 12. Check for corrupted keywords or insufficient length
  if (
    text.length < 15 ||
    /undefined|null|NaN|\?\?\?|:::+/i.test(text) ||
    /analyzing\s+slide/i.test(text) ||
    /concept\s+['"]/i.test(text) ||
    /what technical trade-offs arise when applying/i.test(text)
  ) {
    return generateCleanFallbackQuestion(fallbackConcept, slideNumber);
  }

  return text;
}

/**
 * Generates a natural, direct interviewer question from concept/slide data.
 */
export function generateCleanFallbackQuestion(conceptTitle = '', slideNumber = 1) {
  let cleanTitle = String(conceptTitle || '')
    .replace(/^slide\s*\d+\s*[:\-]\s*/i, '')
    .replace(/^[\s•\-\*:]+/, '')
    .trim();

  if (!cleanTitle || cleanTitle.length < 3) {
    cleanTitle = `the approach presented on Slide ${slideNumber}`;
  }

  const templates = [
    `Why did you choose this specific approach for ${cleanTitle}?`,
    `How does ${cleanTitle} directly address the core problem you identified?`,
    `What are the most significant operational challenges in executing ${cleanTitle}?`,
    `How would you measure whether ${cleanTitle} is succeeding in practice?`,
    `What alternative solutions did you consider before deciding on ${cleanTitle}?`,
    `What would be your next step if ${cleanTitle} does not achieve the expected outcome?`,
    `What is the main limitation of your current approach for ${cleanTitle}?`
  ];

  const hash = Math.abs(cleanTitle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + slideNumber);
  return templates[hash % templates.length];
}
