import api from './api';

export const generateFeedbackReport = async ({ presentationId, transcript, durationSeconds }) => {
  const response = await api.post('/reports/generate', {
    presentationId,
    transcript,
    durationSeconds
  });
  return response.data;
};

export const fetchUserReports = async () => {
  const response = await api.get('/reports');
  return response.data;
};

export const fetchReportById = async (id) => {
  const response = await api.get(`/reports/${id}`);
  return response.data;
};
