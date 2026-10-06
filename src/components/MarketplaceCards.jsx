import { ArrowUpRight, CalendarDays, MapPin, Star } from 'lucide-react';
import SpecialtyArt, { SpecialtyBadge } from '../SpecialtyArt';
import { formatCurrency, formatDate } from '../app/formatters';
import { Avatar, Status } from './ui';

export function ProfessionalCard({ professional, onView }) {
  const coverImage = professional.cover_image || professional.portfolio?.[0] || '';

  return (
    <article className="professional-card">
      <button
        className="professional-cover"
        onClick={() => onView(professional)}
        aria-label={'Conhecer ' + professional.name}
      >
        {coverImage ? (
          <img src={coverImage} alt={'Capa profissional de ' + professional.name} />
        ) : (
          <SpecialtyArt category={professional.specialty} />
        )}
        <SpecialtyBadge category={professional.specialty} />
        {!coverImage && <span className="cover-disclaimer">Ilustração da categoria</span>}
      </button>
      <div className="professional-content">
        <div className="professional-top">
          <Avatar name={professional.name} image={professional.avatar_image} />
          <div>
            <h3>
              <button className="title-button" onClick={() => onView(professional)}>
                {professional.name}
              </button>
            </h3>
            <p className="location">
              <MapPin size={13} />
              {professional.city}
            </p>
          </div>
          <span className="rating">
            <Star size={14} />
            {professional.rating ? Number(professional.rating).toFixed(1) : 'Novo'}
          </span>
        </div>
        <p className="bio">
          {professional.bio || 'Conheça o perfil e converse sobre seu projeto.'}
        </p>
        <div className="card-bottom">
          <span>
            {professional.review_count
              ? professional.review_count + ' avaliações'
              : 'Conheça este profissional'}
          </span>
          <button className="text-button" onClick={() => onView(professional)}>
            Ver perfil <ArrowUpRight size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}

export function ServiceCard({ service, onView }) {
  return (
    <article className="service-card">
      {service.images?.length > 0 && (
        <img className="service-photo" src={service.images[0]} alt={'Foto de ' + service.title} />
      )}
      <div className="service-top">
        <SpecialtyBadge category={service.category} />
        <Status value={service.status} />
      </div>
      <h3>
        <button className="title-button" onClick={() => onView(service)}>
          {service.title}
        </button>
      </h3>
      <p className="clamp">{service.description}</p>
      <div className="service-meta">
        <span>
          <MapPin size={14} />
          {service.city}
        </span>
        <span>
          <CalendarDays size={14} />
          Até {formatDate(service.deadline)}
        </span>
      </div>
      <div className="card-bottom">
        <div>
          <small>Orçamento estimado</small>
          <strong>{formatCurrency(service.budget)}</strong>
        </div>
        <button
          aria-label={`Ver detalhes de ${service.title}`}
          className="round-button"
          onClick={() => onView(service)}
        >
          <ArrowUpRight size={20} />
        </button>
      </div>
    </article>
  );
}
