export const CATEGORIES = [
  'Alvenaria',
  'Pintura',
  'Elétrica',
  'Hidráulica',
  'Marcenaria',
  'Reformas gerais',
];

export const SESSION_COOKIE = 'trena_session';
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function fail(status, message) {
  throw new ApiError(status, message);
}

export function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    city: user.city,
    specialty: user.specialty,
    bio: user.bio,
    portfolio: JSON.parse(String(user.portfolio || '[]').trim() || '[]'),
    avatar_image: user.avatar_image || '',
    cover_image: user.cover_image || '',
    rating: user.rating || null,
    review_count: user.review_count || 0,
  };
}

export function toAuthenticatedUser(user) {
  return { ...toPublicUser(user), email: user.email };
}

export function toService(row) {
  return {
    ...row,
    images: JSON.parse(String(row.images || '[]')),
    completion_images: JSON.parse(String(row.completion_images || '[]')),
    closure_reason: row.closure_reason || '',
  };
}
