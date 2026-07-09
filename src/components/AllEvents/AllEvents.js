import EventCard from '../EventCard/EventCard';
import styles from './AllEvents.module.css';

export default function AllEvents({ searchQuery = '', events = [] }) {
  const filteredEvents = events.filter((event) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(query) ||
      event.category.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query)
    );
  });

  return (
    <section className={styles.section} id="all-events">
      <div className={styles.titleRow}>
        <h2 className={styles.sectionTitle}>All Events</h2>
        <div className={styles.underline} />
      </div>

      <div className={styles.eventsList}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <p style={{ color: '#737373', fontSize: '18px', textAlign: 'center', marginTop: '40px', width: '100%' }}>
            No events found matching &quot;{searchQuery}&quot;
          </p>
        )}
      </div>

      <div className={styles.ctaContainer}>
        <button
          className={styles.viewAllBtn}
          onClick={() => window.location.href = '/events'}
        >
          Go to events
        </button>
      </div>
    </section>
  );
}
