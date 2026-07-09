import { getSavedEventsForUser } from '../../../lib/db';
import { getSessionUser } from '../../../lib/auth';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Must be logged in to view saved events' });
  }

  const events = getSavedEventsForUser(user.id);
  return res.status(200).json({ events });
}
