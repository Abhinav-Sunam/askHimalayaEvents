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
  const db = await getDb();

  if (req.method === 'GET') {
    const result = await db.query('SELECT * FROM events WHERE slug = $1', [slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    return res.status(200).json({ event: rowToEvent(result.rows[0]) });
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
    const user = await getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Must be logged in' });
    }

    const result = await db.query('SELECT id, created_by FROM events WHERE slug = $1', [slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const row = result.rows[0];

    if (user.role !== 'admin' && row.created_by !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await db.query('DELETE FROM saved_events WHERE event_id = $1', [row.id]);
    await db.query('DELETE FROM events WHERE slug = $1', [slug]);
    return res.status(200).json({ message: 'Event deleted successfully' });
  }

  if (req.method === 'PUT') {
    const user = await getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Must be logged in to edit events' });
    }

    const result = await db.query('SELECT id, created_by, image FROM events WHERE slug = $1', [slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const row = result.rows[0];

    if (user.role !== 'admin' && row.created_by !== user.id) {
      return res.status(403).json({ error: 'You can only edit your own events' });
    }

    const { title, description, about, date, time, location, venue, entryFee } = req.body;
    let newImage = row.image;
    if (req.file) {
      newImage = `/uploads/${req.file.filename}`;
    }

    await db.query(`
      UPDATE events 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          about = COALESCE($3, about),
          date = COALESCE($4, date),
          time = COALESCE($5, time),
          location = COALESCE($6, location),
          venue = COALESCE($7, venue),
          entry_fee = COALESCE($8, entry_fee),
          image = $9
      WHERE slug = $10
    `, [title, description, about, date, time, location, venue, entryFee, newImage, slug]);

    return res.status(200).json({ message: 'Event updated successfully' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
