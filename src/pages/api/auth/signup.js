import getDb from '../../../lib/db';
import { hashPassword, createSession, setSessionCookie } from '../../../lib/auth';
import { v4 as uuidv4 } from 'uuid';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, password } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ error: 'Name, phone, and password are required' });
  }

  const db = getDb();

  // Check if user exists
  const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
  if (existing) {
    return res.status(409).json({ error: 'Phone number already registered' });
  }

  if (email) {
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already registered' });
    }
  }

  const userId = uuidv4();
  const passwordHash = hashPassword(password);

  db.prepare(
    'INSERT INTO users (id, name, phone, email, password_hash) VALUES (?, ?, ?, ?, ?)'
  ).run(userId, name, phone, email || null, passwordHash);

  const sessionId = createSession(userId);
  setSessionCookie(res, sessionId);

  return res.status(201).json({
    user: { id: userId, name, phone, email, role: 'user' },
  });
}
