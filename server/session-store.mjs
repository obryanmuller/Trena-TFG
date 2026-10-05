import { randomBytes, createHash } from 'node:crypto';
import { SESSION_COOKIE, SESSION_DURATION_MS, toAuthenticatedUser } from './domain.mjs';

export function digest(token) {
  return createHash('sha256').update(token).digest('hex');
}

export class SessionStore {
  constructor(db, { secureCookies = false } = {}) {
    this.db = db;
    this.secureCookies = secureCookies;
  }

  findUserByCookie(cookieHeader) {
    const token = this.readToken(cookieHeader);
    if (!token) return null;

    return this.db
      .prepare(
        'SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires>?',
      )
      .get(digest(token), Date.now());
  }

  create(res, user) {
    const token = randomBytes(32).toString('hex');

    this.db.prepare('DELETE FROM sessions WHERE expires<=?').run(Date.now());
    this.db
      .prepare('INSERT INTO sessions VALUES(?,?,?)')
      .run(digest(token), user.id, Date.now() + SESSION_DURATION_MS);

    res.cookie(SESSION_COOKIE, token, this.cookieOptions({ maxAge: SESSION_DURATION_MS }));
    return toAuthenticatedUser(user);
  }

  destroy(res, cookieHeader) {
    const token = this.readToken(cookieHeader);
    if (token) this.db.prepare('DELETE FROM sessions WHERE token=?').run(digest(token));
    res.clearCookie(SESSION_COOKIE, this.cookieOptions());
  }

  readToken(cookieHeader = '') {
    return cookieHeader
      .split(';')
      .map((value) => value.trim())
      .find((value) => value.startsWith(`${SESSION_COOKIE}=`))
      ?.slice(SESSION_COOKIE.length + 1);
  }

  cookieOptions(extra = {}) {
    return {
      httpOnly: true,
      sameSite: 'strict',
      secure: this.secureCookies,
      path: '/',
      ...extra,
    };
  }
}
