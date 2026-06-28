import { API_BASE_URL, API_URL, AUTH_TOKEN_STORAGE_KEY } from '../constants';
import type { AdminUser, AuditLog, AuthForm, AuthUser, BackendPage, LoadOccurrencesOptions, Occurrence, UserProfileForm } from '../types';

async function request(path: string, options?: RequestInit) {
  const headers = new Headers(options?.headers);
  headers.set('Content-Type', 'application/json');
  addAuthHeader(headers);

  const response = await fetch(path, {
    credentials: 'include',
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Sessão expirada');
  }

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('E-mail já cadastrado.');
    }

    if (response.status === 400) {
      throw new Error('Verifique os dados informados.');
    }

    throw new Error(`Erro ${response.status}`);
  }

  return response;
}

export async function getCurrentUser() {
  const headers = new Headers();
  addAuthHeader(headers);

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: 'include',
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<AuthUser>;
}

export async function submitAuth(authMode: 'login' | 'register', authForm: AuthForm) {
  const isRegister = authMode === 'register';
  const response = await request(`${API_BASE_URL}/auth/${isRegister ? 'register' : 'login'}`, {
    method: 'POST',
    body: JSON.stringify(
      isRegister
        ? authForm
        : {
            email: authForm.email,
            password: authForm.password,
          }
    ),
  });

  return response.json() as Promise<AuthUser>;
}

export async function logoutSession() {
  const headers = new Headers();
  addAuthHeader(headers);

  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers,
  });
}

export async function updateCurrentUser(profileForm: UserProfileForm) {
  const response = await request(`${API_BASE_URL}/auth/me`, {
    method: 'PUT',
    body: JSON.stringify({
      name: profileForm.name,
      email: profileForm.email,
      newPassword: profileForm.newPassword || null,
    }),
  });

  return response.json() as Promise<AuthUser>;
}

export async function fetchAdminUsers() {
  const response = await request(`${API_BASE_URL}/admin/users`);
  return response.json() as Promise<AdminUser[]>;
}

export async function fetchAuditLogs() {
  const response = await request(`${API_BASE_URL}/admin/logs?size=50`);
  const data: { content?: AuditLog[] } | AuditLog[] = await response.json();

  return Array.isArray(data) ? data : data.content ?? [];
}

export async function updateAdminUserRole(id: string, role: string) {
  const response = await request(`${API_BASE_URL}/admin/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });

  return response.json() as Promise<AdminUser>;
}

export async function updateAdminUserActive(id: string, active: boolean) {
  const response = await request(`${API_BASE_URL}/admin/users/${id}/active`, {
    method: 'PUT',
    body: JSON.stringify({ active }),
  });

  return response.json() as Promise<AdminUser>;
}

export async function fetchOccurrences(
  filters: { search: string; categoryFilter: string; statusFilter: string },
  _options: LoadOccurrencesOptions = {}
) {
  const params = new URLSearchParams({ size: '50' });

  if (filters.search.trim()) {
    params.append('search', filters.search.trim());
  }

  if (filters.categoryFilter) {
    params.append('category', filters.categoryFilter);
  }

  if (filters.statusFilter) {
    params.append('status', filters.statusFilter);
  }

  const response = await request(`${API_URL}?${params.toString()}`);
  const data: BackendPage | Occurrence[] = await response.json();

  return Array.isArray(data) ? data : data.content ?? [];
}

export async function saveOccurrence(editingId: string | null, form: Occurrence) {
  const isEditing = editingId !== null;
  const url = isEditing ? `${API_URL}/${editingId}` : API_URL;
  const method = isEditing ? 'PUT' : 'POST';
  const payload = isEditing ? { ...form } : { ...form, status: 'ABERTA' };

  await request(url, {
    method,
    body: JSON.stringify(payload),
  });
}

export async function deleteOccurrence(id: string) {
  await request(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
}

function addAuthHeader(headers: Headers) {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
}
