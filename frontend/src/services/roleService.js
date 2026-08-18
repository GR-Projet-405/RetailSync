import api from './api';

const getAll = async () => {
  const response = await api.get('/role-management');
  return response.data;
};

export default { getAll };