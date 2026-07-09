import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import cookie from 'cookie';
import getDb from './db';

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export function createSession(userId) {
  const db = getDb();
  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString();

  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(sessionId, userId, expiresAt);

  return sessionId;
}

export function getSessionUser(req) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const sessionId = cookies.session_id;
  if (!sessionId) return null;

  const db = getDb();
  const session = db.prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > datetime(\'now\')').get(sessionId);
  if (!session) return null;

  const user = db.prepare('SELECT id, name, phone, email, role FROM users WHERE id = ?').get(session.user_id);
  return user || null;
}

export function destroySession(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const sessionId = cookies.session_id;
  if (sessionId) {
    const db = getDb();
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
  }

  res.setHeader('Set-Cookie', cookie.serialize('session_id', '', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  }));
}

export function setSessionCookie(res, sessionId) {
  res.setHeader('Set-Cookie', cookie.serialize('session_id', sessionId, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  }));
}
