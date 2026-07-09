import getDb, { rowToEvent } from '../../../lib/db';
import { getSessionUser } from '../../../lib/auth';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Disable Next.js body parsing for multipart
export const config = {
  api: { bodyParser: false },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
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

function runMulter(req, res) {
  return new Promise((resolve, reject) => {
    upload.single('image')(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + uuidv4().slice(0, 6);
}

const CAROUSEL_BACKGROUNDS = [
  'linear-gradient(90deg, #F1D595 21.15%, #FFFBFB 92.79%)',
  'linear-gradient(90deg, #B8D4F5 21.15%, #E8F4FF 92.79%)',
  'linear-gradient(90deg, #F5B8D4 21.15%, #FFE8F4 92.79%)',
  'linear-gradient(90deg, #B8F5D4 21.15%, #E8FFF4 92.79%)',
  'linear-gradient(90deg, #D4B8F5 21.15%, #F4E8FF 92.79%)',
];

const BADGE_COLORS = {
  WORKSHOP: { bg: '#6CFCFE', text: '#434544' },
  PARTY: { bg: '#FFEE31', text: '#020604' },
  NETWORKING: { bg: '#CA7DF3', text: '#FFFFFF' },
  CONFERENCE: { bg: '#FF8A65', text: '#FFFFFF' },
  WEBINAR: { bg: '#4FC3F7', text: '#000000' },
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM events ORDER BY created_at DESC').all();
    const events = rows.map(rowToEvent);
    return res.status(200).json({ events });
  }

  if (req.method === 'POST') {
    await runMulter(req, res);

    const user = getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Must be logged in to create events' });
    }

    const { title, category, description, about, date, time, location, venue, duration, ageLimit, entryFee, thingsToKnow } = req.body;

    if (!title || !category || !description || !date || !time || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const slug = slugify(title);
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '/images/creative-branding.jpeg';
    const badge = BADGE_COLORS[category] || BADGE_COLORS.WORKSHOP;
    const carouselBg = CAROUSEL_BACKGROUNDS[Math.floor(Math.random() * CAROUSEL_BACKGROUNDS.length)];

    // Format date for carousel
    const dateObj = new Date(date);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayName = days[dateObj.getDay()];
    const monthName = months[dateObj.getMonth()];
    const dayNum = dateObj.getDate();
    const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const carouselDate = `${dayName}, ${dayNum} ${monthName}, ${time.split(' - ')[0]?.toLowerCase() || ''}`;
    const dateFull = `${days[dateObj.getDay()]}, ${dayNum} ${fullMonthNames[dateObj.getMonth()]}, ${dateObj.getFullYear()}`;
    const dateShort = `${dayNum} ${monthName} ${dateObj.getFullYear()}`;

    const db = getDb();
    const id = uuidv4();

    db.prepare(`
      INSERT INTO events (id, slug, category, title, description, about, image, date, date_full, time, location, venue, entry_fee, cta, badge_color, badge_text_color, age_limit, event_type, organized_by, duration, things_to_know, carousel_bg, carousel_date, carousel_venue, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, slug, category, title, description, about || '', imagePath,
      dateShort, dateFull, time, location, venue || location,
      entryFee || 'Free', 'Register',
      badge.bg, badge.text,
      ageLimit || 'All ages allowed', category, user.name,
      duration || '', thingsToKnow || JSON.stringify([]),
      carouselBg, carouselDate, venue || location, user.id
    );

    const newEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    return res.status(201).json({ event: rowToEvent(newEvent) });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
