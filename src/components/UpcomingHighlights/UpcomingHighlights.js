import { useRouter } from 'next/router';
import styles from './UpcomingHighlights.module.css';
import VerticalEventCard from '../VerticalEventCard/VerticalEventCard';

export default function UpcomingHighlights({ events = [] }) {
  const router = useRouter();

  if (!events || events.length === 0) return null;

  return (
    <section className={styles.section} id="upcoming-highlights">
      <h2 className={styles.sectionTitle}>Upcoming Highlights</h2>
      <div className={styles.cardsRow}>
        {events.map((event) => (
          <VerticalEventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
