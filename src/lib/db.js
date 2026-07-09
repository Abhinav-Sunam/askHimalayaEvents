import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Pre-create the user hashes
const abhinavHash = bcrypt.hashSync('abhinav123', 10);
const adminHash = bcrypt.hashSync('admin123', 10);

// In-Memory Data Arrays
let MOCK_USERS = [
  {
    id: 'user-abhinav',
    name: 'Abhinav',
    phone: '+919999999999',
    email: 'abhinav@gmail.com',
    password_hash: abhinavHash,
    role: 'user',
    created_at: new Date().toISOString()
  },
  {
    id: 'user-admin',
    name: 'Admin',
    phone: '+910000000000',
    email: 'admin@gmail.com',
    password_hash: adminHash,
    role: 'admin',
    created_at: new Date().toISOString()
  }
];

let MOCK_EVENTS = [
  {
    id: 'event-creative-branding',
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
    created_by: 'user-admin',
    created_at: new Date().toISOString()
  },
  {
    id: 'event-melody-nights',
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
    created_by: 'user-admin',
    created_at: new Date().toISOString()
  },
  {
    id: 'event-startup-connect',
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
    created_by: 'user-admin',
    created_at: new Date().toISOString()
  }
];

let MOCK_SESSIONS = [];
let MOCK_SAVED_EVENTS = [];

