import api from './client';

export const fetchPrescriptions = async (params = {}) => {
  const { data } = await api.get('/prescriptions', { params });
  return data;
};

export const createPrescription = async (payload) => {
  const { data } = await api.post('/prescriptions', payload);
  return data;
};
