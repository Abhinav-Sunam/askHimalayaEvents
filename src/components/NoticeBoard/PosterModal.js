import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './NoticeBoard.module.css';

export default function PosterModal({ event, onClose }) {
  // Close on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!event) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className={styles.modalClose} onClick={onClose} aria-label="Close">
          ✕
        </button>

        {/* Poster image */}
        <div style={{ position: 'relative', width: '100%', height: 280 }}>
          <Image
            src={event.image}
            alt={event.title}
            fill
            style={{ objectFit: 'cover' }}
            sizes="560px"
          />
        </div>

        {/* Body content */}
        <div className={styles.modalBody}>
          <div className={styles.modalCategory}>{event.category}</div>
          <h2 className={styles.modalTitle}>{event.title}</h2>
          <p className={styles.modalDescription}>{event.description}</p>

          <div className={styles.modalDivider} />

          {/* Event details */}
          <div className={styles.modalDetails}>
            {/* Date */}
            <div className={styles.modalDetailRow}>
              <svg className={styles.modalDetailIcon} viewBox="0 0 16 16" fill="none">
                <rect x="2" y="3" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M2 6h12" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M5.5 1v3M10.5 1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div>
                <div className={styles.modalDetailLabel}>Date</div>
                <div className={styles.modalDetailValue}>{event.dateFull || event.date}</div>
              </div>
            </div>

            {/* Time */}
            <div className={styles.modalDetailRow}>
              <svg className={styles.modalDetailIcon} viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <div className={styles.modalDetailLabel}>Time</div>
                <div className={styles.modalDetailValue}>{event.time}</div>
              </div>
            </div>

            {/* Location */}
            <div className={styles.modalDetailRow}>
              <svg className={styles.modalDetailIcon} viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1C5.24 1 3 3.24 3 6c0 4.13 5 9 5 9s5-4.87 5-9c0-2.76-2.24-5-5-5zm0 6.5c-.83 0-1.5-.67-1.5-1.5S7.17 4.5 8 4.5s1.5.67 1.5 1.5S8.83 7.5 8 7.5z"/>
              </svg>
              <div>
                <div className={styles.modalDetailLabel}>Location</div>
                <div className={styles.modalDetailValue}>
                  {event.venue && event.venue.toLowerCase() !== event.location.toLowerCase()
                    ? `${event.venue}, ${event.location}`
                    : event.location}
                </div>
              </div>
            </div>

            {/* Duration */}
            {event.duration && (
              <div className={styles.modalDetailRow}>
                <svg className={styles.modalDetailIcon} viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v12M4 4l4 4-4 4M12 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <div className={styles.modalDetailLabel}>Duration</div>
                  <div className={styles.modalDetailValue}>{event.duration}</div>
                </div>
              </div>
            )}

            {/* Age Limit */}
            {event.ageLimit && event.ageLimit !== 'All ages allowed' && (
              <div className={styles.modalDetailRow}>
                <svg className={styles.modalDetailIcon} viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 8c1.66 0 3-1.34 3-3S9.66 2 8 2 5 3.34 5 5s1.34 3 3 3zm0 1.5c-2 0-6 1-6 3V14h12v-1.5c0-2-4-3-6-3z"/>
                </svg>
                <div>
                  <div className={styles.modalDetailLabel}>Age Limit</div>
                  <div className={styles.modalDetailValue}>{event.ageLimit}</div>
                </div>
              </div>
            )}
          </div>

          {/* Entry fee */}
          <div className={styles.modalFee}>
            {event.entryFee === 'Free' || !event.entryFee ? '🎫 Free Entry' : `🎫 ${event.entryFee}`}
          </div>

          {/* About section */}
          {event.about && (
            <>
              <div className={styles.modalDivider} />
              <div className={styles.modalAboutLabel}>About this event</div>
              <p className={styles.modalAbout}>{event.about}</p>
            </>
          )}

          <div className={styles.modalDivider} />

          {/* Link to full event page */}
          <Link href={`/events/${event.slug}`} className={styles.modalViewLink}>
            View Full Event →
          </Link>
        </div>
      </div>
    </div>
  );
}