// A mock Database Client matching pg pool interface
const mockPool = {
  async query(sqlText, params = []) {
    const cleanSql = sqlText.replace(/\s+/g, ' ').trim().toLowerCase();

    // 1. SELECT * FROM events ORDER BY created_at DESC
    if (cleanSql.startsWith('select * from events order by created_at desc')) {
      const sortedEvents = [...MOCK_EVENTS].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      return { rows: sortedEvents };
    }

    // 2. SELECT * FROM events WHERE slug = $1
    if (cleanSql.startsWith('select * from events where slug = $1')) {
      const found = MOCK_EVENTS.find(e => e.slug === params[0]);
      return { rows: found ? [found] : [] };
    }

    // 3. SELECT * FROM events WHERE id = $1
    if (cleanSql.startsWith('select * from events where id = $1')) {
      const found = MOCK_EVENTS.find(e => e.id === params[0]);
      return { rows: found ? [found] : [] };
    }

    // 4. SELECT id, created_by, image FROM events WHERE slug = $1
    if (cleanSql.startsWith('select id, created_by, image from events where slug = $1')) {
      const found = MOCK_EVENTS.find(e => e.slug === params[0]);
      if (found) {
        return { rows: [{ id: found.id, created_by: found.created_by, image: found.image }] };
      }
      return { rows: [] };
    }

    // 5. SELECT count(*) as c FROM events
    if (cleanSql.startsWith('select count(*) as c from events')) {
      return { rows: [{ c: MOCK_EVENTS.length }] };
    }

    // 6. SELECT 1 FROM saved_events WHERE user_id = $1 AND event_id = $2
    if (cleanSql.startsWith('select 1 from saved_events where user_id = $1 and event_id = $2')) {
      const exists = MOCK_SAVED_EVENTS.some(
        se => se.user_id === params[0] && se.event_id === params[1]
      );
      return { rows: exists ? [{ 1: 1 }] : [] };
    }

    // 7. SELECT e.* FROM events e JOIN saved_events s ON e.id = s.event_id WHERE s.user_id = $1 ORDER BY s.created_at DESC
    if (cleanSql.includes('join saved_events')) {
      const userId = params[0];
      const savedForUser = MOCK_SAVED_EVENTS.filter(se => se.user_id === userId);
      const matchedEvents = MOCK_EVENTS.filter(e =>
        savedForUser.some(se => se.event_id === e.id)
      );
      // Sort matching the saved time (in reverse)
      const sortedMatched = matchedEvents.map(e => {
        const matchingSave = savedForUser.find(se => se.event_id === e.id);
        return { ...e, saved_created_at: matchingSave ? matchingSave.created_at : e.created_at };
      }).sort((a, b) => new Date(b.saved_created_at) - new Date(a.saved_created_at));

      return { rows: sortedMatched };
    }

    // 8. SELECT * FROM sessions WHERE id = $1 AND expires_at > CURRENT_TIMESTAMP
    if (cleanSql.startsWith('select * from sessions where id = $1 and expires_at >')) {
      const now = new Date();
      const found = MOCK_SESSIONS.find(s => s.id === params[0] && new Date(s.expires_at) > now);
      return { rows: found ? [found] : [] };
    }

    // 9. SELECT id, name, phone, email, role FROM users WHERE id = $1
    if (cleanSql.startsWith('select id, name, phone, email, role from users where id = $1')) {
      const found = MOCK_USERS.find(u => u.id === params[0]);
      if (found) {
        return { rows: [{ id: found.id, name: found.name, phone: found.phone, email: found.email, role: found.role }] };
      }
      return { rows: [] };
    }

    // 10. SELECT * FROM users WHERE phone = $1 OR email = $2
    if (cleanSql.startsWith('select * from users where phone = $1 or email = $2')) {
      const found = MOCK_USERS.find(u => u.phone === params[0] || u.email === params[1]);
      return { rows: found ? [found] : [] };
    }

    // 11. SELECT id FROM users WHERE phone = $1
    if (cleanSql.startsWith('select id from users where phone = $1')) {
      const found = MOCK_USERS.find(u => u.phone === params[0]);
      return { rows: found ? [{ id: found.id }] : [] };
    }

    // 12. SELECT id FROM users WHERE email = $1
    if (cleanSql.startsWith('select id from users where email = $1')) {
      const found = MOCK_USERS.find(u => u.email === params[0]);
      return { rows: found ? [{ id: found.id }] : [] };
    }

    // 13. INSERT INTO users (id, name, phone, email, password_hash)
    if (cleanSql.startsWith('insert into users')) {
      const newUser = {
        id: params[0],
        name: params[1],
        phone: params[2],
        email: params[3],
        password_hash: params[4],
        role: 'user',
        created_at: new Date().toISOString()
      };
      MOCK_USERS.push(newUser);
      return { rows: [newUser] };
    }

    // 14. INSERT INTO sessions (id, user_id, expires_at)
    if (cleanSql.startsWith('insert into sessions')) {
      const newSession = {
        id: params[0],
        user_id: params[1],
        expires_at: params[2]
      };
      MOCK_SESSIONS.push(newSession);
      return { rows: [newSession] };
    }

    // 15. INSERT INTO events
    if (cleanSql.startsWith('insert into events')) {
      const newEvent = {
        id: params[0],
        slug: params[1],
        category: params[2],
        title: params[3],
        description: params[4],
        about: params[5],
        image: params[6],
        date: params[7],
        date_full: params[8],
        time: params[9],
        location: params[10],
        venue: params[11],
        entry_fee: params[12],
        cta: params[13],
        badge_color: params[14],
        badge_text_color: params[15],
        age_limit: params[16],
        event_type: params[17],
        organized_by: params[18],
        duration: params[19],
        things_to_know: params[20],
        carousel_bg: params[21],
        carousel_date: params[22],
        carousel_venue: params[23],
        created_by: params[24],
        created_at: new Date().toISOString()
      };
      MOCK_EVENTS.push(newEvent);
      return { rows: [newEvent] };
    }

    // 16. INSERT INTO saved_events
    if (cleanSql.startsWith('insert into saved_events')) {
      const newSaved = {
        user_id: params[0],
        event_id: params[1],
        created_at: new Date().toISOString()
      };
      MOCK_SAVED_EVENTS.push(newSaved);
      return { rows: [newSaved] };
    }

    // 17. DELETE FROM saved_events WHERE user_id = $1 AND event_id = $2
    if (cleanSql.startsWith('delete from saved_events where user_id = $1 and event_id = $2')) {
      MOCK_SAVED_EVENTS = MOCK_SAVED_EVENTS.filter(
        se => !(se.user_id === params[0] && se.event_id === params[1])
      );
      return { rows: [] };
    }

    // 18. DELETE FROM saved_events WHERE event_id = $1
    if (cleanSql.startsWith('delete from saved_events where event_id = $1')) {
      MOCK_SAVED_EVENTS = MOCK_SAVED_EVENTS.filter(se => se.event_id === params[0]);
      return { rows: [] };
    }

    // 19. DELETE FROM sessions WHERE id = $1
    if (cleanSql.startsWith('delete from sessions where id = $1')) {
      MOCK_SESSIONS = MOCK_SESSIONS.filter(s => s.id !== params[0]);
      return { rows: [] };
    }

    // 20. DELETE FROM events WHERE slug = $1
    if (cleanSql.startsWith('delete from events where slug = $1')) {
      MOCK_EVENTS = MOCK_EVENTS.filter(e => e.slug !== params[0]);
      return { rows: [] };
    }

    // 21. UPDATE events SET ... WHERE slug = $10
    if (cleanSql.startsWith('update events set')) {
      const slugIndex = MOCK_EVENTS.findIndex(e => e.slug === params[9]);
      if (slugIndex !== -1) {
        const ev = MOCK_EVENTS[slugIndex];
        MOCK_EVENTS[slugIndex] = {
          ...ev,
          title: params[0] !== undefined ? params[0] : ev.title,
          description: params[1] !== undefined ? params[1] : ev.description,
          about: params[2] !== undefined ? params[2] : ev.about,
          date: params[3] !== undefined ? params[3] : ev.date,
          time: params[4] !== undefined ? params[4] : ev.time,
          location: params[5] !== undefined ? params[5] : ev.location,
          venue: params[6] !== undefined ? params[6] : ev.venue,
          entry_fee: params[7] !== undefined ? params[7] : ev.entry_fee,
          image: params[8] !== undefined ? params[8] : ev.image
        };
      }
      return { rows: [] };
    }

    // Fallback/Default
    return { rows: [] };
  }
};

async function getDb() {
  return mockPool;
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
export async function toggleSavedEvent(userId, eventId) {
  const db = await getDb();
  const existing = await db.query('SELECT 1 FROM saved_events WHERE user_id = $1 AND event_id = $2', [userId, eventId]);
  if (existing.rows.length > 0) {
    await db.query('DELETE FROM saved_events WHERE user_id = $1 AND event_id = $2', [userId, eventId]);
    return { saved: false };
  } else {
    await db.query('INSERT INTO saved_events (user_id, event_id) VALUES ($1, $2)', [userId, eventId]);
    return { saved: true };
  }
}

export async function isEventSaved(userId, eventId) {
  if (!userId) return false;
  const db = await getDb();
  const existing = await db.query('SELECT 1 FROM saved_events WHERE user_id = $1 AND event_id = $2', [userId, eventId]);
  return existing.rows.length > 0;
}

export async function getSavedEventsForUser(userId) {
  const db = await getDb();
  const res = await db.query(`
    SELECT e.* FROM events e
    JOIN saved_events s ON e.id = s.event_id
    WHERE s.user_id = $1
    ORDER BY s.created_at DESC
  `, [userId]);
  return res.rows.map(rowToEvent);
}

export default getDb;
