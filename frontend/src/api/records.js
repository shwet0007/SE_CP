import api from './client';

export const fetchRecords = async (params = {}) => {
  const { data } = await api.get('/records', { params });
  return data;
};

export const createRecord = async (payload) => {
  const { data } = await api.post('/records', payload);
  return data;
};

export const updateRecord = async (id, payload) => {
  const { data } = await api.patch(`/records/${id}`, payload);
  return data;
};
