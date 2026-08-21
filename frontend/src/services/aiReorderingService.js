import api from "./api";

export const getDetails = async () => {
  const response = await api.get("/ai-reordering");

  return response.data;
};

export const getRecommendations = async (params = {}) => {
  const response = await api.get(
    "/ai-reordering/recommendations",
    {
      params,
    }
  );

  return response.data;
};

export const generateRecommendations = async (data) => {
  const response = await api.post(
    "/ai-reordering/generate",
    data
  );

  return response.data;
};

export const getRecommendationById = async (id) => {
  const response = await api.get(
    `/ai-reordering/recommendations/${id}`
  );

  return response.data;
};

export const updateRecommendationStatus = async (
  id,
  data
) => {
  const response = await api.patch(
    `/ai-reordering/recommendations/${id}/status`,
    data
  );

  return response.data;
};

export const convertToPurchaseOrder = async (
  id,
  data
) => {
  const response = await api.post(
    `/ai-reordering/recommendations/${id}/convert-to-po`,
    data
  );

  return response.data;
};


// Future implementation- currently not implemented in backend

/*export const getInventoryPredictions = async (params = {}) => {
  const response = await api.get(
    "/ai-reordering/predictions",
    {
      params,
    }
  );

  return response.data;
};
*/