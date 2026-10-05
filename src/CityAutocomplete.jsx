import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import cities from './data/cities.json';
import { suggestCities } from './city-search.mjs';
import './city-autocomplete.css';

export default function CityAutocomplete({
  value,
  onChange,
  name,
  label,
  placeholder = 'Cidade ou região',
}) {
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const id = useId();
  const input = useRef();
  const text = value ?? draft;
  const suggestions = useMemo(() => suggestCities(cities, text), [text]);
  const expanded = open && text.trim().length >= 2;
  useEffect(() => {
    if (expanded && active >= 0)
      document.getElementById(id + '-' + active)?.scrollIntoView({ block: 'nearest' });
  }, [active, expanded, id]);
  function update(next) {
    setDraft(next);
    onChange?.(next);
  }
  function choose(city) {
    update(city);
    setOpen(false);
    setActive(-1);
    input.current?.focus();
  }
  return (
    <div className="city-autocomplete">
      <input
        ref={input}
        name={name}
        role="combobox"
        aria-label={label}
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={expanded ? id : undefined}
        aria-activedescendant={expanded && active >= 0 ? `${id}-${active}` : undefined}
        autoComplete="off"
        placeholder={placeholder}
        value={text}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setOpen(false);
          setActive(-1);
        }}
        onChange={(e) => {
          update(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            if (open) e.stopPropagation();
            setOpen(false);
            setActive(-1);
          }
          if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && suggestions.length) {
            e.preventDefault();
            setOpen(true);
            setActive((n) =>
              e.key === 'ArrowDown'
                ? (n + 1) % suggestions.length
                : n <= 0
                  ? suggestions.length - 1
                  : n - 1,
            );
          }
          if (e.key === 'Enter' && expanded && active >= 0 && suggestions[active]) {
            e.preventDefault();
            choose(suggestions[active]);
          }
        }}
      />
      {expanded && (
        <div className="city-suggestions">
          <div className="city-suggestions-heading">Selecione a cidade</div>
          <ul role="listbox" id={id} aria-label="Cidades sugeridas">
            {suggestions.map((city, index) => (
              <li
                key={city}
                id={`${id}-${index}`}
                role="option"
                aria-selected={active === index}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(city)}
              >
                <MapPin size={15} />
                <span>{city.slice(0, -4)}</span>
                <small>{city.slice(-2)}</small>
              </li>
            ))}
          </ul>
          {!suggestions.length && (
            <p role="status">Nenhuma cidade encontrada. Confira o nome digitado.</p>
          )}
          <div className="city-suggestions-footer">Use ↑ ↓ e Enter para selecionar</div>
        </div>
      )}
    </div>
  );
}
