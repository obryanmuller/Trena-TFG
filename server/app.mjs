import express from 'express';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { toAuthenticatedUser } from './domain.mjs';
import {
  attachUser,
  errorHandler,
  rateLimitAuthAttempts,
  requireAuth,
  requireJsonObject,
  requireRole,
  securityHeaders,
} from './middleware.mjs';
import { ConversationService } from './conversation-service.mjs';
import { NotificationService } from './notification-service.mjs';
import { ServiceService } from './service-service.mjs';
import { SessionStore } from './session-store.mjs';
import { UserService } from './user-service.mjs';

const uid = () => randomUUID();

export function createApp(db, { secureCookies = false, allowedOrigins = [] } = {}) {
  const app = express();
  const sessionStore = new SessionStore(db, { secureCookies });
  const notifications = new NotificationService(db, uid);
  const users = new UserService(db, uid);
  const services = new ServiceService(db, notifications, uid);
  const conversations = new ConversationService(db, notifications, uid);

  app.disable('x-powered-by');
  app.use(securityHeaders(allowedOrigins));
  app.use(express.json({ limit: '5mb' }));
  app.use('/api', requireJsonObject);
  app.use('/api', attachUser(sessionStore));
  app.use(['/api/auth/login', '/api/auth/register'], rateLimitAuthAttempts());

  app.get('/api/health', (req, res) => res.json({ ok: true }));

  app.get('/api/auth/me', (req, res) =>
    res.json({ user: req.user ? toAuthenticatedUser(req.user) : null }),
  );

  app.post('/api/auth/register', (req, res) => {
    const user = users.register(req.body);
    res.status(201).json({ user: sessionStore.create(res, user) });
  });

  app.post('/api/auth/login', (req, res) => {
    const user = users.login(req.body);
    res.json({ user: sessionStore.create(res, user) });
  });

  app.post('/api/auth/logout', requireAuth, (req, res) => {
    sessionStore.destroy(res, req.headers.cookie);
    res.json({ ok: true });
  });

  app.patch('/api/profile', requireAuth, (req, res) => {
    res.json({ user: users.updateProfile(req.user, req.body) });
  });

  app.get('/api/professionals', (req, res) => {
    res.json(users.listProfessionals());
  });

  app.get('/api/professionals/:id', (req, res) => {
    res.json(users.professionalProfile(req.params.id));
  });

  app.get('/api/services', (req, res) => {
    const result = req.query.mine === '1' ? services.listMine(req.user) : services.listVisible();
    res.json(result);
  });

  app.post('/api/services', requireAuth, requireRole('client'), (req, res) => {
    res.status(201).json(services.create(req.body, req.user));
  });

  app.post('/api/services/:id/interest', requireAuth, requireRole('professional'), (req, res) => {
    res.json(services.registerInterest(req.params.id, req.user));
  });

  app.patch('/api/services/:id/status', requireAuth, requireRole('client'), (req, res) => {
    services.changeStatus(req.params.id, req.user, req.body);
    res.json({ ok: true });
  });

  app.get('/api/conversations', requireAuth, (req, res) => {
    res.json(conversations.listByUser(req.user));
  });

  app.get('/api/conversations/:id/messages', requireAuth, (req, res) => {
    res.json(conversations.listMessages(req.params.id, req.user));
  });

  app.post('/api/conversations/:id/messages', requireAuth, (req, res) => {
    res.status(201).json(conversations.sendMessage(req.params.id, req.user, req.body));
  });

  app.post('/api/services/:id/reviews', requireAuth, requireRole('client'), (req, res) => {
    services.review(req.params.id, req.user, req.body);
    res.status(201).json({ ok: true });
  });

  app.get('/api/notifications', requireAuth, (req, res) => {
    res.json(notifications.listByUser(req.user.id));
  });

  app.patch('/api/notifications/read', requireAuth, (req, res) => {
    notifications.markAllAsRead(req.user.id);
    res.json({ ok: true });
  });

  app.patch('/api/notifications/conversation/:id/read', requireAuth, (req, res) => {
    notifications.markConversationAsRead(req.user.id, req.params.id);
    res.json({ ok: true });
  });

  app.patch('/api/notifications/:id/read', requireAuth, (req, res) => {
    notifications.markAsRead(req.user.id, req.params.id);
    res.json({ ok: true });
  });

  app.use('/api', (req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));
  serveClientBuild(app);
  app.use(errorHandler);

  return app;
}

function serveClientBuild(app) {
  const dist = resolve('dist');
  if (!existsSync(dist)) return;

  app.use(express.static(dist));
  app.get('/{*path}', (req, res) => res.sendFile(resolve(dist, 'index.html')));
}
