export function securityHeaders(allowedOrigins = []) {
  return (req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'same-origin',
      'X-Frame-Options': 'DENY',
    });

    if (req.path.startsWith('/api')) res.set('Cache-Control', 'no-store');

    const sameOrigin = `${req.protocol}://${req.headers.host}`;
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
      req.headers.origin &&
      req.headers.origin !== sameOrigin &&
      !allowedOrigins.includes(req.headers.origin)
    ) {
      return res.status(403).json({ error: 'Origem da requisição não permitida.' });
    }

    next();
  };
}

export function requireJsonObject(req, res, next) {
  if (
    ['POST', 'PATCH'].includes(req.method) &&
    (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))
  ) {
    return res.status(400).json({ error: 'Envie um objeto JSON válido.' });
  }

  next();
}

export function attachUser(sessionStore) {
  return (req, res, next) => {
    req.user = sessionStore.findUserByCookie(req.headers.cookie);
    next();
  };
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Entre na sua conta para continuar.' });
  next();
}

export function requireRole(expected) {
  return (req, res, next) => {
    if (req.user.role !== expected) {
      return res
        .status(403)
        .json({ error: 'Esta ação não está disponível para seu tipo de conta.' });
    }

    next();
  };
}

export function rateLimitAuthAttempts() {
  const attempts = new Map();

  return (req, res, next) => {
    const now = Date.now();
    for (const [key, value] of attempts) if (value.until < now) attempts.delete(key);

    const key = req.ip;
    const item = attempts.get(key) || { count: 0, until: now + 60000 };
    item.count++;
    attempts.set(key, item);

    if (item.count > 20) {
      return res.status(429).json({ error: 'Muitas tentativas. Aguarde um minuto.' });
    }

    next();
  };
}

export function errorHandler(err, req, res, next) {
  if (!err.status || err.status >= 500) console.error(err);

  res.status(err.status || 500).json({
    error:
      err.status === 413
        ? 'O envio excede o limite de 5 MB.'
        : err instanceof SyntaxError
          ? 'Requisição inválida.'
          : err.status
            ? err.message
            : 'Não foi possível concluir a operação.',
  });
}
