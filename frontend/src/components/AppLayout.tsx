import { useState, type ReactNode } from 'react';
import { BrandLogo } from './BrandLogo';
import type { AppView, AuthUser } from '../types';

type NavItem = {
  view: AppView;
  label: string;
  symbol: string;
  adminOnly?: boolean;
};

type AppLayoutProps = {
  activeView: AppView;
  children: ReactNode;
  error: string;
  isAdmin: boolean;
  message: string;
  navItems: NavItem[];
  onChangeView: (view: AppView) => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  user: AuthUser;
  viewTitle: string;
};

export function AppLayout({
  activeView,
  children,
  error,
  isAdmin,
  message,
  navItems,
  onChangeView,
  onLogout,
  onOpenProfile,
  user,
  viewTitle,
}: AppLayoutProps) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  function openProfile() {
    setAccountMenuOpen(false);
    onOpenProfile();
  }

  function logoutFromMenu() {
    setAccountMenuOpen(false);
    onLogout();
  }

  return (
    <div className="appFrame">
      <aside className="sidebar">
        <div className="sidebarBrand">
          <BrandLogo />
          <div>
            <strong>Ocorrências</strong>
            <small>Bairro</small>
          </div>
        </div>

        <nav className="sideNav" aria-label="Navegação principal">
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => (
              <button
                key={item.view}
                type="button"
                className={
                  activeView === item.view || (activeView === 'edit' && item.view === 'search')
                    ? 'navItem active'
                    : 'navItem'
                }
                onClick={() => onChangeView(item.view)}
              >
                <span className="navSymbol">{item.symbol}</span>
                <span>{item.label}</span>
              </button>
            ))}
        </nav>

      </aside>

      <div className="mainArea">
        <header className="topBar">
          <div>
            <p className="breadcrumb">Sistema comunitário</p>
            <h1>{viewTitle}</h1>
          </div>

          <div className="accountMenuWrap">
            <button
              type="button"
              className="accountBox accountButton"
              aria-expanded={accountMenuOpen}
              aria-haspopup="menu"
              onClick={() => setAccountMenuOpen((isOpen) => !isOpen)}
            >
              <span>{user.name}</span>
              <strong>{isAdmin ? 'Administrador' : 'Morador'}</strong>
            </button>

            {accountMenuOpen && (
              <div className="accountMenu" role="menu">
                <button type="button" role="menuitem" onClick={openProfile}>
                  Minha conta
                </button>
                <button type="button" role="menuitem" className="dangerMenuItem" onClick={logoutFromMenu}>
                  Sair
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="workspace">
          {error && <div className="alertBox danger">{error}</div>}
          {message && <div className="alertBox success">{message}</div>}
          {children}
        </main>
      </div>
    </div>
  );
}
