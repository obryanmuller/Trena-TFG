import { ArrowRight, ArrowUpRight, Bell, LogOut, MapPin, Search } from 'lucide-react';
import { NAV_ITEMS } from '../app/config';
import { Avatar } from './ui';

export function AppHeader({ user, unread, onNavigate, onOpenModal, onLogout, onSearch }) {
  const isClient = user?.role === 'client';

  return (
    <>
      <div className="market-announcement">
        Sua próxima reforma começa com uma boa conexão.{' '}
        <button onClick={() => onOpenModal({ type: 'help' })}>
          Conheça a TRENA <ArrowRight size={13} />
        </button>
      </div>
      <header className="topbar">
        <a className="brand" href="#home" onClick={() => onNavigate('home')}>
          <span className="brand-symbol">
            T<i />
          </span>
          <span>
            TRENA<small>CONEXÕES QUE CONSTROEM</small>
          </span>
        </a>
        <form
          className="header-search"
          onSubmit={(event) => {
            event.preventDefault();
            onSearch(new FormData(event.currentTarget).get('term'));
          }}
        >
          <Search size={19} />
          <input
            name="term"
            aria-label="Buscar profissionais no marketplace"
            placeholder="Qual profissional você procura?"
          />
          <button aria-label="Pesquisar profissionais">
            <ArrowRight size={19} />
          </button>
        </form>
        <button
          className="professional-entry"
          onClick={() =>
            user
              ? onNavigate(user.role === 'professional' ? 'services' : 'professionals')
              : onOpenModal({ type: 'auth', mode: 'register', role: 'professional' })
          }
        >
          Sou profissional
        </button>
        <div className="topbar-actions">
          {user ? (
            <>
              <button
                className="icon-button notification-button"
                aria-label={`Notificações, ${unread} não lidas`}
                onClick={() => onOpenModal({ type: 'notifications' })}
              >
                <Bell size={20} />
                {unread > 0 && <b>{unread}</b>}
              </button>
              <span className="divider" />
              <button
                className="account"
                aria-label={'Editar perfil de ' + user.name}
                onClick={() => onOpenModal({ type: 'profile' })}
              >
                <Avatar name={user.name} />
                <span>
                  {user.name.split(' ')[0]}
                  <small>{isClient ? 'Cliente' : 'Profissional'}</small>
                </span>
              </button>
              <button className="icon-button" aria-label="Sair da conta" onClick={onLogout}>
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <button
              className="button small"
              onClick={() => onOpenModal({ type: 'auth', mode: 'login' })}
            >
              Entrar na minha conta <ArrowUpRight size={16} />
            </button>
          )}
        </div>
      </header>
    </>
  );
}

export function AppNavigation({ page, user, unread, onNavigate }) {
  return (
    <div className="market-nav">
      <nav aria-label="Navegação principal">
        {NAV_ITEMS.map(([route, label, Icon]) => (
          <button
            key={route}
            aria-current={page === route ? 'page' : undefined}
            className={page === route ? 'nav-item active' : 'nav-item'}
            onClick={() => onNavigate(route, ['mine', 'chat'].includes(route))}
          >
            <Icon size={17} />
            {label}
            {route === 'chat' && unread > 0 && <span className="nav-count">{unread}</span>}
          </button>
        ))}
      </nav>
      <span>
        <MapPin size={15} />
        {user?.city || 'Encontre na sua região'}
      </span>
    </div>
  );
}

export function AppFooter() {
  return (
    <footer>
      <a className="footer-brand" href="#home">
        TRENA<span>Precisão. Conexão. Construção.</span>
      </a>
      <span>Protótipo acadêmico · TFG · UNIFEI</span>
    </footer>
  );
}
