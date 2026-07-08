import api from './api';

export const createContactMessage = async (payload) => {
  const response = await api.post('/contact-support', payload);
  return response.data.data;
};

export const getContactMessages = async () => {
  const response = await api.get('/contact-support');
  return response.data.data;
};