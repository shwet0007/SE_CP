import api from './client';

export const fetchAvailability = async (params = {}) => {
  const { data } = await api.get('/availability', { params });
  return data;
};

export const createAvailability = async (payload) => {
  const { data } = await api.post('/availability', payload);
  return data;
};

export const deleteAvailability = async (id) => {
  await api.delete(`/availability/${id}`);
};
