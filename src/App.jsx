import { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { api } from './app/api';
import { getRoute } from './app/formatters';
import AppModal from './components/AppModal';
import { AppFooter, AppHeader, AppNavigation } from './components/AppShell';
import ChatPage from './pages/ChatPage';
import HomePage from './pages/HomePage';
import MarketplacePage from './pages/MarketplacePage';

const EMPTY_FILTERS = { query: '', category: '', city: '', status: '' };

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState(getRoute);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [mine, setMine] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState([]);
  const [authMode, setAuthMode] = useState('login');
  const [authRole, setAuthRole] = useState('client');
  const [photos, setPhotos] = useState([]);
  const messageEnd = useRef();
  const isClient = user?.role === 'client';
  const unread = notifications.filter((item) => !item.is_read).length;

  async function refresh(currentUser = user) {
    const [serviceList, professionalList] = await Promise.all([
      api('/services'),
      api('/professionals'),
    ]);
    setServices(serviceList);
    setProfessionals(professionalList);
    if (currentUser) {
      const [myServices, conversationList, notificationList] = await Promise.all([
        api('/services?mine=1'),
        api('/conversations'),
        api('/notifications'),
      ]);
      setMine(myServices);
      setConversations(conversationList);
      setNotifications(notificationList);
    }
  }

  useEffect(() => {
    api('/auth/me')
      .then(async ({ user: currentUser }) => {
        setUser(currentUser);
        await refresh(currentUser);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setReady(true));
    const syncRoute = () => setPage(getRoute());
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    const timer = setInterval(async () => {
      try {
        const [conversationList, notificationList] = await Promise.all([
          api('/conversations'),
          api('/notifications'),
        ]);
        if (active) {
          setConversations(conversationList);
          setNotifications(notificationList);
        }
      } catch {}
    }, 4000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!selectedChat || page !== 'chat' || !user) return undefined;
    let active = true;
    const load = () =>
      api(`/conversations/${selectedChat}/messages`)
        .then((data) => active && setMessages(data))
        .catch((requestError) => active && setError(requestError.message));
    load();
    const timer = setInterval(load, 3000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [selectedChat, page, user?.id]);

  useEffect(() => messageEnd.current?.scrollIntoView({ block: 'nearest' }), [messages.length]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  function openModal(nextModal) {
    setError('');
    if (nextModal.mode) setAuthMode(nextModal.mode);
    if (nextModal.role) setAuthRole(nextModal.role);
    setPhotos(nextModal.type === 'profile' ? user?.portfolio || [] : []);
    setModal(nextModal);
  }

  function navigate(nextPage, protectedRoute = false, currentUser = user) {
    if (protectedRoute && !currentUser) return openModal({ type: 'auth', mode: 'login' });
    refresh(currentUser).catch((requestError) => setError(requestError.message));
    location.hash = nextPage;
    setPage(nextPage);
    setFilters(EMPTY_FILTERS);
  }

  function requireAuth(action) {
    if (!user) return openModal({ type: 'auth', mode: 'login' });
    action();
  }

  async function run(action) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  const formData = (event) => Object.fromEntries(new FormData(event.currentTarget));

  async function handleAuth(event) {
    event.preventDefault();
    const data = formData(event);
    await run(async () => {
      const result = await api('/auth/' + authMode, 'POST', { ...data, role: authRole });
      setUser(result.user);
      await refresh(result.user);
      setModal(null);
      setToast(`Bem-vindo, ${result.user.name.split(' ')[0]}!`);
    });
  }

  async function handleLogout() {
    await run(async () => {
      await api('/auth/logout', 'POST', {});
      setUser(null);
      setMine([]);
      setConversations([]);
      setNotifications([]);
      setSelectedChat(null);
      setMessages([]);
      navigate('home', false, null);
    });
  }

  async function handleCreateService(event) {
    event.preventDefault();
    const data = formData(event);
    await run(async () => {
      const result = await api('/services', 'POST', {
        ...data,
        images: photos,
        professional_id: modal.professional?.id,
      });
      await refresh();
      setModal(null);
      if (result.conversation) setSelectedChat(result.conversation);
      navigate(result.conversation ? 'chat' : 'mine');
      setToast('Solicitação criada. Sua próxima obra já começou!');
    });
  }

  function handleInterest(service) {
    requireAuth(() =>
      run(async () => {
        const result = await api(`/services/${service.id}/interest`, 'POST', {});
        await refresh();
        setSelectedChat(result.conversation);
        setMessages([]);
        setModal(null);
        navigate('chat');
      }),
    );
  }

  async function handleViewProfessional(professional) {
    await run(async () =>
      openModal({
        type: 'professional',
        professional: await api('/professionals/' + professional.id),
      }),
    );
  }

  async function handleChangeStatus(serviceId, status, professionalId) {
    await run(async () => {
      await api(`/services/${serviceId}/status`, 'PATCH', {
        status,
        professional_id: professionalId,
      });
      await refresh();
      setModal(null);
      setToast(
        status === 'completed'
          ? 'Serviço concluído. Agora você pode avaliar!'
          : 'Contratação confirmada. Bom trabalho!',
      );
    });
  }

  async function handleSendMessage(event) {
    event.preventDefault();
    await run(async () => {
      await api(`/conversations/${selectedChat}/messages`, 'POST', {
        text: message,
        image: attachment[0],
      });
      setMessage('');
      setAttachment([]);
      setMessages(await api(`/conversations/${selectedChat}/messages`));
      await refresh();
    });
  }

  async function handleUpdateProfile(event) {
    event.preventDefault();
    const data = formData(event);
    await run(async () => {
      const result = await api('/profile', 'PATCH', { ...data, portfolio: photos });
      setUser(result.user);
      await refresh(result.user);
      setModal(null);
      setToast('Perfil atualizado.');
    });
  }

  async function handleReview(event, serviceId) {
    event.preventDefault();
    const data = formData(event);
    await run(async () => {
      await api(`/services/${serviceId}/reviews`, 'POST', data);
      await refresh();
      setModal(null);
      setToast('Avaliação publicada. Obrigado por compartilhar!');
    });
  }

  async function handleMarkNotificationsRead() {
    await run(async () => {
      await api('/notifications/read', 'PATCH', {});
      setNotifications(await api('/notifications'));
    });
  }

  function openNotification(notification) {
    if (notification.conversation_id) {
      setSelectedChat(notification.conversation_id);
      setMessages([]);
      navigate('chat');
    } else navigate('mine');
    setModal(null);
  }

  function selectChat(id) {
    setSelectedChat(id);
    setMessages([]);
    setMessage('');
    setAttachment([]);
  }

  function openServiceChat(id) {
    setSelectedChat(id || null);
    setModal(null);
    navigate('chat');
  }

  function search(query, city = '') {
    navigate('professionals');
    setFilters({ ...EMPTY_FILTERS, query, city });
  }

  function selectCategory(category) {
    navigate('professionals');
    setFilters({ ...EMPTY_FILTERS, category });
  }

  const items = page === 'professionals' ? professionals : page === 'mine' ? mine : services;

  return (
    <div className="app">
      <a
        className="skip"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main').focus();
        }}
      >
        Pular para o conteúdo
      </a>
      <AppHeader
        user={user}
        unread={unread}
        onNavigate={navigate}
        onOpenModal={openModal}
        onLogout={handleLogout}
        onSearch={search}
      />
      <div className="workspace">
        <AppNavigation page={page} user={user} unread={unread} onNavigate={navigate} />
        <main id="main" tabIndex={-1}>
          {error && !modal && (
            <div className="alert" role="alert">
              {error}
              <button
                className="text-button"
                onClick={() => {
                  setError('');
                  refresh().catch((requestError) => setError(requestError.message));
                }}
              >
                Tentar novamente
              </button>
            </div>
          )}
          {!ready ? (
            <div className="empty">Carregando seu espaço…</div>
          ) : (
            <>
              {page === 'home' && (
                <HomePage
                  user={user}
                  professionals={professionals}
                  services={services}
                  onNavigate={navigate}
                  onSearch={search}
                  onSelectCategory={selectCategory}
                  onOpenModal={openModal}
                  onRequireAuth={requireAuth}
                  onViewProfessional={handleViewProfessional}
                  onViewService={(service) => openModal({ type: 'service', service })}
                />
              )}
              {['services', 'professionals', 'mine'].includes(page) && (
                <MarketplacePage
                  type={page}
                  items={items}
                  filters={filters}
                  isClient={isClient}
                  onFiltersChange={setFilters}
                  onCreateService={() => openModal({ type: 'create' })}
                  onViewProfessional={handleViewProfessional}
                  onViewService={(service) => openModal({ type: 'service', service })}
                />
              )}
              {page === 'chat' && (
                <ChatPage
                  user={user}
                  conversations={conversations}
                  selectedChat={selectedChat}
                  messages={messages}
                  message={message}
                  attachment={attachment}
                  busy={busy}
                  messageEnd={messageEnd}
                  onSelectChat={selectChat}
                  onMessageChange={setMessage}
                  onAttachmentChange={setAttachment}
                  onAttachmentError={setError}
                  onSendMessage={handleSendMessage}
                  onConfirmHiring={(conversation) =>
                    openModal({
                      type: 'confirm',
                      serviceId: conversation.service_id,
                      professionalId: conversation.professional_id,
                      name: conversation.professional_name,
                    })
                  }
                />
              )}
            </>
          )}
          <AppFooter />
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          {toast}
        </div>
      )}
      <AppModal
        modal={modal}
        user={user}
        error={error}
        busy={busy}
        photos={photos}
        notifications={notifications}
        conversations={conversations}
        authMode={authMode}
        authRole={authRole}
        onClose={() => {
          setModal(null);
          setError('');
        }}
        onAuthModeChange={(mode) => {
          setAuthMode(mode);
          setError('');
        }}
        onAuthRoleChange={setAuthRole}
        onAuthSubmit={handleAuth}
        onCreateService={handleCreateService}
        onPhotosChange={setPhotos}
        onError={setError}
        onRequireAuth={requireAuth}
        onOpenModal={openModal}
        onInterest={handleInterest}
        onOpenServiceChat={openServiceChat}
        onUpdateProfile={handleUpdateProfile}
        onReview={handleReview}
        onChangeStatus={handleChangeStatus}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        onOpenNotification={openNotification}
      />
    </div>
  );
}
