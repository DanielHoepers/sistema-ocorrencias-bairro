import { AUTH_USER_STORAGE_KEY, OCCURRENCES_STORAGE_KEY } from '../constants';
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
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
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
