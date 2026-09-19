// Central place for all backend calls.
// Same-origin by default in prod: Next rewrites "/api" -> backend service,
// so the browser never calls the backend port directly.
// Locally, falls back to http://localhost:5002.
// To point at a backend elsewhere, set NEXT_PUBLIC_API_URL.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? ''
    : 'http://localhost:5002');

const TOKEN_KEY = 'cafe_token';

// --- Auth token helpers (JWT stored in localStorage) ---
export function getToken() {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (typeof window === 'undefined') return;
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable — app still works for this session */
  }
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Small helper: builds "?city=X&tag=Y&minRating=Z" from a filters object
function toQueryString(filters = {}) {
  const params = new URLSearchParams();
  if (filters.city) params.append('city', filters.city);
  if (filters.tag) params.append('tag', filters.tag);
  if (filters.minRating) params.append('minRating', filters.minRating);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

// Unwraps { success, data } and throws a readable error on failure
async function handleResponse(res) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    const msg = body.message || `Request failed with status ${res.status}`;
    const err = new Error(msg);
    err.details = body.errors;
    throw err;
  }
  return body.data;
}

// GET /api/cafes?city=&tag=&minRating= — always resolves to an array,
// so list pages can never crash on unexpected payloads.
export async function getCafes(filters = {}) {
  const res = await fetch(`${API_BASE_URL}/api/cafes${toQueryString(filters)}`, {
    headers: { ...authHeaders() },
  });
  const data = await handleResponse(res);
  return Array.isArray(data) ? data : [];
}

// GET /api/cafes/:id — single cafe (used by the Edit page)
export async function getCafe(id) {
  const res = await fetch(`${API_BASE_URL}/api/cafes/${id}`, {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

// POST /api/cafes
export async function createCafe(data) {
  const res = await fetch(`${API_BASE_URL}/api/cafes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// PUT /api/cafes/:id
export async function updateCafe(id, data) {
  const res = await fetch(`${API_BASE_URL}/api/cafes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// DELETE /api/cafes/:id (soft delete on the server)
export async function deleteCafe(id) {
  const res = await fetch(`${API_BASE_URL}/api/cafes/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

// POST /api/auth/register — { name, email, password } -> { user, token }
export async function registerUser(data) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// POST /api/auth/login — { email, password } -> { user, token }
export async function loginUser(data) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// GET /api/auth/me — current user from the stored token
export async function fetchMe() {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

// POST /api/uploads — multipart { files[], cafeId } (login required)
export async function uploadFiles(cafeId, files) {
  const fd = new FormData();
  fd.append('cafeId', cafeId);
  [...files].forEach((f) => fd.append('files', f));
  const res = await fetch(`${API_BASE_URL}/api/uploads`, {
    method: 'POST',
    headers: { ...authHeaders() }, // no Content-Type: browser sets multipart boundary
    body: fd,
  });
  return handleResponse(res);
}

// GET /api/uploads?cafeId=… — file metadata (no binary)
export async function listFiles(cafeId) {
  const res = await fetch(`${API_BASE_URL}/api/uploads?cafeId=${cafeId}`, {
    headers: { ...authHeaders() },
  });
  const data = await handleResponse(res);
  return Array.isArray(data) ? data : [];
}

// Direct URLs (plain <a> links — GET is public, no token needed)
export function fileViewUrl(id) {
  return `${API_BASE_URL}/api/uploads/${id}`;
}
export function fileDownloadUrl(id) {
  return `${API_BASE_URL}/api/uploads/${id}?download=1`;
}

// DELETE /api/uploads/:id (login required)
export async function deleteFile(id) {
  const res = await fetch(`${API_BASE_URL}/api/uploads/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

// Pretty size: 900 -> "900 B", 2048 -> "2 KB", 3.5MB -> "3.5 MB"
export function prettySize(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

// Emoji icon per file kind
export function fileIcon(mimetype = '') {
  if (mimetype.startsWith('image/')) return '🖼️';
  if (mimetype === 'application/pdf') return '📕';
  if (mimetype.includes('spreadsheet') || mimetype.includes('excel') || mimetype === 'text/csv')
    return '📊';
  if (mimetype.includes('word') || mimetype.includes('msword')) return '📝';
  return '📄';
}
