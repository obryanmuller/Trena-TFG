import { useEffect, useState } from 'react';
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  MapPin,
  Pencil,
  Star,
  X,
} from 'lucide-react';
import SpecialtyArt, { SpecialtyBadge } from '../SpecialtyArt';
import { api } from '../app/api';
import { CATEGORIES } from '../app/config';
import { formatDate } from '../app/formatters';
import { Avatar, ImagesInput } from '../components/ui';

export default function ProfilePage({ user, busy, onSubmit, onError, readOnly = false }) {
  const isProfessional = user?.role === 'professional';
  const [portfolio, setPortfolio] = useState([]);
  const [avatarImage, setAvatarImage] = useState([]);
  const [coverImage, setCoverImage] = useState([]);
  const [activePortfolioIndex, setActivePortfolioIndex] = useState(null);
  const [professionalDetails, setProfessionalDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    resetDrafts();
    setIsEditing(false);
  }, [user?.id, user?.avatar_image, user?.cover_image, user?.portfolio?.length]);

  useEffect(() => {
    if (!isProfessional || !user?.id) return undefined;

    let active = true;
    setProfessionalDetails(null);
    api('/professionals/' + user.id)
      .then((details) => {
        if (active) setProfessionalDetails(details);
      })
      .catch((error) => onError(error.message));

    return () => {
      active = false;
    };
  }, [isProfessional, user?.id, onError]);

  const reviews = professionalDetails?.reviews || [];
  const rating = professionalDetails?.rating || user.rating;
  const reviewCount = professionalDetails?.review_count || user.review_count || reviews.length;
  const completedServices =
    professionalDetails?.completed_services || user.completed_services || [];

  async function handleSubmit(event) {
    event.preventDefault();
    if (readOnly || !onSubmit) return;
    await onSubmit({
      ...Object.fromEntries(new FormData(event.currentTarget)),
      portfolio,
      avatar_image: avatarImage[0] || '',
      cover_image: coverImage[0] || '',
    });
    setIsEditing(false);
  }

  function resetDrafts() {
    setPortfolio(user?.portfolio || []);
    setAvatarImage(user?.avatar_image ? [user.avatar_image] : []);
    setCoverImage(user?.cover_image ? [user.cover_image] : []);
  }

  function cancelEditing() {
    resetDrafts();
    setIsEditing(false);
  }

  async function loadSingleImage(event, setter) {
    const [file] = Array.from(event.target.files || []);
    event.target.value = '';
    if (!file) return;

    try {
      setter([await readImage(file)]);
    } catch (error) {
      onError(error.message);
    }
  }

  function removePortfolioImage(index) {
    setPortfolio((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setActivePortfolioIndex((current) => {
      if (current === null) return null;
      if (portfolio.length <= 1) return null;
      return Math.min(current, portfolio.length - 2);
    });
  }

  function showPreviousPortfolioImage() {
    setActivePortfolioIndex((current) =>
      current === null ? null : (current - 1 + portfolio.length) % portfolio.length,
    );
  }

  function showNextPortfolioImage() {
    setActivePortfolioIndex((current) =>
      current === null ? null : (current + 1) % portfolio.length,
    );
  }

  return (
    <form className={'profile-page ' + (isEditing ? 'editing' : 'viewing')} onSubmit={handleSubmit}>
      <section className="profile-hero-card">
        <div className="profile-cover">
          {isProfessional && coverImage[0] ? (
            <img src={coverImage[0]} alt={'Capa profissional de ' + user.name} />
          ) : isProfessional ? (
            <SpecialtyArt category={user.specialty} />
          ) : (
            <div className="client-cover-pattern" />
          )}
          {isProfessional && <SpecialtyBadge category={user.specialty} />}
          {isProfessional && isEditing && (
            <div className="cover-edit-actions">
              {coverImage[0] && (
                <button
                  type="button"
                  className="cover-remove-button"
                  onClick={() => setCoverImage([])}
                >
                  <X size={16} /> Remover capa
                </button>
              )}
              <label className="cover-edit-button">
                <Camera size={17} /> Alterar capa
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => loadSingleImage(event, setCoverImage)}
                />
              </label>
            </div>
          )}
        </div>
        <div className="profile-identity">
          <div className="profile-avatar-editor">
            <Avatar name={user.name} image={avatarImage[0]} large />
            {isProfessional && isEditing && (
              <>
                <label className="avatar-camera-button" aria-label="Alterar foto de perfil">
                  <Camera size={17} />
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => loadSingleImage(event, setAvatarImage)}
                  />
                </label>
                {avatarImage[0] && (
                  <button
                    type="button"
                    className="avatar-remove-button"
                    aria-label="Remover foto de perfil"
                    onClick={() => setAvatarImage([])}
                  >
                    <X size={15} />
                  </button>
                )}
              </>
            )}
          </div>
          <div className="profile-title-edit">
            <span className="eyebrow">{isProfessional ? 'PERFIL PROFISSIONAL' : 'MEU PERFIL'}</span>
            {isEditing ? (
              <input
                className="profile-name-input"
                name="name"
                defaultValue={user.name}
                minLength={3}
                maxLength={100}
                required
                aria-label="Nome completo"
              />
            ) : (
              <h1>{user.name}</h1>
            )}
            {isEditing ? (
              <label className="profile-location-input">
                <MapPin size={15} />
                <input
                  name="city"
                  defaultValue={user.city}
                  minLength={3}
                  maxLength={100}
                  required
                  aria-label="Cidade e UF"
                />
              </label>
            ) : (
              <p className="profile-location-text">
                <MapPin size={15} /> {user.city}
              </p>
            )}
          </div>
          <div className="profile-side-edit">
            {isProfessional && (
              <>
                <strong className="profile-rating">
                  <Star size={16} /> {rating ? Number(rating).toFixed(1) : 'Novo'}
                </strong>
                {isEditing ? (
                  <select name="specialty" defaultValue={user.specialty} aria-label="Especialidade">
                    {CATEGORIES.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                ) : (
                  <span className="profile-specialty-pill">{user.specialty}</span>
                )}
              </>
            )}
            {!readOnly && !isEditing && (
              <button
                type="button"
                className="profile-edit-toggle"
                onClick={() => setIsEditing(true)}
              >
                Editar perfil <Pencil size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="profile-grid-page">
        <section className="profile-panel profile-about-panel">
          <span className="eyebrow">APRESENTAÇÃO</span>
          <h2>{isProfessional ? 'Sobre o profissional' : 'Sobre você'}</h2>
          {isEditing ? (
            <textarea
              className="profile-bio-editor"
              name="bio"
              defaultValue={user.bio}
              maxLength={2000}
              rows={7}
              placeholder={
                isProfessional
                  ? 'Conte sua experiência, especialidades, região de atendimento e diferenciais.'
                  : 'Conte um pouco sobre você.'
              }
            />
          ) : (
            <p className="profile-bio-text">
              {user.bio || 'Este perfil ainda não tem uma apresentação publicada.'}
            </p>
          )}
          {isEditing && (
            <div className="profile-save-actions">
              <button className="button full" disabled={busy}>
                Salvar alterações <Check size={18} />
              </button>
              <button type="button" className="text-button" onClick={cancelEditing} disabled={busy}>
                Cancelar
              </button>
            </div>
          )}
        </section>

        {isProfessional && (
          <section className="profile-panel profile-portfolio-page inline">
            <div className="portfolio-heading">
              <div>
                <span className="eyebrow">TRABALHOS REALIZADOS</span>
                <h2>Vitrine dos seus serviços</h2>
              </div>
              <strong>
                {isEditing ? `${portfolio.length} de 6 fotos` : `${portfolio.length} trabalhos`}
              </strong>
            </div>
            {isEditing && (
              <ImagesInput
                value={portfolio}
                onChange={setPortfolio}
                onError={onError}
                label="Adicionar fotos de trabalhos"
                showPreview={false}
              />
            )}
            {portfolio.length > 0 ? (
              <div className="portfolio-showcase">
                <button
                  type="button"
                  className="portfolio-feature"
                  onClick={() => setActivePortfolioIndex(0)}
                >
                  <img src={portfolio[0]} alt="Trabalho em destaque" />
                  <span>Ver carrossel</span>
                </button>
                <div className="portfolio-stack">
                  {portfolio.map((image, index) => (
                    <div className="portfolio-work-card" key={image.slice(-40) + index}>
                      <button
                        type="button"
                        className="portfolio-work-open"
                        onClick={() => setActivePortfolioIndex(index)}
                      >
                        <img src={image} alt={`Trabalho realizado ${index + 1}`} />
                        <span>Trabalho {String(index + 1).padStart(2, '0')}</span>
                      </button>
                      {isEditing && (
                        <button
                          type="button"
                          className="portfolio-remove"
                          aria-label={`Remover trabalho ${index + 1}`}
                          onClick={() => removePortfolioImage(index)}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="portfolio-empty">
                <ImagePlus size={24} />
                <span>Adicione fotos reais dos seus trabalhos para melhorar a identificação.</span>
              </div>
            )}
          </section>
        )}
      </div>

      {isProfessional && (
        <section className="profile-panel profile-completed-page">
          <div className="completed-heading">
            <div>
              <span className="eyebrow">SERVIÇOS CONCLUÍDOS</span>
              <h2>Histórico de entregas</h2>
            </div>
            <strong>{completedServices.length} finalizados</strong>
          </div>
          {completedServices.length ? (
            <div className="completed-services-list">
              {completedServices.map((service) => (
                <article className="completed-service-card" key={service.id}>
                  <div className="completed-service-top">
                    <span>{service.category}</span>
                    <strong>
                      <Star size={15} />{' '}
                      {service.review_rating
                        ? Number(service.review_rating).toFixed(1)
                        : 'Sem nota'}
                    </strong>
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <dl>
                    <div>
                      <dt>Local</dt>
                      <dd>{service.city}</dd>
                    </div>
                    <div>
                      <dt>Entrega</dt>
                      <dd>{formatDate(service.deadline)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          ) : (
            <div className="completed-empty">
              <Check size={24} />
              <span>Os serviços finalizados aparecerão aqui após as primeiras entregas.</span>
            </div>
          )}
        </section>
      )}

      {isProfessional && (
        <section className="profile-panel profile-reviews-page">
          <div className="reviews-heading">
            <div>
              <span className="eyebrow">AVALIAÇÕES</span>
              <h2>Opinião dos clientes</h2>
            </div>
            <strong className="reviews-score">
              <Star size={17} /> {rating ? Number(rating).toFixed(1) : 'Novo'}
              <small>{reviewCount ? `${reviewCount} avaliações` : 'Sem avaliações'}</small>
            </strong>
          </div>
          {reviews.length ? (
            <div className="reviews-list">
              {reviews.map((review, index) => (
                <article className="profile-review-card" key={review.id || index}>
                  <div>
                    <strong>{review.client_name}</strong>
                    <span>{formatReviewDate(review.created_at)}</span>
                  </div>
                  <span className="review-stars">
                    <Star size={15} /> {review.rating}/5
                  </span>
                  <p>{review.comment}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="reviews-empty">
              <Star size={24} />
              <span>As avaliações dos clientes aparecerão aqui após os serviços concluídos.</span>
            </div>
          )}
        </section>
      )}

      {activePortfolioIndex !== null && portfolio[activePortfolioIndex] && (
        <div className="portfolio-lightbox" role="dialog" aria-modal="true">
          <button
            type="button"
            className="portfolio-lightbox-backdrop"
            aria-label="Fechar carrossel"
            onClick={() => setActivePortfolioIndex(null)}
          />
          <div className="portfolio-lightbox-content">
            <button
              type="button"
              className="icon-button portfolio-lightbox-close"
              aria-label="Fechar carrossel"
              onClick={() => setActivePortfolioIndex(null)}
            >
              <X size={18} />
            </button>
            <button
              type="button"
              className="portfolio-nav previous"
              aria-label="Foto anterior"
              onClick={showPreviousPortfolioImage}
            >
              <ChevronLeft size={24} />
            </button>
            <img
              src={portfolio[activePortfolioIndex]}
              alt={`Trabalho realizado ${activePortfolioIndex + 1}`}
            />
            <button
              type="button"
              className="portfolio-nav next"
              aria-label="Próxima foto"
              onClick={showNextPortfolioImage}
            >
              <ChevronRight size={24} />
            </button>
            <div className="portfolio-lightbox-footer">
              <span>
                Trabalho {activePortfolioIndex + 1} de {portfolio.length}
              </span>
              {isEditing && (
                <button
                  type="button"
                  className="text-button"
                  onClick={() => removePortfolioImage(activePortfolioIndex)}
                >
                  Remover foto
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 512000) {
      reject(new Error('Use imagens PNG, JPEG ou WebP de até 500 KB.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.readAsDataURL(file);
  });
}

function formatReviewDate(value) {
  if (!value) return 'Data não informada';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(value));
}
