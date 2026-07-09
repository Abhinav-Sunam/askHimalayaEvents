import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from './VerticalEventCard.module.css';

export default function VerticalEventCard({ event, onEdit, compactGrid = false }) {
  const router = useRouter();

  if (!event) return null;

  return (
    <div 
      className={`${styles.card} ${compactGrid ? styles.compactGrid : ''}`}
      onClick={() => router.push(`/events/${event.slug}`)}
      style={{ cursor: 'pointer' }}
    >
      <Image
        src={event.image}
        alt={event.title}
        fill
        className={styles.cardImage}
      />

      {/* Date badge */}
      <div className={styles.dateBadge} style={{ background: event.badgeColor || '#6CFCFE' }}>
        <span className={styles.dateDay}>{event.date.split(' ')[0]}</span>
        <span className={styles.dateMonth}>{event.date.split(' ')[1]?.toUpperCase()}</span>
      </div>
      
      {/* Location label */}
      <div className={styles.cardLocation}>
        <svg className={styles.locationPin} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 2C7.13 2 4 5.13 4 9c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="11" cy="9" r="2" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
        <span>
          {event.venue && event.venue.toLowerCase() !== event.location.toLowerCase() 
            ? `${event.venue}, ${event.location}` 
            : event.location}
        </span>
      </div>

      {/* Sleek integrated Edit button for hosted cards */}
      {onEdit && (
        <button
          className={styles.editButton}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          aria-label="Edit Event"
        >
          <svg className={styles.editIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      )}

      {/* Bottom overlay */}
      <div className={styles.cardOverlay}>
        <div className={styles.cardTextContent}>
          <h3 className={styles.cardTitle}>{event.title}</h3>
          <p className={styles.cardDescription}>{event.description}</p>
        </div>

        <div className={styles.arrowButton}>
          <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
