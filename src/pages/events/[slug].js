import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import getDb, { rowToEvent, isEventSaved } from '../../lib/db';
import { getSessionUser } from '../../lib/auth';
import styles from '../../styles/EventDetail.module.css';

export default function EventDetailPage({ event, initialIsSaved }) {
  const router = useRouter();
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // If the user logs in client-side, we might want to check the save status.
    // However, since we fetch it SSR, it's mostly correct unless they log in on this page.
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      router.push(`/login?redirect=/events/${event.slug}`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/events/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id })
      });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.saved);
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        const res = await fetch(`/api/events/${event.slug}`, { method: 'DELETE' });
        if (res.ok) {
          router.push('/events');
        } else {
          alert('Failed to delete event');
        }
      } catch (err) {
        alert('An error occurred');
      }
    }
  };

  if (!event) {
    return (
      <main style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#fff', fontFamily: 'Montserrat', fontSize: 24 }}>Event not found.</p>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>{`${event.title} — AskHimalaya Events`}</title>
        <meta name="description" content={event.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.page}>
        <Navbar activePage="EVENTS" />

        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <span onClick={() => router.push('/events')} className={styles.breadcrumbLink}>Events</span>
          <svg width="11" height="11" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 5L12 10L7 15" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <span className={styles.breadcrumbCurrent}>{event.title}</span>
        </div>

        {/* Hero */}
        <div className={styles.heroSection}>
          <div className={styles.heroLeft}>
            <h1 className={styles.heroTitle}>{event.title}</h1>
            <p className={styles.heroMeta}>
              <span>{event.dateFull.split(',')[0]}, {event.time}</span>
              <span className={styles.metaDivider}></span>
              <span>{event.venue}</span>
            </p>

            {/* Event image */}
            <div className={styles.heroImageContainer}>
              <Image
                src={event.image}
                alt={event.title}
                fill
                className={styles.heroImage}
                priority
              />
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.saveShare}>
              <button className={styles.actionBtn} onClick={handleSave} disabled={saving}>
                {isSaved ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {isSaved ? 'Saved' : 'Save event'}
              </button>
              <button className={styles.actionBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.8"/>
                  <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
                  <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                Share
              </button>
            </div>

            <h2 className={styles.aboutTitle}>Description</h2>
            <p className={styles.aboutText}>{event.description}</p>
            
            <h2 className={styles.aboutTitle} style={{ marginTop: '24px' }}>About</h2>
            <p className={styles.aboutText}>{event.about}</p>
            
            {user && (user.role === 'admin' || user.id === event.createdBy) && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => router.push(`/events/${event.slug}/edit`)}
                  style={{
                    background: 'rgba(128, 196, 57, 0.1)',
                    color: '#80C439',
                    border: '1px solid rgba(128, 196, 57, 0.2)',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit Event
                </button>
                <button 
                  onClick={handleDelete}
                  style={{
                    background: 'rgba(233, 60, 60, 0.1)',
                    color: '#E93C3C',
                    border: '1px solid rgba(233, 60, 60, 0.2)',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Delete Event
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Details section */}
        <div className={styles.detailsSection}>
          {/* Event Details */}
          <div className={styles.detailsLeft}>
            <h3 className={styles.detailsTitle}>Event Details</h3>
            <div className={styles.detailsGrid}>
              {[
                { icon: 'date', label: 'Date', value: event.dateFull },
                { icon: 'time', label: 'Time', value: `${event.time} (IST)` },
                { icon: 'location', label: 'Venue', value: event.venue },
                { icon: 'people', label: 'Age Limit', value: event.ageLimit },
                { icon: 'music', label: 'Event type', value: event.eventType },
                { icon: 'org', label: 'Organised by', value: event.organizedBy },
              ].map(detail => (
                <div key={detail.label} className={styles.detailRow}>
                  <span className={styles.detailIcon}>{getDetailIcon(detail.icon)}</span>
                  <span className={styles.detailLabel}>{detail.label}</span>
                  <span className={styles.detailValue}>{detail.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Things to know */}
          {event.thingsToKnow && event.thingsToKnow.length > 0 && (
            <div className={styles.thingsToKnow}>
              <h3 className={styles.detailsTitle}>Things to know</h3>
              <ul className={styles.thingsList}>
                {event.thingsToKnow.map((item, i) => (
                  <li key={i} className={styles.thingsItem}>
                    <span className={styles.thingsIcon}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="5.5" stroke="#E6E6E6"/>
                        <path d="M3.5 6L5 7.5L8.5 4.5" stroke="#E6E6E6" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Price & CTA */}
          <div className={styles.priceCta}>
            <div className={styles.priceBlock}>
              <span className={styles.price}>{event.entryFee}</span>
              <span className={styles.onwards}>onwards</span>
            </div>
            <button className={styles.ticketButton}>Get Your Tickets</button>
            <p className={styles.secureCheckout}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7v6c0 5.25 3.89 10.17 9 11 5.11-.83 9-5.75 9-11V7L12 2z" stroke="#E6E6E6" strokeWidth="1.5"/>
                <path d="M9 12l2 2 4-4" stroke="#E6E6E6" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Secure Checkout
            </p>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}

function getDetailIcon(type) {
  switch (type) {
    case 'date':
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="#E6E6E6" strokeWidth="1.9"/>
          <path d="M3 9h18M8 2v4M16 2v4" stroke="#E6E6E6" strokeWidth="1.9" strokeLinecap="round"/>
        </svg>
      );
    case 'time':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#E6E6E6" strokeWidth="1.9"/>
          <path d="M12 7v5l3 3" stroke="#E6E6E6" strokeWidth="1.9" strokeLinecap="round"/>
        </svg>
      );
    case 'location':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#E6E6E6"/>
          <circle cx="12" cy="9" r="2.5" fill="#000"/>
        </svg>
      );
    case 'people':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#E6E6E6" strokeWidth="1.8"/>
          <circle cx="9" cy="7" r="4" stroke="#E6E6E6" strokeWidth="1.8"/>
        </svg>
      );
    case 'music':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M9 18V5l12-2v13" stroke="#E6E6E6" strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="6" cy="18" r="3" stroke="#E6E6E6" strokeWidth="1.8"/>
          <circle cx="18" cy="16" r="3" stroke="#E6E6E6" strokeWidth="1.8"/>
        </svg>
      );
    case 'org':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="7" width="20" height="14" rx="2" stroke="#E6E6E6" strokeWidth="1.8"/>
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="#E6E6E6" strokeWidth="1.8"/>
        </svg>
      );
    default:
      return null;
  }
}

export async function getServerSideProps(context) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM events WHERE slug = ?').get(context.params.slug);
  
  if (!row) {
    return { notFound: true };
  }
  
  const event = rowToEvent(row);
  
  const user = getSessionUser(context.req);
  const initialIsSaved = user ? isEventSaved(user.id, event.id) : false;
  
  return { props: { event, initialIsSaved } };
}
