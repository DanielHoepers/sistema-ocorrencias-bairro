import type { AuthForm, Occurrence } from './types';

export const API_BASE_URL = getApiBaseUrl();
export const API_URL = `${API_BASE_URL}/occurrences`;

export const LEGACY_AUTH_STORAGE_KEY = 'bairro.auth';
export const AUTH_USER_STORAGE_KEY = 'bairro.user';
export const AUTH_TOKEN_STORAGE_KEY = 'bairro.token';
export const OCCURRENCES_STORAGE_KEY = 'bairro.occurrences';

export const emptyForm: Occurrence = {
  title: '',
  description: '',
  category: 'Infraestrutura',
  address: '',
  latitude: null,
  longitude: null,
  authorName: '',
  status: 'ABERTA',
};

export const emptyAuthForm: AuthForm = {
  name: '',
  email: '',
  password: '',
};

export const categories = ['Infraestrutura', 'Iluminação', 'Limpeza', 'Segurança', 'Outros'];

export const statusOptions = [
  { value: 'ABERTA', label: 'Aberta' },
  { value: 'EM_ANALISE', label: 'Em análise' },
  { value: 'RESOLVIDA', label: 'Resolvida' },
  { value: 'ARQUIVADA', label: 'Arquivada' },
];

function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL;

  if (typeof window === 'undefined') {
    return configuredUrl || 'http://localhost:8080/api';
  }

  if (configuredUrl && !shouldUseBrowserHost(configuredUrl)) {
    return configuredUrl;
  }

  return `${window.location.protocol}//${window.location.hostname}:8080/api`;
}

function shouldUseBrowserHost(configuredUrl: string) {
  const browserHost = window.location.hostname;

  if (browserHost === 'localhost' || browserHost === '127.0.0.1') {
    return false;
  }

  try {
    const apiUrl = new URL(configuredUrl);
    return apiUrl.hostname === 'localhost' || apiUrl.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}
