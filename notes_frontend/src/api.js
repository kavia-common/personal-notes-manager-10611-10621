//
// All backend API calls for notes, auth, and profile.
// Handles RESTful communication with the Django backend.
//

const API_BASE = process.env.REACT_APP_API_BASE || '/api';

// Helper for including credentials securely
function getAuthHeaders(token) {
  return token
    ? {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    : { 'Content-Type': 'application/json' };
}

// PUBLIC_INTERFACE
export async function login(username, password) {
  /** Authenticate user, returns {token}. */
  const response = await fetch(`${API_BASE}/login/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error('Login failed');
  return await response.json();
}

// PUBLIC_INTERFACE
export async function register(username, password) {
  /** Register and logs in a new user. Returns {token}. */
  const response = await fetch(`${API_BASE}/register/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error('Registration failed');
  return await response.json();
}

// PUBLIC_INTERFACE
export async function logout(token) {
  /** Log out current user, requires token. */
  const response = await fetch(`${API_BASE}/logout/`, {
    method: 'POST',
    headers: getAuthHeaders(token),
  });
  if (!response.ok) throw new Error('Logout failed');
  return true;
}

// PUBLIC_INTERFACE
export async function fetchNotes(token, { search = '', ordering = '', page = 1, page_size = 20 } = {}) {
  /** Fetch paginated list of notes, supports search/filter. */
  let url = `${API_BASE}/notes/?search=${encodeURIComponent(search)}&ordering=${ordering}&page=${page}&page_size=${page_size}`;
  const response = await fetch(url, {
    headers: getAuthHeaders(token),
  });
  if (!response.ok) throw new Error('Failed to retrieve notes');
  return await response.json();
}

// PUBLIC_INTERFACE
export async function fetchNote(token, noteId) {
  /** Get a single note by ID. */
  const response = await fetch(`${API_BASE}/notes/${noteId}/`, {
    headers: getAuthHeaders(token),
  });
  if (!response.ok) throw new Error('Failed to retrieve note');
  return await response.json();
}

// PUBLIC_INTERFACE
export async function createNote(token, data) {
  /** Create a note. Returns created note. */
  const response = await fetch(`${API_BASE}/notes/`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create note');
  return await response.json();
}

// PUBLIC_INTERFACE
export async function updateNote(token, noteId, data) {
  /** Update (PUT) a note by ID. */
  const response = await fetch(`${API_BASE}/notes/${noteId}/`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update note');
  return await response.json();
}

// PUBLIC_INTERFACE
export async function deleteNote(token, noteId) {
  /** Delete note by ID. */
  const response = await fetch(`${API_BASE}/notes/${noteId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  if (!response.ok) throw new Error('Failed to delete note');
  return true;
}

// PUBLIC_INTERFACE
export async function getProfile(token) {
  /** Get logged-in user's profile. */
  const response = await fetch(`${API_BASE}/profile/`, {
    headers: getAuthHeaders(token),
  });
  if (!response.ok) throw new Error('Failed to get user profile');
  return await response.json();
}

// PUBLIC_INTERFACE
export async function updateProfile(token, data) {
  /** Update profile for current user. */
  const response = await fetch(`${API_BASE}/profile/`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return await response.json();
}
