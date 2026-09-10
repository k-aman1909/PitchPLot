import api from './api';

export const generateQuestions = async (
  presentationId,
  reportId,
  spokenTranscript = '',
  count = 20,
  existingQuestions = [],
  roundNumber = 1,
  userWeaknesses = []
) => {
  const response = await api.post('/qa/generate-questions', {
    presentationId,
    reportId,
    spokenTranscript,
    count,
    existingQuestions,
    roundNumber,
    userWeaknesses
  });
  return response.data;
};

export const fetchQuestionsForPresentation = async (presentationId) => {
  const response = await api.get(`/qa/questions/${presentationId}`);
  return response.data;
};

export const submitAnswerEvaluation = async ({ questionId, userTranscript, audioUrl }) => {
  const response = await api.post('/qa/submit-answer', { questionId, userTranscript, audioUrl });
  return response.data;
};

export const fetchUserAnswers = async () => {
  const response = await api.get('/qa/answers');
  return response.data;
};

export const fetchSessionDebug = async (presentationId) => {
  const response = await api.get(`/qa/session-debug/${presentationId}`);
  return response.data;
};
