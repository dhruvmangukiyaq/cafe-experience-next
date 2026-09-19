const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? ''
    : 'http://localhost:5002');

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

  return Array.isArray(data.data) ? data.data : [];
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

// --- Uploads (optional: only works if backend exposes /api/uploads) ---
export const uploadFiles = async (cafeId, files) => {
  const fd = new FormData();
  fd.append('cafeId', cafeId);
  [...files].forEach((f) => fd.append('files', f));
  const response = await fetch(`${API_BASE_URL}/api/uploads`, {
    method: 'POST',
    body: fd,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Upload failed');
  }
  return data.data;
};

export const listFiles = async (cafeId) => {
  const response = await fetch(`${API_BASE_URL}/api/uploads?cafeId=${cafeId}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Failed to list files');
  }
  return Array.isArray(data.data) ? data.data : [];
};

export const fileViewUrl = (id) => `${API_BASE_URL}/api/uploads/${id}`;

export const deleteFile = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/uploads/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Delete failed');
  }
  return data.data;
};

export function prettySize(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileIcon(mimetype = '') {
  if (mimetype.startsWith('image/')) return '🖼️';
  if (mimetype === 'application/pdf') return '📕';
  if (mimetype.includes('spreadsheet') || mimetype.includes('excel') || mimetype === 'text/csv')
    return '📊';
  if (mimetype.includes('word') || mimetype.includes('msword')) return '📝';
  return '📄';
}