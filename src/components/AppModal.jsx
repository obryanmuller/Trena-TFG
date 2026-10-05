import { ArrowRight, ArrowUpRight, Bell, Check, MapPin, MessageSquare, Star } from 'lucide-react';
import { CATEGORIES } from '../app/config';
import { formatCurrency, formatDate, formatDateTime } from '../app/formatters';
import { Avatar, Empty, Field, ImagesInput, Modal, Status } from './ui';

export default function AppModal({
  modal,
  user,
  error,
  busy,
  photos,
  notifications,
  conversations,
  authMode,
  authRole,
  onClose,
  onAuthModeChange,
  onAuthRoleChange,
  onAuthSubmit,
  onCreateService,
  onPhotosChange,
  onError,
  onRequireAuth,
  onOpenModal,
  onInterest,
  onOpenServiceChat,
  onUpdateProfile,
  onReview,
  onChangeStatus,
  onMarkNotificationsRead,
  onOpenNotification,
}) {
  if (!modal) return null;

  const isClient = user?.role === 'client';
  const title = getModalTitle(modal, authMode);

  return (
    <Modal title={title} onClose={onClose}>
      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}
      {modal.type === 'auth' && (
        <AuthForm
          mode={authMode}
          role={authRole}
          busy={busy}
          onModeChange={onAuthModeChange}
          onRoleChange={onAuthRoleChange}
          onSubmit={onAuthSubmit}
        />
      )}
      {modal.type === 'create' && (
        <CreateServiceForm
          modal={modal}
          user={user}
          photos={photos}
          busy={busy}
          onPhotosChange={onPhotosChange}
          onError={onError}
          onSubmit={onCreateService}
        />
      )}
      {modal.type === 'professional' && (
        <ProfessionalDetail
          professional={modal.professional}
          canRequest={!user || isClient}
          onRequest={() =>
            onRequireAuth(() => onOpenModal({ type: 'create', professional: modal.professional }))
          }
        />
      )}
      {modal.type === 'service' && (
        <ServiceDetail
          service={modal.service}
          user={user}
          busy={busy}
          conversations={conversations}
          onInterest={onInterest}
          onOpenChat={onOpenServiceChat}
          onOpenModal={onOpenModal}
        />
      )}
      {modal.type === 'profile' && (
        <ProfileForm
          user={user}
          photos={photos}
          busy={busy}
          onPhotosChange={onPhotosChange}
          onError={onError}
          onSubmit={onUpdateProfile}
        />
      )}
      {modal.type === 'review' && (
        <ReviewForm busy={busy} onSubmit={(event) => onReview(event, modal.serviceId)} />
      )}
      {modal.type === 'confirm' && (
        <Confirmation
          busy={busy}
          description={
            <>
              Confirmar a contratação de <strong>{modal.name}</strong>? O serviço passará para “Em
              execução”.
            </>
          }
          note="Confirme após alinhar escopo, preço e prazo no chat. Esta plataforma não processa pagamentos."
          actionLabel="Confirmar e iniciar serviço"
          onConfirm={() => onChangeStatus(modal.serviceId, 'active', modal.professionalId)}
        />
      )}
      {modal.type === 'complete' && (
        <Confirmation
          busy={busy}
          description="O trabalho foi entregue? Ao concluir o serviço, você poderá avaliar o profissional."
          actionLabel="Sim, concluir serviço"
          onConfirm={() => onChangeStatus(modal.serviceId, 'completed')}
        />
      )}
      {modal.type === 'notifications' && (
        <Notifications
          notifications={notifications}
          onMarkAllRead={onMarkNotificationsRead}
          onOpen={onOpenNotification}
        />
      )}
      {modal.type === 'help' && <Help />}
    </Modal>
  );
}

