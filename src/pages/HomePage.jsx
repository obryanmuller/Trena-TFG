import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  HardHat,
  MapPin,
  MessageSquare,
  Search,
  Star,
  Users,
} from 'lucide-react';
import CityAutocomplete from '../CityAutocomplete';
import InteriorArt from '../InteriorArt';
import { CATEGORIES, CATEGORY_ICONS } from '../app/config';
import { ProfessionalCard, ServiceCard } from '../components/MarketplaceCards';
import { Empty } from '../components/ui';

export default function HomePage({
  user,
  professionals,
  services,
  onNavigate,
  onSearch,
  onSelectCategory,
  onOpenModal,
  onRequireAuth,
  onViewProfessional,
  onViewService,
}) {
  const isClient = user?.role === 'client';

  return (
    <>
      <section className="market-hero">
        <div className="market-hero-copy">
          <span className="eyebrow">PARA CADA PROJETO, UMA BOA CONEXÃO</span>
          <h1>
            Sua casa merece.
            <br />
            Encontre quem
            <br />
            <em>faz acontecer.</em>
          </h1>
          <p>
            Da pintura à reforma completa. Encontre profissionais da sua região e tire seus planos
            do papel.
          </p>
          <form
            className="hero-search"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              onSearch(data.get('term'), data.get('region'));
            }}
          >
            <label>
              <Search size={19} />
              <input
                name="term"
                aria-label="Serviço ou profissional"
                placeholder="De que serviço você precisa?"
              />
            </label>
            <div className="hero-city">
              <MapPin size={18} />
              <CityAutocomplete name="region" label="Cidade da busca" placeholder="Sua cidade" />
            </div>
            <button className="button yellow" aria-label="Buscar profissionais">
              Buscar <ArrowRight size={18} />
            </button>
          </form>
          <div className="popular-searches">
            <span>Buscas populares:</span>
            {['Pintura', 'Alvenaria', 'Elétrica'].map((category) => (
              <button key={category} onClick={() => onSelectCategory(category)}>
                {category}
              </button>
            ))}
          </div>
        </div>
        <div className="market-hero-art">
          <InteriorArt hero />
          <span className="art-caption">Inspiração para o seu próximo projeto · Ilustração</span>
          <div className="hero-floating">
            <span>
              <HardHat size={24} />
            </span>
            <div>
              O próximo passo da sua obra<strong>começa com a pessoa certa.</strong>
            </div>
          </div>
        </div>
      </section>

      <div className="market-benefits">
        <span>
          <Users size={19} />
          <b>Escolha com mais informação</b> Perfis e portfólios em um só lugar
        </span>
        <span>
          <MessageSquare size={19} />
          <b>Converse diretamente</b> Combine os detalhes pelo chat
        </span>
        <span>
          <Star size={19} />
          <b>Compartilhe sua experiência</b> Avalie após o serviço concluído
        </span>
      </div>

      <SectionHeading eyebrow="ENCONTRE SUA ESPECIALIDADE" title="O que sua casa precisa hoje?">
        <button className="text-button" onClick={() => onNavigate('professionals')}>
          Explorar tudo <ArrowRight size={17} />
        </button>
      </SectionHeading>
      <div className="category-grid">
        {CATEGORIES.map((category, index) => {
          const Icon = CATEGORY_ICONS[category];
          const count = professionals.filter(
            (professional) => professional.specialty === category,
          ).length;

          return (
            <button
              className={'market-category category-' + index}
              key={category}
              onClick={() => onSelectCategory(category)}
            >
              <span className="category-bubble">
                <Icon size={30} />
              </span>
              <span>{category}</span>
              <small>
                {count} {count === 1 ? 'profissional' : 'profissionais'}
              </small>
            </button>
          );
        })}
      </div>

      <SectionHeading
        eyebrow="CONHEÇA QUEM PODE AJUDAR"
        title="Talento para transformar seus planos."
        description="Explore especialidades, conheça os trabalhos e encontre sua próxima conexão."
      >
        <button className="text-button" onClick={() => onNavigate('professionals')}>
          Ver todos os profissionais <ArrowRight size={17} />
        </button>
      </SectionHeading>
      <div className="cards professional-grid">
        {professionals.slice(0, 3).map((professional) => (
          <ProfessionalCard
            key={professional.id}
            professional={professional}
            onView={onViewProfessional}
          />
        ))}
      </div>
      {!professionals.length && (
        <Empty title="Uma comunidade em construção">
          Os primeiros profissionais aparecerão aqui.
        </Empty>
      )}

      <section className="request-banner">
        <span className="banner-icon">
          <BriefcaseBusiness size={30} />
        </span>
        <div>
          <span className="eyebrow">DEIXE O PRÓXIMO PASSO COM A GENTE</span>
          <h2>Conte sua ideia. Encontre boas mãos.</h2>
          <p>Publique o que precisa e converse com profissionais interessados.</p>
        </div>
        <button
          className="button yellow"
          onClick={() =>
            onRequireAuth(() =>
              isClient ? onOpenModal({ type: 'create' }) : onNavigate('services'),
            )
          }
        >
          {user && !isClient ? 'Encontrar trabalhos' : 'Publicar meu projeto'}
          <ArrowUpRight size={18} />
        </button>
      </section>

      <SectionHeading
        eyebrow="PARA QUEM COLOCA A MÃO NA MASSA"
        title="Novos projetos, novas oportunidades."
        description="Encontre o próximo trabalho para colocar seu talento em prática."
      >
        <button className="text-button" onClick={() => onNavigate('services')}>
          Ver todos os serviços <ArrowRight size={17} />
        </button>
      </SectionHeading>
      <div className="cards">
        {services.slice(0, 3).map((service) => (
          <ServiceCard key={service.id} service={service} onView={onViewService} />
        ))}
      </div>
      {!services.length && (
        <Empty title="Novos projetos começam com você">
          Publique o primeiro serviço da plataforma.
        </Empty>
      )}

      <section className="market-how">
        <div>
          <span className="eyebrow">SIMPLES DO COMEÇO AO FIM</span>
          <h2>
            Uma boa obra.
            <br />
            Três bons passos.
          </h2>
          <button className="text-button" onClick={() => onOpenModal({ type: 'help' })}>
            Entenda como funciona <ArrowRight size={17} />
          </button>
        </div>
        {HOW_IT_WORKS.map(({ number, title, description }) => (
          <div key={number}>
            <span className="step-number">{number}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        ))}
      </section>
    </>
  );
}

function SectionHeading({ eyebrow, title, description, children }) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}

const HOW_IT_WORKS = [
  {
    number: '01',
    title: 'Encontre',
    description: 'Explore perfis e portfólios de profissionais da sua região.',
  },
  {
    number: '02',
    title: 'Converse',
    description: 'Alinhe os detalhes, o orçamento e o prazo diretamente pelo chat.',
  },
  {
    number: '03',
    title: 'Transforme',
    description: 'Acompanhe seu serviço e avalie a experiência ao concluir.',
  },
];
