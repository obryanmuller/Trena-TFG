export const normalizeCity = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
export function suggestCities(cities, query, limit = 8) {
  const term = normalizeCity(query);
  if (term.length < 2) return [];
  const words = term.split(/\s+/);
  return cities
    .filter((city) => words.every((word) => normalizeCity(city).includes(word)))
    .sort(
      (a, b) =>
        Number(normalizeCity(b).startsWith(term)) - Number(normalizeCity(a).startsWith(term)) ||
        a.localeCompare(b, 'pt-BR'),
    )
    .slice(0, limit);
}
