import getDb from '../../../lib/db';
import { hashPassword, createSession, setSessionCookie } from '../../../lib/auth';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, password } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ error: 'Name, phone, and password are required' });
  }

  const db = await getDb();

  // Check if user exists
  const existingRes = await db.query('SELECT id FROM users WHERE phone = $1', [phone]);
  if (existingRes.rows.length > 0) {
    return res.status(409).json({ error: 'Phone number already registered' });
  }

  if (email) {
    const existingEmailRes = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingEmailRes.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
  }

  const userId = uuidv4();
  const passwordHash = hashPassword(password);

  await db.query(
    'INSERT INTO users (id, name, phone, email, password_hash) VALUES ($1, $2, $3, $4, $5)',
    [userId, name, phone, email || null, passwordHash]
  );

  const sessionId = await createSession(userId);
  setSessionCookie(res, sessionId);

  return res.status(201).json({
    user: { id: userId, name, phone, email, role: 'user' },
  });
}
