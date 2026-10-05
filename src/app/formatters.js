import { VALID_ROUTES } from './config';

export const formatCurrency = (value) =>
  Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });

export const formatDate = (value) => new Date(value + 'T12:00:00').toLocaleDateString('pt-BR');

export const formatDateTime = (value) =>
  new Date(value.replace(' ', 'T') + 'Z').toLocaleString('pt-BR');

export const formatTime = (value) =>
  new Date(value.replace(' ', 'T') + 'Z').toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

export const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('');

export const getRoute = () => {
  const route = location.hash.slice(1);
  return VALID_ROUTES.includes(route) ? route : 'home';
};

export const normalizeText = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export function filterMarketplaceItems(items, filters) {
  const { query, category, city, status } = filters;
  return items.filter((item) => {
    const searchableText = [item.title, item.description, item.name, item.bio, item.specialty]
      .filter(Boolean)
      .join(' ');

    return (
      (!query || normalizeText(searchableText).includes(normalizeText(query))) &&
      (!category || (item.category || item.specialty) === category) &&
      (!city || normalizeText(item.city).includes(normalizeText(city))) &&
      (!status || item.status === status)
    );
  });
}
