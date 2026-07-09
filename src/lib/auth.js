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

export async function createSession(userId) {
  const db = await getDb();
  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString();

  await db.query('INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)', [sessionId, userId, expiresAt]);

  return sessionId;
}

export async function getSessionUser(req) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const sessionId = cookies.session_id;
  if (!sessionId) return null;

  const db = await getDb();
  const sessionRes = await db.query('SELECT * FROM sessions WHERE id = $1 AND expires_at > CURRENT_TIMESTAMP', [sessionId]);
  if (sessionRes.rows.length === 0) return null;

  const session = sessionRes.rows[0];

  const userRes = await db.query('SELECT id, name, phone, email, role FROM users WHERE id = $1', [session.user_id]);
  return userRes.rows.length > 0 ? userRes.rows[0] : null;
}

export async function destroySession(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const sessionId = cookies.session_id;
  if (sessionId) {
    const db = await getDb();
    await db.query('DELETE FROM sessions WHERE id = $1', [sessionId]);
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
