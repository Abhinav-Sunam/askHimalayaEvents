import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from './EventCard.module.css';

export default function EventCard({ event }) {
  const router = useRouter();

  return (
    <div 
      className={styles.card}
      onClick={() => router.push(`/events/${event.slug}`)}
      style={{ cursor: 'pointer' }}
    >
      {/* Left image */}
      <div className={styles.imageContainer}>
        <Image
          src={event.image}
          alt={event.title}
          fill
          className={styles.eventImage}
        />
      </div>

      {/* Right text info */}
      <div className={styles.textInfo}>
        <div className={styles.textContent}>
          {/* Category badge */}
          <span
            className={styles.badge}
            style={{
              background: event.badgeColor,
              color: event.badgeTextColor || '#434544',
            }}
          >
            {event.category}
          </span>

          {/* Title */}
          <h3 className={styles.title}>{event.title}</h3>

          {/* Description */}
          <p className={styles.description}>{event.description}</p>

          {/* Meta row */}
          <div className={styles.metaRow}>
            {/* Date */}
            <div className={styles.metaItem}>
              <svg className={styles.metaIcon} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="3" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M2 6h12" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M5.5 1v3M10.5 1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className={styles.metaText}>{event.date}</span>
            </div>

            <div className={styles.metaSpacer} />

            {/* Time */}
            <div className={styles.metaItem}>
              <svg className={styles.metaIcon} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className={styles.metaText}>{event.time}</span>
            </div>

            <div className={styles.metaSpacer} />

            {/* Location */}
            <div className={styles.metaItem}>
              <svg className={styles.metaIcon} viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 1C5.24 1 3 3.24 3 6c0 4.13 5 9 5 9s5-4.87 5-9c0-2.76-2.24-5-5-5zm0 6.5c-.83 0-1.5-.67-1.5-1.5S7.17 4.5 8 4.5s1.5.67 1.5 1.5S8.83 7.5 8 7.5z"/>
              </svg>
              <span className={styles.metaText}>
                {event.venue && event.venue.toLowerCase() !== event.location.toLowerCase() 
                  ? `${event.venue}, ${event.location}` 
                  : event.location}
              </span>
            </div>
          </div>

          {/* CTA */}
          <button 
            className={styles.ctaButton}
            onClick={(e) => { e.stopPropagation(); router.push(`/events/${event.slug}`); }}
          >
            {event.cta}
          </button>
        </div>
      </div>
    </div>
  );
}
