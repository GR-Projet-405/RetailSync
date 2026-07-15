import api from './api';

const getAll = async () => {
  const response = await api.get('/branch-management', { params: { limit: 1000 } });
  return response.data;
};

export default { getAll };
