import type { FormEvent } from 'react';
import { BrandLogo } from '../components/BrandLogo';
import type { AuthForm, AuthMode } from '../types';

type AuthScreenProps = {
  authError: string;
  authForm: AuthForm;
  authLoading: boolean;
  authMode: AuthMode;
  onChangeForm: (form: AuthForm) => void;
  onChangeMode: (mode: AuthMode) => void;
  onSubmit: (event: FormEvent) => void;
};

export function AuthScreen({
  authError,
  authForm,
  authLoading,
  authMode,
  onChangeForm,
  onChangeMode,
  onSubmit,
}: AuthScreenProps) {
  return (
    <main className="authShell">
      <section className="loginPanel">
        <div className="loginIntro">
          <BrandLogo />
          <p className="systemLabel">Sistema comunitário</p>
          <h1>Ocorrências do Bairro</h1>
          <p className="mutedText">Acesse para registrar e acompanhar solicitações do bairro.</p>
        </div>

        <form className="loginForm" onSubmit={onSubmit}>
          <div className="segmentedControl">
            <button type="button" className={authMode === 'login' ? 'segment active' : 'segment'} onClick={() => onChangeMode('login')}>
              Entrar
            </button>

            <button type="button" className={authMode === 'register' ? 'segment active' : 'segment'} onClick={() => onChangeMode('register')}>
              Cadastrar
            </button>
          </div>

          {authMode === 'register' && (
            <label>
              Nome
              <input
                value={authForm.name}
                onChange={(event) => onChangeForm({ ...authForm, name: event.target.value })}
                placeholder="Seu nome"
                minLength={2}
                maxLength={120}
                required
              />
            </label>
          )}

          <label>
            E-mail
            <input
              type="email"
              value={authForm.email}
              onChange={(event) => onChangeForm({ ...authForm, email: event.target.value })}
              placeholder="voce@email.com"
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              value={authForm.password}
              onChange={(event) => onChangeForm({ ...authForm, password: event.target.value })}
              placeholder="Mínimo de 8 caracteres"
              minLength={8}
              required
            />
          </label>

          {authError && <div className="alertBox danger">{authError}</div>}

          <button type="submit" className="primaryButton wideButton" disabled={authLoading}>
            {authLoading ? 'Aguarde...' : authMode === 'register' ? 'Criar conta' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}
