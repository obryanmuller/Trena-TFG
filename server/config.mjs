// Explicit public origins work behind HTTPS proxies without trusting request headers.
export function getAllowedOrigins(env = process.env) {
  return [
    env.PUBLIC_APP_URL,
    env.RENDER_EXTERNAL_URL,
    env.NODE_ENV !== 'production' ? env.DEV_CLIENT_ORIGIN : undefined,
  ]
    .filter(Boolean)
    .map((value) => new URL(value).origin);
}
