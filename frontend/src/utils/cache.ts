import { AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY, OCCURRENCES_STORAGE_KEY } from '../constants';
import type { AuthUser, Occurrence } from '../types';

export function readCachedUser() {
  const cached = localStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!cached) {
    return null;
  }

  try {
    return JSON.parse(cached) as AuthUser;
  } catch {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return null;
  }
}

export function cacheUser(user: AuthUser) {
  const { token: _token, ...safeUser } = user;
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(safeUser));
}

export function readCachedToken() {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function cacheAuthToken(token?: string | null) {
  if (!token) {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    return;
  }

  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function clearAuthCache() {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  localStorage.removeItem(OCCURRENCES_STORAGE_KEY);
}

export function readCachedOccurrences() {
  const cached = localStorage.getItem(OCCURRENCES_STORAGE_KEY);

  if (!cached) {
    return [];
  }

  try {
    return JSON.parse(cached) as Occurrence[];
  } catch {
    localStorage.removeItem(OCCURRENCES_STORAGE_KEY);
    return [];
  }
}

export function cacheOccurrences(occurrences: Occurrence[]) {
  localStorage.setItem(OCCURRENCES_STORAGE_KEY, JSON.stringify(occurrences));
}
