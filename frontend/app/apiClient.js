const API_BASE_URL = 'http://localhost:5002';

const buildQueryString = (filters) => {
  const params = new URLSearchParams();
  if (filters.city) params.append('city', filters.city);
  if (filters.tag) params.append('tag', filters.tag);
  if (filters.minRating) params.append('minRating', filters.minRating);
  return params.toString();
};

export const getCafes = async (filters = {}) => {
  const queryString = buildQueryString(filters);
  const url = `${API_BASE_URL}/api/cafes${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch cafes');
  }
  
  return data.data;
};

export const createCafe = async (cafeData) => {
  const response = await fetch(`${API_BASE_URL}/api/cafes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cafeData),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to create cafe');
  }
  
  return data.data;
};

export const updateCafe = async (id, cafeData) => {
  const response = await fetch(`${API_BASE_URL}/api/cafes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cafeData),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to update cafe');
  }
  
  return data.data;
};

export const deleteCafe = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/cafes/${id}`, {
    method: 'DELETE',
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to delete cafe');
  }
  
  return data.data;
};