function AuthForm({ mode, role, busy, onModeChange, onRoleChange, onSubmit }) {
  const isRegistration = mode === 'register';

  return (
    <>
      <div className="segmented">
        <button
          className={mode === 'login' ? 'selected' : ''}
          onClick={() => onModeChange('login')}
        >
          Entrar
        </button>
        <button
          className={isRegistration ? 'selected' : ''}
          onClick={() => onModeChange('register')}
        >
          Criar conta
        </button>
      </div>
      <form onSubmit={onSubmit} className="form">
        {isRegistration && (
          <>
            <Field label="Eu quero">
              <select value={role} onChange={(event) => onRoleChange(event.target.value)}>
                <option value="client">Contratar profissionais</option>
                <option value="professional">Oferecer meus serviços</option>
              </select>
            </Field>
            <Field label="Nome completo">
              <input name="name" required minLength={3} maxLength={100} autoComplete="name" />
            </Field>
            <Field label="Cidade e UF">
              <input
                name="city"
                required
                minLength={3}
                maxLength={100}
                placeholder="Itajubá, MG"
                autoComplete="address-level2"
              />
            </Field>
            {role === 'professional' && (
              <>
                <Field label="Especialidade">
                  <select name="specialty">
                    {CATEGORIES.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Sobre seu trabalho">
                  <textarea
                    name="bio"
                    maxLength={2000}
                    placeholder="Conte sua experiência e os serviços que você oferece."
                  />
                </Field>
              </>
            )}
          </>
        )}
        <Field label="E-mail">
          <input name="email" type="email" required autoComplete="email" maxLength={180} />
        </Field>
        <Field label="Senha">
          <input
            name="password"
            type="password"
            required
            minLength={isRegistration ? 8 : 1}
            maxLength={128}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </Field>
        {isRegistration && (
          <p className="muted">
            Use pelo menos 8 caracteres. Seu e-mail não aparece no perfil público.
          </p>
        )}
        <button className="button full" disabled={busy}>
          {busy ? 'Aguarde…' : mode === 'login' ? 'Entrar na TRENA' : 'Criar minha conta'}
          <ArrowRight size={18} />
        </button>
      </form>
      <div className="demo-hint">
        <strong>Conhecendo o protótipo?</strong>
        <p>
          Com a base de demonstração: <b>cliente@trena.demo</b> ou <b>profissional@trena.demo</b>
          <br />
          Senha: <b>Trena@2026</b>
        </p>
        <small>Contas e serviços fictícios para apresentação acadêmica.</small>
      </div>
    </>
  );
}

function CreateServiceForm({ modal, user, photos, busy, onPhotosChange, onError, onSubmit }) {
  return (
    <form className="form" onSubmit={onSubmit}>
      {modal.professional && (
        <div className="info-box">
          <Avatar name={modal.professional.name} />
          <span>
            Solicitação direta para <strong>{modal.professional.name}</strong>
          </span>
        </div>
      )}
      <Field label="Título do serviço">
        <input
          name="title"
          required
          minLength={5}
          maxLength={100}
          placeholder="Ex.: Pintura da sala e dos quartos"
        />
      </Field>
      <div className="form-row">
        <Field label="Especialidade">
          <select name="category" defaultValue={modal.professional?.specialty || CATEGORIES[0]}>
            {CATEGORIES.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </Field>
        <Field label="Cidade e UF">
          <input name="city" required minLength={3} maxLength={100} defaultValue={user.city} />
        </Field>
      </div>
      <Field label="Descreva seu projeto">
        <textarea
          name="description"
          required
          minLength={20}
          maxLength={4000}
          rows={4}
          placeholder="Conte o que precisa ser feito, as medidas e os materiais disponíveis. Mínimo de 20 caracteres."
        />
      </Field>
      <div className="form-row">
        <Field label="Orçamento estimado (R$)">
          <input
            name="budget"
            type="number"
            min="0.01"
            max="10000000"
            step="0.01"
            required
            placeholder="1500"
          />
        </Field>
        <Field label="Prazo desejado">
          <input name="deadline" type="date" required min={new Date().toISOString().slice(0, 10)} />
        </Field>
      </div>
      <ImagesInput value={photos} onChange={onPhotosChange} onError={onError} />
      <p className="muted">
        O orçamento é uma estimativa. Combine o valor final e o escopo pelo chat. Evite incluir
        dados pessoais nas fotos.
      </p>
      <button className="button full" disabled={busy}>
        {modal.professional ? 'Enviar solicitação' : 'Publicar serviço'}
        <ArrowUpRight size={18} />
      </button>
    </form>
  );
}

function ProfessionalDetail({ professional, canRequest, onRequest }) {
  return (
    <div className="profile-detail">
      <div className="profile-intro">
        <Avatar name={professional.name} large />
        <div>
          <span className="specialty">{professional.specialty}</span>
          <p className="location">
            <MapPin size={16} />
            {professional.city}
          </p>
          <span className="rating">
            <Star size={16} />
            {professional.rating
              ? `${Number(professional.rating).toFixed(1)} · ${professional.review_count} avaliações`
              : 'Ainda sem avaliações'}
          </span>
        </div>
      </div>
      <h3>Sobre o profissional</h3>
      <p>{professional.bio || 'Este profissional ainda não adicionou uma descrição.'}</p>
      <h3>Portfólio</h3>
      {professional.portfolio.length ? (
        <div className="portfolio">
          {professional.portfolio.map((image, index) => (
            <a key={image} href={image} target="_blank" rel="noreferrer">
              <img src={image} alt={`Trabalho de ${professional.name}, foto ${index + 1}`} />
            </a>
          ))}
        </div>
      ) : (
        <p className="muted">O profissional ainda não publicou fotos de trabalhos.</p>
      )}
      <h3>Avaliações de clientes</h3>
      {professional.reviews.length ? (
        professional.reviews.map((review, index) => (
          <div className="review" key={review.id || index}>
            <strong>
              {review.client_name}
              <span>
                <Star size={14} /> {review.rating}/5
              </span>
            </strong>
            <p>{review.comment}</p>
          </div>
        ))
      ) : (
        <p className="muted">As avaliações aparecerão após os primeiros serviços concluídos.</p>
      )}
      {canRequest && (
        <button className="button full" onClick={onRequest}>
          Solicitar serviço diretamente <ArrowUpRight size={18} />
        </button>
      )}
    </div>
  );
}

function ServiceDetail({
  service,
  user,
  busy,
  conversations,
  onInterest,
  onOpenChat,
  onOpenModal,
}) {
  const canShowInterest =
    (!user || user.role === 'professional') &&
    ['open', 'negotiating'].includes(service.status) &&
    (!service.professional_id || service.professional_id === user?.id);
  const isOwner = user?.id === service.client_id;

  return (
    <div className="service-detail">
      <div className="detail-top">
        <Status value={service.status} />
        <span className="specialty">{service.category}</span>
      </div>
      <p>{service.description}</p>
      <div className="detail-grid">
        <Detail label="Orçamento estimado" value={formatCurrency(service.budget)} />
        <Detail label="Prazo desejado" value={formatDate(service.deadline)} />
        <Detail label="Local" value={service.city} />
        <Detail label="Publicado por" value={service.client_name} />
      </div>
      {service.images.length > 0 && (
        <div className="portfolio">
          {service.images.map((image, index) => (
            <a href={image} key={image} target="_blank" rel="noreferrer">
              <img src={image} alt={`Foto do serviço ${index + 1}`} />
            </a>
          ))}
        </div>
      )}
      {service.professional_name && (
        <p>
          Profissional: <strong>{service.professional_name}</strong>
        </p>
      )}
      {canShowInterest && (
        <button className="button full" disabled={busy} onClick={() => onInterest(service)}>
          Tenho interesse · Conversar <MessageSquare size={18} />
        </button>
      )}
      {isOwner && (
        <div className="actions">
          {service.status === 'negotiating' && (
            <button
              className="button full"
              onClick={() =>
                onOpenChat(
                  conversations.find((conversation) => conversation.service_id === service.id)?.id,
                )
              }
            >
              Ver negociações <MessageSquare size={18} />
            </button>
          )}
          {service.status === 'active' && (
            <button
              className="button full"
              onClick={() => onOpenModal({ type: 'complete', serviceId: service.id })}
            >
              Concluir serviço <Check size={18} />
            </button>
          )}
          {service.status === 'completed' && !service.review_rating && (
            <button
              className="button full"
              onClick={() => onOpenModal({ type: 'review', serviceId: service.id })}
            >
              Avaliar profissional <Star size={18} />
            </button>
          )}
          {service.review_rating && (
            <p className="info-box">
              <Star size={18} /> Você avaliou este serviço com nota {service.review_rating}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

function ProfileForm({ user, photos, busy, onPhotosChange, onError, onSubmit }) {
  const isClient = user.role === 'client';

  return (
    <form className="form" onSubmit={onSubmit}>
      <Field label="Nome completo">
        <input name="name" defaultValue={user.name} minLength={3} maxLength={100} required />
      </Field>
      <Field label="Cidade e UF">
        <input name="city" defaultValue={user.city} minLength={3} maxLength={100} required />
      </Field>
      {!isClient && (
        <Field label="Especialidade">
          <select name="specialty" defaultValue={user.specialty}>
            {CATEGORIES.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </Field>
      )}
      <Field label={isClient ? 'Sobre você' : 'Descrição profissional'}>
        <textarea name="bio" defaultValue={user.bio} maxLength={2000} rows={4} />
      </Field>
      {!isClient && (
        <ImagesInput
          value={photos}
          onChange={onPhotosChange}
          onError={onError}
          label="Fotos do seu portfólio"
        />
      )}
      <button className="button full" disabled={busy}>
        Salvar alterações <Check size={18} />
      </button>
    </form>
  );
}

function ReviewForm({ busy, onSubmit }) {
  return (
    <form className="form" onSubmit={onSubmit}>
      <Field label="Sua nota">
        <select name="rating" defaultValue="5">
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>
              {'★'.repeat(rating)} · {rating} de 5
            </option>
          ))}
        </select>
      </Field>
      <Field label="Conte como foi o serviço">
        <textarea
          name="comment"
          required
          minLength={5}
          maxLength={2000}
          rows={4}
          placeholder="O que você achou da comunicação, do prazo e do resultado?"
        />
      </Field>
      <button className="button full" disabled={busy}>
        Publicar avaliação <Star size={18} />
      </button>
    </form>
  );
}

function Confirmation({ busy, description, note, actionLabel, onConfirm }) {
  return (
    <div className="form">
      <p>{description}</p>
      {note && <p className="muted">{note}</p>}
      <button className="button full" disabled={busy} onClick={onConfirm}>
        {actionLabel} <Check size={18} />
      </button>
    </div>
  );
}

function Notifications({ notifications, onMarkAllRead, onOpen }) {
  return (
    <div className="notification-list">
      {notifications.length > 0 && (
        <button className="text-button" onClick={onMarkAllRead}>
          Marcar todas como lidas <Check size={17} />
        </button>
      )}
      {!notifications.length ? (
        <Empty title="Tudo em dia">
          Novas conversas e atualizações dos seus serviços aparecerão aqui.
        </Empty>
      ) : (
        notifications.map((notification) => (
          <button
            className={notification.is_read ? 'notification' : 'notification unread'}
            key={notification.id}
            onClick={() => onOpen(notification)}
          >
            <Bell size={18} />
            <span>
              {notification.text}
              <small>{formatDateTime(notification.created_at)}</small>
            </span>
            {!notification.is_read && <i />}
          </button>
        ))
      )}
    </div>
  );
}

function Help() {
  return (
    <div className="help-steps">
      {HELP_STEPS.map(({ number, title, description }) => (
        <div key={number}>
          <span>{number}</span>
          <section>
            <h3>{title}</h3>
            <p>{description}</p>
          </section>
        </div>
      ))}
      <p className="info-box">
        Protótipo do TFG de Bryan Muller da Silva, UNIFEI. Contas iniciais são fictícias.
        Notificações internas são atualizadas automaticamente com a aplicação aberta.
      </p>
    </div>
  );
}

function getModalTitle(modal, authMode) {
  const titles = {
    auth: authMode === 'login' ? 'Bom ter você por aqui.' : 'Vamos construir sua próxima conexão.',
    create: modal.professional ? 'Solicitar um serviço' : 'Conte o que você precisa.',
    professional: modal.professional?.name,
    service: modal.service?.title,
    profile: 'Seu perfil, suas conexões.',
    review: 'Como foi a experiência?',
    notifications: 'Suas notificações',
    confirm: 'Confirmar contratação',
    complete: 'Concluir serviço',
    help: 'Da ideia ao último acabamento.',
  };

  return titles[modal.type];
}

const HELP_STEPS = [
  {
    number: '01',
    title: 'Conte seu projeto',
    description:
      'Crie uma conta de cliente e publique o serviço com orçamento, prazo e fotos. Você também pode solicitar diretamente a um profissional.',
  },
  {
    number: '02',
    title: 'Conversem sobre os detalhes',
    description:
      'Profissionais encontram serviços por especialidade e região. O chat permite combinar escopo e trocar imagens.',
  },
  {
    number: '03',
    title: 'Acompanhe e avalie',
    description:
      'O cliente confirma a contratação, acompanha a execução e conclui o serviço para avaliar o profissional.',
  },
];
