import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  Check,
  LockKeyhole,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Star,
  UserRound,
} from 'lucide-react';
import { CATEGORIES } from '../app/config';
import { formatCurrency, formatDate, formatDateTime } from '../app/formatters';
import { Avatar, Empty, Field, ImagesInput, Modal, Status } from './ui';

export default function AppModal({
  modal,
  user,
  error,
  busy,
  photos,
  avatarImage,
  coverImage,
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
  onAvatarImageChange,
  onCoverImageChange,
  onError,
  onRequireAuth,
  onOpenModal,
  onInterest,
  onOpenServiceChat,
  onOpenProfessionalProfile,
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
    <Modal
      title={title}
      onClose={onClose}
      className={modal.type === 'auth' ? 'auth-dialog' : ''}
      hideHeading={modal.type === 'auth'}
    >
      {error && modal.type !== 'auth' && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}
      {modal.type === 'auth' && (
        <AuthForm
          mode={authMode}
          role={authRole}
          busy={busy}
          error={error}
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
          onOpenProfile={() => onOpenProfessionalProfile(modal.professional)}
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
          avatarImage={avatarImage}
          coverImage={coverImage}
          busy={busy}
          onPhotosChange={onPhotosChange}
          onAvatarImageChange={onAvatarImageChange}
          onCoverImageChange={onCoverImageChange}
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
      {modal.type === 'finish-service' && (
        <FinishServiceForm
          busy={busy}
          photos={photos}
          onPhotosChange={onPhotosChange}
          onError={onError}
          onSubmit={(data) => onChangeStatus(modal.serviceId, data.status, undefined, data)}
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

function AuthForm({ mode, role, busy, error, onModeChange, onRoleChange, onSubmit }) {
  const isRegistration = mode === 'register';

  return (
    <div className="auth-layout">
      <aside className="auth-showcase">
        <div className="auth-brand">
          <span className="brand-symbol">
            T<i />
          </span>
          <span>
            TRENA<small>CONEXÕES QUE CONSTROEM</small>
          </span>
        </div>
        <div className="auth-abstract" aria-hidden="true">
          <span className="shape shape-panel" />
          <span className="shape shape-rail" />
          <span className="shape shape-ruler" />
          <span className="shape shape-step" />
          <span className="shape shape-line" />
        </div>
        <div className="auth-mascot-stage">
          <img src="/mascote_joia.png" alt="Mascote da TRENA com capacete" />
        </div>
        <div className="auth-showcase-copy">
          <span className="eyebrow">ACESSO À PLATAFORMA</span>
          <h2>{isRegistration ? 'Seu projeto começa bem medido.' : 'Sua obra continua daqui.'}</h2>
          <p>
            Uma entrada simples para publicar serviços, negociar detalhes e acompanhar cada
            combinação até a entrega.
          </p>
        </div>
        <div className="auth-points">
          <span>
            <ShieldCheck size={16} /> Perfis verificados para organizar suas escolhas
          </span>
          <span>
            <MessageSquare size={16} /> Conversas e solicitações no mesmo histórico
          </span>
        </div>
      </aside>

      <section className="auth-content">
        <div className="auth-heading">
          <span className="eyebrow">{isRegistration ? 'CRIAR CONTA' : 'ENTRAR'}</span>
          <h2 id="modal-title">
            {isRegistration ? 'Crie sua conta na TRENA' : 'Acesse sua conta'}
          </h2>
          <p>
            {isRegistration
              ? 'Escolha como você quer usar a plataforma e complete seus dados.'
              : 'Use seu e-mail e senha para continuar seus projetos e conversas.'}
          </p>
        </div>

        <div className={'segmented auth-tabs ' + (isRegistration ? 'register' : 'login')}>
          <span className="auth-tab-indicator" aria-hidden="true" />
          <button
            type="button"
            className={mode === 'login' ? 'selected' : ''}
            onClick={() => onModeChange('login')}
          >
            Entrar
          </button>
          <button
            type="button"
            className={isRegistration ? 'selected' : ''}
            onClick={() => onModeChange('register')}
          >
            Criar conta
          </button>
        </div>

        <div className="auth-slider" key={mode}>
          {error && (
            <div className="alert" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="form auth-form">
            {isRegistration && (
              <>
                <div className="role-picker" aria-label="Tipo de conta">
                  <button
                    type="button"
                    className={role === 'client' ? 'selected' : ''}
                    onClick={() => onRoleChange('client')}
                  >
                    <UserRound size={18} />
                    <span>
                      Cliente
                      <small>Quero contratar</small>
                    </span>
                  </button>
                  <button
                    type="button"
                    className={role === 'professional' ? 'selected' : ''}
                    onClick={() => onRoleChange('professional')}
                  >
                    <BriefcaseBusiness size={18} />
                    <span>
                      Profissional
                      <small>Quero trabalhar</small>
                    </span>
                  </button>
                </div>
                <div className="form-row">
                  <Field label="Nome completo">
                    <span className="input-shell">
                      <UserRound size={17} />
                      <input
                        name="name"
                        required
                        minLength={3}
                        maxLength={100}
                        autoComplete="name"
                      />
                    </span>
                  </Field>
                  <Field label="Cidade e UF">
                    <span className="input-shell">
                      <MapPin size={17} />
                      <input
                        name="city"
                        required
                        minLength={3}
                        maxLength={100}
                        placeholder="Itajubá, MG"
                        autoComplete="address-level2"
                      />
                    </span>
                  </Field>
                </div>
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
              <span className="input-shell">
                <Mail size={17} />
                <input name="email" type="email" required autoComplete="email" maxLength={180} />
              </span>
            </Field>
            <Field label="Senha">
              <span className="input-shell">
                <LockKeyhole size={17} />
                <input
                  name="password"
                  type="password"
                  required
                  minLength={isRegistration ? 8 : 1}
                  maxLength={128}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </span>
            </Field>
            {isRegistration && (
              <p className="muted">
                Use pelo menos 8 caracteres. Seu e-mail não aparece no perfil público.
              </p>
            )}
            <button className="button full auth-submit" disabled={busy}>
              {busy ? 'Aguarde...' : mode === 'login' ? 'Entrar na TRENA' : 'Criar minha conta'}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        <div className="demo-hint auth-demo">
          <strong>Contas demo</strong>
          <p>
            <b>cliente@trena.demo</b> ou <b>profissional@trena.demo</b> · Senha: <b>Trena@2026</b>
          </p>
        </div>
      </section>
    </div>
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

function ProfessionalDetail({ professional, canRequest, onRequest, onOpenProfile }) {
  return (
    <div className="profile-detail">
      <div className="profile-intro">
        <Avatar name={professional.name} image={professional.avatar_image} large />
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
      <button type="button" className="text-button profile-link-action" onClick={onOpenProfile}>
        Ver perfil completo <ArrowUpRight size={16} />
      </button>
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
      {service.completion_images?.length > 0 && (
        <>
          <h3>Fotos da conclusão</h3>
          <div className="portfolio">
            {service.completion_images.map((image, index) => (
              <a href={image} key={image} target="_blank" rel="noreferrer">
                <img src={image} alt={`Foto de conclusão ${index + 1}`} />
              </a>
            ))}
          </div>
        </>
      )}
      {service.closure_reason && (
        <p className="info-box">
          <MessageSquare size={18} /> {service.closure_reason}
        </p>
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
              onClick={() => onOpenModal({ type: 'finish-service', serviceId: service.id })}
            >
              Encerrar serviço <Check size={18} />
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

function ProfileForm({
  user,
  photos,
  avatarImage,
  coverImage,
  busy,
  onPhotosChange,
  onAvatarImageChange,
  onCoverImageChange,
  onError,
  onSubmit,
}) {
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
        <>
          <div className="profile-image-tools">
            <ImagesInput
              value={avatarImage}
              onChange={(images) => onAvatarImageChange(images.slice(-1))}
              onError={onError}
              label="Foto de perfil"
            />
            <ImagesInput
              value={coverImage}
              onChange={(images) => onCoverImageChange(images.slice(-1))}
              onError={onError}
              label="Foto de capa"
            />
          </div>
          <ImagesInput
            value={photos}
            onChange={onPhotosChange}
            onError={onError}
            label="Fotos do seu portfólio"
          />
        </>
      )}
      <button className="button full" disabled={busy}>
        Salvar alterações <Check size={18} />
      </button>
    </form>
  );
}

function FinishServiceForm({ busy, photos, onPhotosChange, onError, onSubmit }) {
  const [status, setStatus] = useState('completed');
  const [rating, setRating] = useState(5);

  function handleSubmit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    onSubmit({
      status,
      completion_images: status === 'completed' ? photos : [],
      closure_reason: data.closure_reason,
      rating: data.rating,
    });
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <Field label="Resultado do serviço">
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="completed">Concluído</option>
          <option value="paused">Pausado</option>
          <option value="not_completed">Não concluído</option>
        </select>
      </Field>
      {status === 'completed' ? (
        <>
          <ImagesInput
            value={photos}
            onChange={onPhotosChange}
            onError={onError}
            label="Adicionar fotos da conclusão"
          />
          <Field label="Nota do profissional">
            <div className="star-rating" role="radiogroup" aria-label="Nota do profissional">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={value <= rating ? 'selected' : ''}
                  aria-label={`${value} de 5`}
                  aria-checked={value === rating}
                  role="radio"
                  onClick={() => setRating(value)}
                >
                  <Star size={24} />
                </button>
              ))}
              <input type="hidden" name="rating" value={rating} />
            </div>
          </Field>
          <Field label="Feedback da conclusão">
            <textarea
              name="closure_reason"
              required
              minLength={5}
              maxLength={1000}
              rows={4}
              placeholder="Descreva como ficou a entrega, ajustes feitos ou observações finais."
            />
          </Field>
          <p className="muted">
            As fotos, a nota e o feedback ajudam a registrar a entrega para o cliente e o
            profissional.
          </p>
        </>
      ) : (
        <Field label={status === 'paused' ? 'Motivo da pausa' : 'Motivo do encerramento'}>
          <textarea
            name="closure_reason"
            required
            minLength={5}
            maxLength={1000}
            rows={4}
            placeholder={
              status === 'paused'
                ? 'Explique por que o serviço ficará pausado.'
                : 'Explique por que o serviço não foi concluído.'
            }
          />
        </Field>
      )}
      <button className="button full" disabled={busy}>
        Salvar encerramento <Check size={18} />
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
    'finish-service': 'Encerrar serviço',
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
