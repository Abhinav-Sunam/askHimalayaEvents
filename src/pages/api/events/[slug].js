import getDb, { rowToEvent } from '../../../lib/db';
import { getSessionUser } from '../../../lib/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: { bodyParser: false },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `event-${uuidv4()}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Fallback JSON parser for when multer doesn't process the body
function jsonParser(req, res) {
  return new Promise((resolve) => {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('application/json')) {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => {
        try {
          req.body = data ? JSON.parse(data) : {};
        } catch(e) {}
        resolve();
      });
    } else {
      req.body = req.body || {};
      resolve();
    }
  });
}

export default async function handler(req, res) {
  const { slug } = req.query;
  const db = getDb();

  if (req.method === 'GET') {
    const row = db.prepare('SELECT * FROM events WHERE slug = ?').get(slug);
    if (!row) {
      return res.status(404).json({ error: 'Event not found' });
    }
    return res.status(200).json({ event: rowToEvent(row) });
  }

  // Parse body for PUT and DELETE
  if (req.method === 'PUT' || req.method === 'DELETE') {
    if (req.headers['content-type']?.startsWith('multipart/form-data')) {
      await runMiddleware(req, res, upload.single('image'));
    } else {
      await jsonParser(req, res);
    }
  }

  if (req.method === 'DELETE') {
    const user = getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Must be logged in' });
    }

    const row = db.prepare('SELECT id, created_by FROM events WHERE slug = ?').get(slug);
    if (!row) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (user.role !== 'admin' && row.created_by !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.prepare('DELETE FROM saved_events WHERE event_id = ?').run(row.id);
    db.prepare('DELETE FROM events WHERE slug = ?').run(slug);
    return res.status(200).json({ message: 'Event deleted successfully' });
  }

  if (req.method === 'PUT') {
    const user = getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Must be logged in to edit events' });
    }

    const row = db.prepare('SELECT id, created_by, image FROM events WHERE slug = ?').get(slug);
    if (!row) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (user.role !== 'admin' && row.created_by !== user.id) {
      return res.status(403).json({ error: 'You can only edit your own events' });
    }

    const { title, description, about, date, time, location, venue, entryFee } = req.body;
    let newImage = row.image;
    if (req.file) {
      newImage = `/uploads/${req.file.filename}`;
    }

    db.prepare(`
      UPDATE events 
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          about = COALESCE(?, about),
          date = COALESCE(?, date),
          time = COALESCE(?, time),
          location = COALESCE(?, location),
          venue = COALESCE(?, venue),
          entry_fee = COALESCE(?, entry_fee),
          image = ?
      WHERE slug = ?
    `).run(title, description, about, date, time, location, venue, entryFee, newImage, slug);

    return res.status(200).json({ message: 'Event updated successfully' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
