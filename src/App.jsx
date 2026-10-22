import { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { api } from './app/api';
import { getRoute } from './app/formatters';
import AppModal from './components/AppModal';
import { AppFooter, AppHeader, AppNavigation } from './components/AppShell';
import ChatPage from './pages/ChatPage';
import HomePage from './pages/HomePage';
import MarketplacePage from './pages/MarketplacePage';
import ProfilePage from './pages/ProfilePage';

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
  const [publicProfessional, setPublicProfessional] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState([]);
  const [authMode, setAuthMode] = useState('login');
  const [authRole, setAuthRole] = useState('client');
  const [photos, setPhotos] = useState([]);
  const [avatarImage, setAvatarImage] = useState([]);
  const [coverImage, setCoverImage] = useState([]);
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

  useEffect(() => {
    if (!selectedChat || !user || !unread) return;
    markConversationNotificationsRead(selectedChat);
  }, [selectedChat, unread, user?.id]);

  function openModal(nextModal) {
    setError('');
    if (nextModal.mode) setAuthMode(nextModal.mode);
    if (nextModal.role) setAuthRole(nextModal.role);
    setPhotos(nextModal.type === 'profile' ? user?.portfolio || [] : []);
    setAvatarImage(nextModal.type === 'profile' && user?.avatar_image ? [user.avatar_image] : []);
    setCoverImage(nextModal.type === 'profile' && user?.cover_image ? [user.cover_image] : []);
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

  function openProfessionalProfile(professional) {
    setPublicProfessional(professional);
    setModal(null);
    navigate('professional-profile');
  }

  async function handleChangeStatus(serviceId, status, professionalId, details = {}) {
    await run(async () => {
      await api(`/services/${serviceId}/status`, 'PATCH', {
        status,
        professional_id: professionalId,
        ...details,
      });
      await refresh();
      setModal(null);
      setToast(
        {
          active: 'Contratação confirmada. Bom trabalho!',
          completed: 'Serviço concluído. Agora você pode avaliar!',
          paused: 'Serviço pausado.',
          not_completed: 'Serviço encerrado como não concluído.',
        }[status] || 'Serviço atualizado.',
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

  async function handleCounterProposal(input) {
    const parts = [
      'Contraproposta enviada',
      `Valor proposto: R$ ${Number(input.budget).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `Prazo sugerido: ${new Date(input.deadline + 'T12:00:00').toLocaleDateString('pt-BR')}`,
      input.note ? `Observação: ${input.note}` : '',
    ].filter(Boolean);

    await run(async () => {
      await api(`/conversations/${selectedChat}/messages`, 'POST', {
        text: parts.join('\n'),
      });
      setMessages(await api(`/conversations/${selectedChat}/messages`));
      await refresh();
      setToast('Contraproposta enviada ao cliente.');
    });
  }

  async function handleUpdateProfile(event) {
    event.preventDefault();
    const data = formData(event);
    await saveProfile({
      ...data,
      portfolio: photos,
      avatar_image: avatarImage[0] || '',
      cover_image: coverImage[0] || '',
    });
    setModal(null);
  }

  async function saveProfile(data) {
    await run(async () => {
      const result = await api('/profile', 'PATCH', data);
      setUser(result.user);
      await refresh(result.user);
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

  async function markNotificationRead(notification) {
    if (!notification || notification.is_read) return;
    setNotifications((items) =>
      items.map((item) => (item.id === notification.id ? { ...item, is_read: 1 } : item)),
    );
    try {
      await api(`/notifications/${notification.id}/read`, 'PATCH', {});
    } catch (requestError) {
      setError(requestError.message);
      setNotifications(await api('/notifications'));
    }
  }

  async function markConversationNotificationsRead(conversationId) {
    const hasUnread = notifications.some(
      (item) => item.conversation_id === conversationId && !item.is_read,
    );
    if (!hasUnread) return;
    setNotifications((items) =>
      items.map((item) =>
        item.conversation_id === conversationId ? { ...item, is_read: 1 } : item,
      ),
    );
    try {
      await api(`/notifications/conversation/${conversationId}/read`, 'PATCH', {});
    } catch (requestError) {
      setError(requestError.message);
      setNotifications(await api('/notifications'));
    }
  }

  function openNotification(notification) {
    markNotificationRead(notification);
    if (notification.conversation_id) {
      setSelectedChat(notification.conversation_id);
      setMessages([]);
      markConversationNotificationsRead(notification.conversation_id);
      navigate('chat');
    } else navigate('mine');
    setModal(null);
  }

  function selectChat(id) {
    setSelectedChat(id);
    setMessages([]);
    setMessage('');
    setAttachment([]);
    markConversationNotificationsRead(id);
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
              {page === 'profile' && user && (
                <ProfilePage user={user} busy={busy} onSubmit={saveProfile} onError={setError} />
              )}
              {page === 'professional-profile' && publicProfessional && (
                <ProfilePage user={publicProfessional} busy={busy} onError={setError} readOnly />
              )}
              {page === 'chat' && (
                <ChatPage
                  user={user}
                  conversations={conversations}
                  services={[...mine, ...services]}
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
                  onSendCounterProposal={handleCounterProposal}
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
        avatarImage={avatarImage}
        coverImage={coverImage}
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
        onAvatarImageChange={setAvatarImage}
        onCoverImageChange={setCoverImage}
        onError={setError}
        onRequireAuth={requireAuth}
        onOpenModal={openModal}
        onInterest={handleInterest}
        onOpenServiceChat={openServiceChat}
        onOpenProfessionalProfile={openProfessionalProfile}
        onUpdateProfile={handleUpdateProfile}
        onReview={handleReview}
        onChangeStatus={handleChangeStatus}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        onOpenNotification={openNotification}
      />
    </div>
  );
}
