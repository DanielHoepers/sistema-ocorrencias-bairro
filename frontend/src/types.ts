export type OccurrenceStatus = 'ABERTA' | 'EM_ANALISE' | 'RESOLVIDA' | 'ARQUIVADA';

export type Occurrence = {
  id?: string;
  title: string;
  description: string;
  category: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  authorName?: string;
  ownedByCurrentUser?: boolean;
  canManage?: boolean;
  status: OccurrenceStatus | string;
  createdAt?: string;
};

export type BackendPage = {
  content?: Occurrence[];
  totalElements?: number;
};

export type AuthUser = {
  name: string;
  email: string;
  role: string;
};

export type AuthForm = {
  name: string;
  email: string;
  password: string;
};

export type UserProfileForm = {
  name: string;
  email: string;
  newPassword: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
};

export type AuditLog = {
  id: string;
  tableName: string;
  action: string;
  recordId?: string | null;
  userName: string;
  userEmail: string;
  details?: string | null;
  createdAt: string;
};

export type AppView = 'dashboard' | 'new' | 'edit' | 'search' | 'admin' | 'profile';

export type AuthMode = 'login' | 'register';

export type LoadOccurrencesOptions = {
  keepView?: boolean;
  silent?: boolean;
};
