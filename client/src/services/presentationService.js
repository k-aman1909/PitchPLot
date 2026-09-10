import api from './api';

export const uploadPresentationFile = async (formData, onUploadProgress) => {
  const response = await api.post('/presentations/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    }
  });
  return response.data;
};

export const fetchUserPresentations = async () => {
  const response = await api.get('/presentations');
  return response.data;
};

export const fetchPresentationById = async (id) => {
  const response = await api.get(`/presentations/${id}`);
  return response.data;
};

export const deletePresentationById = async (id) => {
  const response = await api.delete(`/presentations/${id}`);
  return response.data;
};
