import {
  Armchair,
  BriefcaseBusiness,
  Building2,
  Droplets,
  Hammer,
  HardHat,
  LayoutDashboard,
  MessageSquare,
  Paintbrush,
  Users,
  Zap,
} from 'lucide-react';

export const CATEGORIES = [
  'Alvenaria',
  'Pintura',
  'Elétrica',
  'Hidráulica',
  'Marcenaria',
  'Reformas gerais',
];

export const CATEGORY_ICONS = {
  Alvenaria: Hammer,
  Pintura: Paintbrush,
  Elétrica: Zap,
  Hidráulica: Droplets,
  Marcenaria: Armchair,
  'Reformas gerais': Building2,
};

export const STATUSES = {
  open: 'Em aberto',
  negotiating: 'Em negociação',
  active: 'Em execução',
  completed: 'Concluído',
  paused: 'Pausado',
  not_completed: 'Não concluído',
};

export const NAV_ITEMS = [
  ['home', 'Explorar', LayoutDashboard],
  ['services', 'Encontrar serviços', BriefcaseBusiness],
  ['professionals', 'Profissionais', Users],
  ['mine', 'Meus serviços', HardHat],
  ['chat', 'Mensagens', MessageSquare],
];

export const VALID_ROUTES = [
  ...NAV_ITEMS.map(([route]) => route),
  'profile',
  'professional-profile',
];
