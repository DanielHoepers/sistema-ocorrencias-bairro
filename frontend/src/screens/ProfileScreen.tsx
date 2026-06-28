import type { FormEvent } from 'react';
import type { AuthUser, UserProfileForm } from '../types';

type ProfileScreenProps = {
  form: UserProfileForm;
  loading: boolean;
  onChangeForm: (form: UserProfileForm) => void;
  onSubmit: (event: FormEvent) => void;
  user: AuthUser;
};

export function ProfileScreen({ form, loading, onChangeForm, onSubmit, user }: ProfileScreenProps) {
  return (
    <section className="workPanel profilePanel">
      <div className="sectionHeader">
        <div>
          <p className="sectionKicker">Usuário</p>
          <h2>Minha conta</h2>
        </div>
      </div>

      <form className="recordForm" onSubmit={onSubmit}>
        <div className="profileSummary">
          <div>
            <span>Perfil</span>
            <strong>{user.role === 'ADMINISTRADOR' ? 'Administrador' : 'Morador'}</strong>
          </div>
          <div>
            <span>Sessão</span>
            <strong>Ativa</strong>
          </div>
        </div>

        <div className="formColumns">
          <label>
            Nome
            <input
              value={form.name}
              onChange={(event) => onChangeForm({ ...form, name: event.target.value })}
              placeholder="Seu nome"
              minLength={2}
              maxLength={120}
              required
            />
          </label>

          <label>
            E-mail
            <input
              type="email"
              value={form.email}
              onChange={(event) => onChangeForm({ ...form, email: event.target.value })}
              placeholder="voce@email.com"
              maxLength={180}
              required
            />
          </label>
        </div>

        <div className="passwordBox">
          <h3>Trocar senha</h3>
          <p>Preencha apenas se quiser definir uma nova senha.</p>

          <label>
            Nova senha
            <input
              type="password"
              value={form.newPassword}
              onChange={(event) => onChangeForm({ ...form, newPassword: event.target.value })}
              placeholder="Mínimo de 8 caracteres"
              minLength={8}
              autoComplete="new-password"
            />
          </label>
        </div>

        <div className="formActions">
          <button type="submit" className="primaryButton" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar minha conta'}
          </button>
        </div>
      </form>
    </section>
  );
}
