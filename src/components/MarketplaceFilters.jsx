import { MapPin, Search, SlidersHorizontal } from 'lucide-react';
import CityAutocomplete from '../CityAutocomplete';
import { CATEGORIES, STATUSES } from '../app/config';

export default function MarketplaceFilters({ type, filters, onChange }) {
  const update = (field) => (eventOrValue) => {
    const value = eventOrValue?.target ? eventOrValue.target.value : eventOrValue;
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="filters">
      <label className="search">
        <Search size={19} />
        <input
          aria-label="Buscar por palavra-chave"
          placeholder={type === 'professionals' ? 'Nome ou especialidade' : 'O que você procura?'}
          value={filters.query}
          onChange={update('query')}
        />
      </label>
      <label className="select-wrap">
        <SlidersHorizontal size={16} />
        <select aria-label="Especialidade" value={filters.category} onChange={update('category')}>
          <option value="">Todas as especialidades</option>
          {CATEGORIES.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </label>
      <div className="city-input">
        <MapPin size={17} />
        <CityAutocomplete
          label="Filtrar cidade ou região"
          value={filters.city}
          onChange={update('city')}
        />
      </div>
      {type === 'mine' && (
        <select aria-label="Status do serviço" value={filters.status} onChange={update('status')}>
          <option value="">Todos os status</option>
          {Object.entries(STATUSES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
