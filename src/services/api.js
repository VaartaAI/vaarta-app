import { loadToken } from './authStorage';

const API_BASE = process.env.API_URL || 'https://vaarta-api-ozic.onrender.com';
const API_KEY = process.env.API_KEY || '';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (API_KEY) headers['X-API-Key'] = API_KEY;

  const token = await loadToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body.detail || body.message || message;
    } catch {}
    throw new ApiError(response.status, message);
  }

  return response.json();
}

export const getFeed = (category = 'all', page = 1, pageSize = 20) => {
  let query = `page=${page}&page_size=${pageSize}`;
  if (category && category !== 'all') query += `&category=${category}`;
  return request(`/feed?${query}`);
};

export const getStory = (clusterId) => request(`/story/${clusterId}`);

export const searchFeed = (query, page = 1, pageSize = 20) => {
  return request(`/search?q=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`);
};

// ── Auth ────────────────────────────────────────────────────────
export const loginWithGoogle = (idToken) =>
  request('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ id_token: idToken }),
  });

export const fetchMe = () => request('/auth/me');

// ── Preferences ─────────────────────────────────────────────────
export const fetchPreferences = () => request('/me/preferences');

export const updatePreferences = (categories) =>
  request('/me/preferences', {
    method: 'PUT',
    body: JSON.stringify({ categories }),
  });

// ── Bookmarks ───────────────────────────────────────────────────
export const fetchBookmarkIds = () => request('/me/bookmarks/ids');

export const fetchBookmarks = (page = 1, pageSize = 20) =>
  request(`/me/bookmarks?page=${page}&page_size=${pageSize}`);

export const addBookmark = (clusterId) =>
  request('/me/bookmarks', {
    method: 'POST',
    body: JSON.stringify({ cluster_id: clusterId }),
  });

export const removeBookmark = (clusterId) =>
  request(`/me/bookmarks/${clusterId}`, { method: 'DELETE' });
