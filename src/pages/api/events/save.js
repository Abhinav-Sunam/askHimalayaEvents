import getDb, { toggleSavedEvent } from '../../../lib/db';
import { getSessionUser } from '../../../lib/auth';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Must be logged in to save events' });
  }

  const { eventId } = req.body;
  if (!eventId) {
    return res.status(400).json({ error: 'Missing eventId' });
  }

  const result = toggleSavedEvent(user.id, eventId);
  return res.status(200).json(result);
}
