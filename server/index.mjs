import { createDb } from './db.mjs';
import { createApp } from './app.mjs';
try {
  process.loadEnvFile();
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const db = createDb(process.env.DB_PATH || 'data/trena.sqlite', process.env.DEMO_SEED === '1');
const port = Number(process.env.PORT || 4311);
const server = createApp(db, {
  secureCookies: process.env.NODE_ENV === 'production',
  allowedOrigins:
    process.env.NODE_ENV !== 'production' && process.env.DEV_CLIENT_ORIGIN
      ? [process.env.DEV_CLIENT_ORIGIN]
      : [],
}).listen(port, process.env.HOST || '127.0.0.1', () =>
  console.log(`TRENA API disponível em http://127.0.0.1:${port}`),
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () =>
    server.close(() => {
      db.close();
      process.exit(0);
    }),
  );
