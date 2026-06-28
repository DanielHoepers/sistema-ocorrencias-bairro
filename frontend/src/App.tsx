import { FormEvent, useEffect, useState } from 'react';
import { AppLayout } from './components/AppLayout';
import {
  AUTH_USER_STORAGE_KEY,
  emptyAuthForm,
  emptyForm,
  LEGACY_AUTH_STORAGE_KEY,
  OCCURRENCES_STORAGE_KEY,
} from './constants';
import { AdminScreen } from './screens/AdminScreen';
import { AuthScreen } from './screens/AuthScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { LoadingScreen } from './screens/LoadingScreen';
import { OccurrenceFormScreen } from './screens/OccurrenceFormScreen';
import { OccurrenceSearchScreen } from './screens/OccurrenceSearchScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import {
  deleteOccurrence,
  fetchAuditLogs,
  fetchAdminUsers,
  fetchOccurrences,
  getCurrentUser,
  logoutSession,
  saveOccurrence,
  submitAuth,
  updateAdminUserActive,
  updateAdminUserRole,
  updateCurrentUser,
} from './services/api';
import { getCurrentLocationAddress } from './services/location';
import type { AdminUser, AppView, AuditLog, AuthForm, AuthMode, AuthUser, LoadOccurrencesOptions, Occurrence, UserProfileForm } from './types';
import { cacheOccurrences, cacheUser, readCachedOccurrences, readCachedUser } from './utils/cache';

