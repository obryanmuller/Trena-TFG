import { Plus } from 'lucide-react';
import { filterMarketplaceItems } from '../app/formatters';
import MarketplaceFilters from '../components/MarketplaceFilters';
import { ProfessionalCard, ServiceCard } from '../components/MarketplaceCards';
import { Empty } from '../components/ui';

const PAGE_CONTENT = {
  services: {
    eyebrow: 'CONEXÕES QUE CONSTROEM',
    title: 'Seu próximo trabalho está aqui.',
    description: 'Explore oportunidades e converse diretamente com o cliente.',
  },
  professionals: {
    eyebrow: 'CONEXÕES QUE CONSTROEM',
    title: 'Encontre quem entende do assunto.',
    description: 'Conheça os perfis, veja portfólios e comece uma conversa.',
  },
  mine: {
    eyebrow: 'DA IDEIA À ENTREGA',
    title: 'Cada etapa, bem acompanhada.',
    description: 'Acompanhe suas solicitações, negociações e obras.',
  },
};

export default function MarketplacePage({
  type,
  items,
  filters,
  isClient,
  onFiltersChange,
  onCreateService,
  onViewProfessional,
  onViewService,
}) {
  const content = PAGE_CONTENT[type];
  const filteredItems = filterMarketplaceItems(items, filters);
  const showsProfessionals = type === 'professionals';

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{content.eyebrow}</span>
          <h1>{content.title}</h1>
          <p>{content.description}</p>
        </div>
        {isClient && !showsProfessionals && (
          <button className="button" onClick={onCreateService}>
            <Plus size={18} /> Publicar serviço
          </button>
        )}
      </div>
      <MarketplaceFilters type={type} filters={filters} onChange={onFiltersChange} />
      <div className="results-line">
        <strong>
          {filteredItems.length} {showsProfessionals ? 'profissionais' : 'serviços'}
        </strong>
        <span>Encontre a conexão certa para você</span>
      </div>
      <div className="cards">
        {filteredItems.map((item) =>
          showsProfessionals ? (
            <ProfessionalCard key={item.id} professional={item} onView={onViewProfessional} />
          ) : (
            <ServiceCard key={item.id} service={item} onView={onViewService} />
          ),
        )}
      </div>
      {!filteredItems.length && (
        <Empty title="Nenhum resultado por aqui">
          Tente outra cidade ou especialidade, ou comece um novo projeto.
        </Empty>
      )}
    </>
  );
}
