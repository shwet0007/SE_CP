import api from './client';

export const fetchAppointments = async (params = {}) => {
  const { data } = await api.get('/appointments', { params });
  return data;
};

export const createAppointment = async (payload) => {
  const { data } = await api.post('/appointments', payload);
  return data;
};

export const updateAppointment = async (id, payload) => {
  const { data } = await api.patch(`/appointments/${id}`, payload);
  return data;
};

export const deleteAppointment = async (id) => {
  await api.delete(`/appointments/${id}`);
};
