import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'askhimalaya.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initializeTables();
    seedData();
  }
  return db;
}

function initializeTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      about TEXT,
      image TEXT,
      date TEXT NOT NULL,
      date_full TEXT,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      venue TEXT,
      entry_fee TEXT DEFAULT 'Free',
      cta TEXT DEFAULT 'Register',
      badge_color TEXT DEFAULT '#6CFCFE',
      badge_text_color TEXT DEFAULT '#434544',
      age_limit TEXT DEFAULT 'All ages allowed',
      event_type TEXT,
      organized_by TEXT,
      duration TEXT,
      things_to_know TEXT,
      carousel_bg TEXT,
      carousel_date TEXT,
      carousel_venue TEXT,
      created_by TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS saved_events (
      user_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, event_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (event_id) REFERENCES events(id)
    );
  `);
}

function seedData() {
  const count = db.prepare('SELECT COUNT(*) as c FROM events').get();
  if (count.c > 0) return;

  // Seed admin user
  const adminId = uuidv4();
  const adminHash = bcrypt.hashSync('admin123', 10);
  db.prepare(`
    INSERT OR IGNORE INTO users (id, name, phone, email, password_hash, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(adminId, 'Admin', '+910000000000', 'admin@askhimalaya.com', adminHash, 'admin');

  // Seed events
  const seedEvents = [
    {
      slug: 'creative-branding-workshop',
      category: 'WORKSHOP',
      title: 'Creative Branding Workshop',
      description: 'Learn visual storytelling and branding fundamentals through hands-on exercises.',
      about: 'Dive deep into the world of brand building with industry experts. This intensive workshop covers visual identity, storytelling techniques, color psychology, and hands-on exercises to help you create a powerful brand.',
      image: '/images/creative-branding.jpeg',
      date: '15 Jun 2026',
      date_full: 'Sunday, 15 June, 2026',
      time: '12:00 PM - 5:00 PM',
      location: 'Nerfvana, Darjeeling',
      venue: 'Nerfvana, Darjeeling',
      entry_fee: 'Rs 500',
      cta: 'Register',
      badge_color: '#6CFCFE',
      badge_text_color: '#434544',
      age_limit: 'All ages allowed',
      event_type: 'Workshop',
      organized_by: 'Creative Collective',
      duration: '5 Hours',
      things_to_know: JSON.stringify(['Duration: 5 Hours', 'Material provided for all attendees', 'Entry allowed for all ages', 'Certificate provided', 'Food and beverages included']),
      carousel_bg: 'linear-gradient(90deg, #F1D595 21.15%, #FFFBFB 92.79%)',
      carousel_date: 'Sun, 15 Jun, 12:00 pm',
      carousel_venue: 'Nerfvana, Darjeeling',
    },
    {
      slug: 'melody-nights',
      category: 'PARTY',
      title: 'Melody Nights',
      description: 'Celebrate community and creativity at our upcoming live music showcase.',
      about: 'An unforgettable evening celebrating music, community, and creativity. Featuring talented emerging artists from across the Himalayan region.',
      image: '/images/melody-nights.jpg.webp',
      date: '22 Jun 2026',
      date_full: 'Monday, 22 June, 2026',
      time: '6:00 PM - 10:00 PM',
      location: 'Chowrasta, Darjeeling',
      venue: 'Chowrasta, Darjeeling',
      entry_fee: 'Rs 300',
      cta: 'Get Tickets',
      badge_color: '#FFEE31',
      badge_text_color: '#020604',
      age_limit: 'All ages allowed',
      event_type: 'Live Music',
      organized_by: 'Gather Gang',
      duration: '4 Hours',
      things_to_know: JSON.stringify(['Duration: 4 Hours', 'Ticket needed for all ages', 'Entry allowed for all ages', 'Kid friendly', 'Pets not allowed']),
      carousel_bg: 'linear-gradient(90deg, #B8D4F5 21.15%, #E8F4FF 92.79%)',
      carousel_date: 'Mon, 22 Jun, 6:00 pm',
      carousel_venue: 'Chowrasta, Darjeeling',
    },
    {
      slug: 'startup-connect',
      category: 'NETWORKING',
      title: 'Start-up Connect',
      description: 'Connect with founders, investors and innovators. Build relationships that matter.',
      about: 'An exclusive networking event bringing together the brightest minds in the startup ecosystem.',
      image: '/images/startup.jpg',
      date: '28 Jun 2026',
      date_full: 'Sunday, 28 June, 2026',
      time: '4:00 PM - 8:00 PM',
      location: 'Gymkhana, Darjeeling',
      venue: 'Gymkhana, Darjeeling',
      entry_fee: 'Rs 200',
      cta: 'Register',
      badge_color: '#CA7DF3',
      badge_text_color: '#FFFFFF',
      age_limit: '18+ only',
      event_type: 'Networking',
      organized_by: 'StartupDJ',
      duration: '4 Hours',
      things_to_know: JSON.stringify(['Duration: 4 Hours', 'Ticket needed for all ages', 'Entry allowed for all ages', 'Kid friendly', 'Pets not allowed']),
      carousel_bg: 'linear-gradient(90deg, #F1D595 21.15%, #FFFBFB 92.79%)',
      carousel_date: 'Sun, 28 Jun, 4:00 pm',
      carousel_venue: 'Gymkhana, Darjeeling',
    },
  ];

  const insert = db.prepare(`
    INSERT INTO events (id, slug, category, title, description, about, image, date, date_full, time, location, venue, entry_fee, cta, badge_color, badge_text_color, age_limit, event_type, organized_by, duration, things_to_know, carousel_bg, carousel_date, carousel_venue, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const e of seedEvents) {
    insert.run(
      uuidv4(), e.slug, e.category, e.title, e.description, e.about, e.image,
      e.date, e.date_full, e.time, e.location, e.venue, e.entry_fee, e.cta,
      e.badge_color, e.badge_text_color, e.age_limit, e.event_type, e.organized_by,
      e.duration, e.things_to_know, e.carousel_bg, e.carousel_date, e.carousel_venue, adminId
    );
  }
}

// Convert DB row to frontend-friendly event object
export function rowToEvent(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    category: row.category,
    title: row.title,
    description: row.description,
    about: row.about || '',
    image: row.image,
    date: row.date,
    dateFull: row.date_full || row.date,
    time: row.time,
    location: row.location,
    venue: row.venue || row.location,
    entryFee: row.entry_fee,
    cta: row.cta || 'Register',
    badgeColor: row.badge_color || '#6CFCFE',
    badgeTextColor: row.badge_text_color || '#434544',
    ageLimit: row.age_limit || 'All ages allowed',
    eventType: row.event_type || row.category,
    organizedBy: row.organized_by || 'AskHimalaya',
    duration: row.duration || '',
    thingsToKnow: row.things_to_know ? JSON.parse(row.things_to_know) : [],
    carouselBg: row.carousel_bg || 'linear-gradient(90deg, #F1D595 21.15%, #FFFBFB 92.79%)',
    carouselDate: row.carousel_date || row.date,
    carouselVenue: row.carousel_venue || row.venue || row.location,
    createdBy: row.created_by,
  };
}

// Saved events helpers
export function toggleSavedEvent(userId, eventId) {
  const db = getDb();
  const existing = db.prepare('SELECT 1 FROM saved_events WHERE user_id = ? AND event_id = ?').get(userId, eventId);
  if (existing) {
    db.prepare('DELETE FROM saved_events WHERE user_id = ? AND event_id = ?').run(userId, eventId);
    return { saved: false };
  } else {
    db.prepare('INSERT INTO saved_events (user_id, event_id) VALUES (?, ?)').run(userId, eventId);
    return { saved: true };
  }
}

export function isEventSaved(userId, eventId) {
  if (!userId) return false;
  const db = getDb();
  const existing = db.prepare('SELECT 1 FROM saved_events WHERE user_id = ? AND event_id = ?').get(userId, eventId);
  return !!existing;
}

export function getSavedEventsForUser(userId) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT e.* FROM events e
    JOIN saved_events s ON e.id = s.event_id
    WHERE s.user_id = ?
    ORDER BY s.created_at DESC
  `).all(userId);
  return rows.map(rowToEvent);
}

export default getDb;
