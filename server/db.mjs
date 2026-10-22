import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
export function checkPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  return timingSafeEqual(Buffer.from(hash, 'hex'), scryptSync(password, salt, 64));
}
export function createDb(path = 'data/trena.sqlite', seed = false) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('client','professional')), city TEXT NOT NULL, specialty TEXT NOT NULL DEFAULT '', bio TEXT NOT NULL DEFAULT '', portfolio TEXT NOT NULL DEFAULT '[]', avatar_image TEXT NOT NULL DEFAULT '', cover_image TEXT NOT NULL DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS services (id TEXT PRIMARY KEY, client_id TEXT NOT NULL REFERENCES users(id), professional_id TEXT REFERENCES users(id), title TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL, city TEXT NOT NULL, budget REAL NOT NULL CHECK(budget > 0), deadline TEXT NOT NULL, images TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','negotiating','active','completed','paused','not_completed')), completion_images TEXT NOT NULL DEFAULT '[]', closure_reason TEXT NOT NULL DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS conversations (id TEXT PRIMARY KEY, service_id TEXT NOT NULL REFERENCES services(id), client_id TEXT NOT NULL REFERENCES users(id), professional_id TEXT NOT NULL REFERENCES users(id), UNIQUE(service_id,professional_id));
    CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL REFERENCES conversations(id), sender_id TEXT NOT NULL REFERENCES users(id), text TEXT NOT NULL, image TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, service_id TEXT UNIQUE NOT NULL REFERENCES services(id), client_id TEXT NOT NULL REFERENCES users(id), professional_id TEXT NOT NULL REFERENCES users(id), rating REAL NOT NULL CHECK(rating BETWEEN 1 AND 5), comment TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), text TEXT NOT NULL, conversation_id TEXT REFERENCES conversations(id), is_read INTEGER NOT NULL DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
    CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id,created_at);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id,created_at);
    CREATE INDEX IF NOT EXISTS idx_services_filters ON services(status,category,city);
  `);
  migrateServiceStatuses(db);
  ensureColumn(db, 'users', 'avatar_image', "TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, 'users', 'cover_image', "TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, 'services', 'completion_images', "TEXT NOT NULL DEFAULT '[]'");
  ensureColumn(db, 'services', 'closure_reason', "TEXT NOT NULL DEFAULT ''");
  if (seed && !db.prepare('SELECT id FROM users LIMIT 1').get()) {
    const password = hashPassword('Trena@2026');
    const insert = db.prepare(
      'INSERT INTO users(id,name,email,password,role,city,specialty,bio) VALUES(?,?,?,?,?,?,?,?)',
    );
    insert.run(
      'demo-client',
      'Marina Costa',
      'cliente@trena.demo',
      password,
      'client',
      'Itajubá, MG',
      '',
      'Planejando uma casa com mais espaço para boas histórias.',
    );
    for (const [id, name, email, city, specialty, bio] of [
      [
        'demo-pro',
        'Carlos Oliveira',
        'profissional@trena.demo',
        'Itajubá, MG',
        'Alvenaria',
        'Reformas residenciais, assentamento de pisos e pequenos reparos. Trabalho com planejamento, organização e atenção ao acabamento.',
      ],
      [
        'demo-painter',
        'Ana Santos',
        'ana@trena.demo',
        'Itajubá, MG',
        'Pintura',
        'Pintura de interiores e exteriores, preparação de paredes e acabamentos decorativos.',
      ],
      [
        'demo-electric',
        'Rafael Lima',
        'rafael@trena.demo',
        'Pouso Alegre, MG',
        'Elétrica',
        'Instalações elétricas residenciais, iluminação e manutenção preventiva.',
      ],
    ])
      insert.run(id, name, email, password, 'professional', city, specialty, bio);
    const add = db.prepare(
      'INSERT INTO services(id,client_id,title,description,category,city,budget,deadline) VALUES(?,?,?,?,?,?,?,?)',
    );
    const deadline = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    add.run(
      'demo-service-1',
      'demo-client',
      'Um novo visual para a sala',
      'Pintura das paredes e do teto de uma sala de aproximadamente 25 m². É necessário preparar duas pequenas fissuras. Materiais podem ser combinados.',
      'Pintura',
      'Itajubá, MG',
      1800,
      deadline,
    );
    add.run(
      'demo-service-2',
      'demo-client',
      'Reforma do banheiro social',
      'Troca do revestimento e assentamento de piso em banheiro de 6 m². Gostaria de combinar uma visita para avaliar o trabalho.',
      'Alvenaria',
      'Itajubá, MG',
      4500,
      deadline,
    );
    add.run(
      'demo-service-3',
      'demo-client',
      'Instalação de iluminação na cozinha',
      'Instalar quatro pontos de iluminação e revisar duas tomadas na cozinha.',
      'Elétrica',
      'Pouso Alegre, MG',
      650,
      deadline,
    );
  }
  if (seed) ensureDemoCompletedService(db);
  return db;
}

function migrateServiceStatuses(db) {
  const table = db
    .prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='services'")
    .get();
  if (!table?.sql || table.sql.includes('not_completed')) return;

  db.exec(`
    PRAGMA foreign_keys=OFF;
    ALTER TABLE services RENAME TO services_old;
    CREATE TABLE services (id TEXT PRIMARY KEY, client_id TEXT NOT NULL REFERENCES users(id), professional_id TEXT REFERENCES users(id), title TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL, city TEXT NOT NULL, budget REAL NOT NULL CHECK(budget > 0), deadline TEXT NOT NULL, images TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','negotiating','active','completed','paused','not_completed')), completion_images TEXT NOT NULL DEFAULT '[]', closure_reason TEXT NOT NULL DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
    INSERT INTO services(id,client_id,professional_id,title,description,category,city,budget,deadline,images,status,created_at)
      SELECT id,client_id,professional_id,title,description,category,city,budget,deadline,images,status,created_at FROM services_old;
    DROP TABLE services_old;
    PRAGMA foreign_keys=ON;
    CREATE INDEX IF NOT EXISTS idx_services_filters ON services(status,category,city);
  `);
}

function ensureDemoCompletedService(db) {
  const client = db.prepare("SELECT id FROM users WHERE id='demo-client'").get();
  const professional = db.prepare("SELECT id FROM users WHERE id='demo-pro'").get();
  if (!client || !professional) return;

  if (!db.prepare("SELECT id FROM services WHERE id='demo-completed-1'").get()) {
    db.prepare(
      'INSERT INTO services(id,client_id,professional_id,title,description,category,city,budget,deadline,images,status) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
    ).run(
      'demo-completed-1',
      'demo-client',
      'demo-pro',
      'Piso porcelanato da varanda',
      'Serviço concluído: nivelamento do contrapiso, assentamento de porcelanato e acabamento dos rejuntes na varanda gourmet.',
      'Alvenaria',
      'Itajubá, MG',
      2400,
      '2026-08-18',
      '[]',
      'completed',
    );
  }

  if (!db.prepare("SELECT id FROM reviews WHERE id='demo-review-47'").get()) {
    db.prepare(
      'INSERT INTO reviews(id,service_id,client_id,professional_id,rating,comment) VALUES(?,?,?,?,?,?)',
    ).run(
      'demo-review-47',
      'demo-completed-1',
      'demo-client',
      'demo-pro',
      4.7,
      'Serviço finalizado com ótimo acabamento e organização. Pequenos ajustes no prazo, mas a entrega ficou excelente.',
    );
  }
}

function ensureColumn(db, table, column, definition) {
  const exists = db
    .prepare(`PRAGMA table_info(${table})`)
    .all()
    .some((item) => item.name === column);
  if (!exists) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}
