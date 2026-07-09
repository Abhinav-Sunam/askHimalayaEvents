import getDb from '../../../lib/db';
import { verifyPassword, createSession, setSessionCookie } from '../../../lib/auth';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Phone/email and password are required' });
  }

  const db = getDb();

  // Find user by phone or email
  const user = db.prepare(
    'SELECT * FROM users WHERE phone = ? OR email = ?'
  ).get(identifier, identifier);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (!verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const sessionId = createSession(user.id);
  setSessionCookie(res, sessionId);

  return res.status(200).json({
    user: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role },
  });
}