function App() {
  const [user, setUser] = useState<AuthUser | null>(() => readCachedUser());
  const [checkingSession, setCheckingSession] = useState(() => readCachedUser() === null);
  const [activeView, setActiveView] = useState<AppView>('dashboard');

  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authForm, setAuthForm] = useState<AuthForm>(emptyAuthForm);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [profileForm, setProfileForm] = useState<UserProfileForm>(() => profileFormFromUser(readCachedUser()));
  const [profileLoading, setProfileLoading] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminLogs, setAdminLogs] = useState<AuditLog[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminLogsLoading, setAdminLogsLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  const [occurrences, setOccurrences] = useState<Occurrence[]>(() => readCachedOccurrences());
  const [form, setForm] = useState<Occurrence>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationHint, setLocationHint] = useState('');
  const [hasSearched, setHasSearched] = useState(() => readCachedOccurrences().length > 0);

  useEffect(() => {
    async function loadSession() {
      try {
        localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);

        const data = await getCurrentUser();
        if (!data) {
          return;
        }

        cacheUser(data);
        setUser(data);
        setProfileForm(profileFormFromUser(data));
        await loadOccurrences({ keepView: true, silent: true });
      } finally {
        setCheckingSession(false);
      }
    }

    loadSession();
  }, []);

  async function handleAuthSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setAuthLoading(true);
      setAuthError('');

      const data = await submitAuth(authMode, authForm);
      cacheUser(data);
      setUser(data);
      setProfileForm(profileFormFromUser(data));
      setActiveView('dashboard');
      setAuthForm(emptyAuthForm);
      setMessage('');
      await loadOccurrences({ keepView: true, silent: true });
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Não foi possível entrar. Verifique os dados informados.');
    } finally {
      setAuthLoading(false);
    }
  }

  function clearSession() {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    localStorage.removeItem(OCCURRENCES_STORAGE_KEY);
    setUser(null);
    setOccurrences([]);
    setForm(emptyForm);
    setEditingId(null);
    setSearch('');
    setCategoryFilter('');
    setStatusFilter('');
    setError('');
    setMessage('');
    setLocationHint('');
    setProfileForm(profileFormFromUser(null));
    setAdminUsers([]);
    setAdminLogs([]);
    setAdminError('');
    setHasSearched(false);
    setActiveView('dashboard');
  }

  async function logout() {
    try {
      await logoutSession();
    } finally {
      clearSession();
    }
  }

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setProfileLoading(true);
      setError('');
      setMessage('');

      const updatedUser = await updateCurrentUser(profileForm);
      cacheUser(updatedUser);
      setUser(updatedUser);
      setProfileForm(profileFormFromUser(updatedUser));
      setMessage('Dados da conta atualizados com sucesso.');
    } catch (err) {
      if (isSessionExpired(err)) {
        clearSession();
        return;
      }

      setError('Não foi possível atualizar sua conta. Confira os dados informados.');
    } finally {
      setProfileLoading(false);
    }
  }

  async function loadAdminUsers() {
    try {
      setAdminLoading(true);
      setAdminError('');

      const list = await fetchAdminUsers();
      setAdminUsers(list);
    } catch (err) {
      if (isSessionExpired(err)) {
        clearSession();
        return;
      }

      setAdminError('Não foi possível carregar os usuários.');
    } finally {
      setAdminLoading(false);
    }
  }

  async function loadAdminLogs() {
    try {
      setAdminLogsLoading(true);
      setAdminError('');

      const list = await fetchAuditLogs();
      setAdminLogs(list);
    } catch (err) {
      if (isSessionExpired(err)) {
        clearSession();
        return;
      }

      setAdminError('Não foi possível carregar os logs do sistema.');
    } finally {
      setAdminLogsLoading(false);
    }
  }

  async function handleAdminRoleUpdate(id: string, role: string) {
    try {
      setAdminLoading(true);
      setAdminError('');
      setMessage('');

      const updatedUser = await updateAdminUserRole(id, role);
      setAdminUsers((currentUsers) => currentUsers.map((item) => (item.id === updatedUser.id ? updatedUser : item)));
      await loadAdminLogs();
      setMessage('Perfil do usuário atualizado.');
    } catch (err) {
      if (isSessionExpired(err)) {
        clearSession();
        return;
      }

      setAdminError('Não foi possível alterar o perfil do usuário.');
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleAdminActiveToggle(id: string, active: boolean) {
    try {
      setAdminLoading(true);
      setAdminError('');
      setMessage('');

      const updatedUser = await updateAdminUserActive(id, active);
      setAdminUsers((currentUsers) => currentUsers.map((item) => (item.id === updatedUser.id ? updatedUser : item)));
      await loadAdminLogs();
      setMessage(active ? 'Usuário ativado.' : 'Usuário desativado.');
    } catch (err) {
      if (isSessionExpired(err)) {
        clearSession();
        return;
      }

      setAdminError('Não foi possível alterar o status do usuário.');
    } finally {
      setAdminLoading(false);
    }
  }

  async function loadOccurrences(options: LoadOccurrencesOptions = {}) {
    try {
      if (!options.silent) {
        setError('');
        setMessage('');
      }

      const list = await fetchOccurrences({ search, categoryFilter, statusFilter }, options);

      cacheOccurrences(list);
      setOccurrences(list);
      setHasSearched(true);
      if (!options.keepView) {
        setActiveView('search');
      }
    } catch (err) {
      if (isSessionExpired(err)) {
        clearSession();
        return;
      }

      if (!options.silent) {
        setError('Não foi possível carregar as ocorrências.');
      }
      setOccurrences([]);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      const isEditing = editingId !== null;

      setLoading(true);
      setError('');
      setMessage('');
      setLocationHint('');

      await saveOccurrence(editingId, form);

      setForm(emptyForm);
      setEditingId(null);

      if (isEditing) {
        await loadOccurrences();
        setMessage('Ocorrência atualizada com sucesso.');
        setActiveView('search');
      } else {
        setMessage('Ocorrência cadastrada com sucesso.');
        setActiveView('dashboard');
      }
    } catch (err) {
      if (isSessionExpired(err)) {
        clearSession();
        return;
      }

      setError('Não foi possível salvar a ocorrência.');
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(item: Occurrence) {
    setError('');
    setMessage('');
    setForm({
      title: item.title,
      description: item.description,
      category: item.category,
      address: item.address,
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,
      authorName: item.authorName,
      status: item.status,
    });

    setEditingId(item.id ?? null);
    setLocationHint('');
    setActiveView('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setMessage('');
    setLocationHint('');
    setActiveView('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(item: Occurrence) {
    if (!item.id) return;

    const confirmDelete = window.confirm(
      `Excluir a ocorrência "${item.title}"?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmDelete) return;

    try {
      setError('');
      setMessage('');
      await deleteOccurrence(item.id);
      await loadOccurrences();
    } catch (err) {
      if (isSessionExpired(err)) {
        clearSession();
        return;
      }

      setError('Não foi possível excluir a ocorrência.');
    }
  }

  function clearFilters() {
    setSearch('');
    setCategoryFilter('');
    setStatusFilter('');
    setOccurrences([]);
    setHasSearched(false);
    setError('');
    setMessage('');
    setLocationHint('');
  }

  function startNewOccurrence() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setMessage('');
    setLocationHint('');
    setActiveView('new');
  }

  function changeView(view: AppView) {
    setError('');
    setMessage('');
    setLocationHint('');
    setAdminError('');
    setActiveView(view);

    if (view === 'admin' && isAdmin) {
      void loadAdminUsers();
      void loadAdminLogs();
    }
  }

  async function useCurrentLocation() {
    try {
      setLocating(true);
      setError('');
      setLocationHint('Buscando sua localização...');

      const location = await getCurrentLocationAddress();

      setForm((currentForm) => ({
        ...currentForm,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
      }));
      setLocationHint(`Endereço preenchido pela localização. Precisão aproximada: ${location.accuracyLabel}.`);
    } catch (err) {
      setLocationHint(err instanceof Error ? err.message : 'Não foi possível buscar sua localização agora.');
    } finally {
      setLocating(false);
    }
  }

  const isAdmin = user?.role === 'ADMINISTRADOR';
  const viewTitle = getViewTitle(activeView);

  const navItems: Array<{ view: AppView; label: string; symbol: string; adminOnly?: boolean }> = [
    { view: 'dashboard', label: 'Painel', symbol: '⌂' },
    { view: 'new', label: 'Nova ocorrência', symbol: '+' },
    { view: 'search', label: 'Ocorrências', symbol: '⌕' },
    { view: 'admin', label: 'Administração', symbol: '◦', adminOnly: true },
  ];

  if (checkingSession) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <AuthScreen
        authError={authError}
        authForm={authForm}
        authLoading={authLoading}
        authMode={authMode}
        onChangeForm={setAuthForm}
        onChangeMode={(mode) => {
          setAuthMode(mode);
          setAuthError('');
        }}
        onSubmit={handleAuthSubmit}
      />
    );
  }

  return (
    <AppLayout
      activeView={activeView}
      error={error}
      isAdmin={isAdmin}
      message={message}
      navItems={navItems}
      onChangeView={changeView}
      onLogout={logout}
      onOpenProfile={() => changeView('profile')}
      user={user}
      viewTitle={viewTitle}
    >
      {activeView === 'dashboard' && (
        <DashboardScreen
          occurrences={occurrences}
          onChangeView={changeView}
          onStartNewOccurrence={startNewOccurrence}
        />
      )}

      {activeView === 'new' && (
        <OccurrenceFormScreen
          form={form}
          loading={loading}
          mode="create"
          onCancelEdit={cancelEdit}
          onChangeForm={setForm}
          onUseCurrentLocation={useCurrentLocation}
          onSubmit={handleSubmit}
          locating={locating}
          locationHint={locationHint}
        />
      )}

      {activeView === 'edit' && (
        <OccurrenceFormScreen
          form={form}
          loading={loading}
          mode="edit"
          onCancelEdit={cancelEdit}
          onChangeForm={setForm}
          onUseCurrentLocation={useCurrentLocation}
          onSubmit={handleSubmit}
          locating={locating}
          locationHint={locationHint}
        />
      )}

      {activeView === 'search' && (
        <OccurrenceSearchScreen
          categoryFilter={categoryFilter}
          hasSearched={hasSearched}
          occurrences={occurrences}
          onChangeCategoryFilter={setCategoryFilter}
          onChangeSearch={setSearch}
          onChangeStatusFilter={setStatusFilter}
          onClearFilters={clearFilters}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onLoadOccurrences={() => loadOccurrences()}
          onStartNewOccurrence={startNewOccurrence}
          search={search}
          statusFilter={statusFilter}
        />
      )}

      {activeView === 'admin' && (
        <AdminScreen
          adminError={adminError}
          adminLogs={adminLogs}
          adminLogsLoading={adminLogsLoading}
          adminLoading={adminLoading}
          adminUsers={adminUsers}
          isAdmin={isAdmin}
          onLoadUsers={loadAdminUsers}
          onToggleActive={handleAdminActiveToggle}
          onUpdateRole={handleAdminRoleUpdate}
          user={user}
        />
      )}

      {activeView === 'profile' && (
        <ProfileScreen
          form={profileForm}
          loading={profileLoading}
          onChangeForm={setProfileForm}
          onSubmit={handleProfileSubmit}
          user={user}
        />
      )}
    </AppLayout>
  );
}

function getViewTitle(view: AppView) {
  if (view === 'new') return 'Nova ocorrência';
  if (view === 'edit') return 'Editar ocorrência';
  if (view === 'search') return 'Ocorrências';
  if (view === 'admin') return 'Administração';
  if (view === 'profile') return 'Minha conta';
  return 'Painel';
}

function isSessionExpired(error: unknown) {
  return error instanceof Error && error.message === 'Sessão expirada';
}

function profileFormFromUser(user: AuthUser | null): UserProfileForm {
  return {
    name: user?.name ?? '',
    email: user?.email ?? '',
    newPassword: '',
  };
}

export default App;
