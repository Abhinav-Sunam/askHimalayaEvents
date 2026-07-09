import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import styles from './EventsListing.module.css';

const categoryFilters = [
  { id: 'all', label: 'All', icon: null },
  { id: 'WORKSHOP', label: 'Workshops', icon: 'workshop' },
  { id: 'CONFERENCE', label: 'Conferences', icon: 'conference' },
  { id: 'PARTY', label: 'Celebrations', icon: 'party' },
  { id: 'WEBINAR', label: 'Webinars', icon: 'webinar' },
];

function WorkshopIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function ConferenceIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM6 20v-2a6 6 0 0 1 12 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="6" cy="8" r="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M2 20v-1a4 4 0 0 1 6-3.46" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function PartyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  );
}

function WebinarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M10 8l6 4-6 4V8z" fill="currentColor"/>
    </svg>
  );
}

function getFilterIcon(icon) {
  switch (icon) {
    case 'workshop': return <WorkshopIcon />;
    case 'conference': return <ConferenceIcon />;
    case 'party': return <PartyIcon />;
    case 'webinar': return <WebinarIcon />;
    default: return null;
  }
}

export default function EventsListing({ events = [] }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ show: false, slug: null });
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const filtered = activeFilter === 'all'
    ? events
    : events.filter(e => e.category === activeFilter);

  const handleDeleteClick = (e, slug) => {
    e.stopPropagation();
    setDeleteError('');
    setDeleteModal({ show: true, slug });
  };

  const confirmDelete = async () => {
    if (!deleteModal.slug || deleting) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/events/${deleteModal.slug}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDeleteModal({ show: false, slug: null });
        router.replace(router.asPath);
      } else {
        setDeleteError(data.error || 'Failed to delete event');
      }
    } catch (err) {
      setDeleteError('Failed to delete event. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className={styles.section} id="all-events">
      <div className={styles.header}>
        <h2 className={styles.title}>All Events</h2>
        <div className={styles.underline} />
      </div>

      {/* Filter pills */}
      <div className={styles.filters}>
        {categoryFilters.map(filter => (
          <button
            key={filter.id}
            className={`${styles.filterBtn} ${activeFilter === filter.id ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.icon && (
              <span className={styles.filterIcon}>{getFilterIcon(filter.icon)}</span>
            )}
            {filter.label}
          </button>
        ))}
      </div>

      {/* Event cards */}
      <div className={styles.eventsList}>
        {filtered.length > 0 ? filtered.map(event => (
          <div
            key={event.id}
            className={styles.card}
            onClick={() => router.push(`/events/${event.slug}`)}
            style={{ position: 'relative' }}
          >
            {user && user.role === 'admin' && (
              <button
                onClick={(e) => handleDeleteClick(e, event.slug)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: '#E93C3C',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                }}
                title="Delete Event"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
            {/* Image */}
            <div className={styles.imageContainer}>
              <Image
                src={event.image}
                alt={event.title}
                fill
                className={styles.eventImage}
              />
            </div>

            {/* Text info */}
            <div className={styles.textInfo}>
              <div className={styles.textContent}>
                {/* Badge */}
                <div
                  className={styles.badge}
                  style={{ background: event.badgeColor, color: event.badgeTextColor }}
                >
                  {event.category}
                </div>

                <h3 className={styles.eventTitle}>{event.title}</h3>
                <p className={styles.description}>{event.description}</p>

                {/* Meta */}
                <div className={styles.metaRow}>
                  <div className={styles.metaItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.9"/>
                      <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
                    </svg>
                    <span>{event.date}</span>
                  </div>
                  <div className={styles.metaSpacer} />
                  <div className={styles.metaItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.9"/>
                      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
                    </svg>
                    <span>{event.time}</span>
                  </div>
                  <div className={styles.metaSpacer} />
                  <div className={styles.metaItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor"/>
                      <circle cx="12" cy="9" r="2.5" fill="white"/>
                    </svg>
                    <span>
                      {event.venue && event.venue.toLowerCase() !== event.location.toLowerCase() 
                        ? `${event.venue}, ${event.location}` 
                        : event.location}
                    </span>
                  </div>
                </div>

                <button
                  className={styles.ctaButton}
                  onClick={(e) => { e.stopPropagation(); router.push(`/events/${event.slug}`); }}
                >
                  {event.cta}
                </button>
              </div>
            </div>

            {/* Hover arrow icon */}
            <div className={styles.arrowButton}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        )) : (
          <p className={styles.noResults}>No events in this category yet.</p>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className={styles.modalOverlay} onClick={() => setDeleteModal({ show: false, slug: null })}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.mascotWrapper}>
              <Image 
                src="/images/Mascot-04.svg" 
                alt="AskHimalaya Mascot" 
                width={120} 
                height={120} 
                className={styles.mascotImg}
                priority
              />
            </div>
            <h3 className={styles.modalTitle}>Wait, delete event?</h3>
            <p className={styles.modalDescription}>
              Are you sure you want to remove this event? Once deleted, it will be gone forever and cannot be undone.
            </p>
            {deleteError && <p className={styles.modalError}>{deleteError}</p>}
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelBtn}
                onClick={() => setDeleteModal({ show: false, slug: null })}
                disabled={deleting}
              >
                No, Keep it
              </button>
              <button 
                className={styles.deleteBtn}
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
