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
    portfolio: JSON.parse(user.portfolio),
    rating: user.rating || null,
    review_count: user.review_count || 0,
  };
}

export function toAuthenticatedUser(user) {
  return { ...toPublicUser(user), email: user.email };
}

export function toService(row) {
  return { ...row, images: JSON.parse(row.images) };
}
