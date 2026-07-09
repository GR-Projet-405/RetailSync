import api from './api';

const getAll = async () => {
  const response = await api.get('/branch-management');
  return response.data;
};

export default { getAll };