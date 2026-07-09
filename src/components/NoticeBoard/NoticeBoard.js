import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import Poster from './Poster';
import PosterModal from './PosterModal';
import styles from './NoticeBoard.module.css';

function parseEventDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  const parts = dateStr.match(/(\d+)\s+(\w+)\s+(\d{4})/);
  if (parts) return new Date(`${parts[2]} ${parts[1]}, ${parts[3]}`);
  return null;
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function seededRandom(seed) {
  return function (min = 0, max = 1) {
    seed = (seed * 16807 + 12345) % 2147483647;
    return min + (seed / 2147483647) * (max - min);
  };
}

// Calculate scattered absolute positions across the full board
function calculatePositions(events, containerWidth, cols) {
  if (events.length === 0) return [];

  const colWidth = containerWidth / cols;
  const positions = [];

  events.forEach((event, index) => {
    const h = hashCode(event.id || event.slug || event.title);
    const rng = seededRandom(h + index * 7919);

    const col = index % cols;
    const row = Math.floor(index / cols);

    const baseLeft = col * colWidth + rng(-10, 20);
    const jitterX = rng(-25, 40);
    const left = Math.max(-20, Math.min(baseLeft + jitterX, containerWidth - 120));

    const baseTop = row * 260;
    const jitterY = rng(-35, 55);
    const top = Math.max(-15, baseTop + jitterY);

    positions.push({
      event,
      posStyle: {
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
      },
    });
  });

  return positions;
}

export default function NoticeBoard({ events, newEventSlug }) {
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showPinAnimation, setShowPinAnimation] = useState(false);
  const [animatingEvent, setAnimatingEvent] = useState(null);

  // Tag each event with isPast
  const allEvents = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return events.map(event => {
      const eventDate = parseEventDate(event.date);
      return { ...event, isPast: eventDate && eventDate < now };
    });
  }, [events]);

  // Position calculations — all events on one board
  const cols = allEvents.length <= 2 ? 2 : allEvents.length <= 4 ? 3 : 4;
  const positions = useMemo(
    () => calculatePositions(allEvents, 1100, cols),
    [allEvents, cols]
  );

  const rows = Math.ceil(allEvents.length / cols);
  const boardHeight = Math.max(450, rows * 300 + 100);

  // Trigger pinning animation for new event
  useEffect(() => {
    if (newEventSlug) {
      const newEvent = events.find(e => e.slug === newEventSlug);
      if (newEvent) {
        setAnimatingEvent(newEvent);
        setShowPinAnimation(true);
        const timer = setTimeout(() => {
          setShowPinAnimation(false);
          setAnimatingEvent(null);
          router.replace('/noticeboard', undefined, { shallow: true });
        }, 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [newEventSlug, events, router]);

  const handlePinAPoster = useCallback(() => {
    router.push('/create-event?from=noticeboard');
  }, [router]);

  const attachmentType = animatingEvent
    ? (hashCode(animatingEvent.id || animatingEvent.slug || animatingEvent.title) % 2 === 0 ? 'pin' : 'tape')
    : 'pin';

  return (
    <>
      <div className={styles.boardWrapper}>
        <div className={styles.board}>
          {/* Board Title */}
          <h1 className={styles.boardTitle}>📋 NOTICE BOARD</h1>
          <p className={styles.boardSubtitle}>pin it up, spread the word ✦</p>

          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>📌 EVENTS</h2>
            <button className={styles.pinButton} onClick={handlePinAPoster}>
              Pin a Poster
            </button>
          </div>

          {allEvents.length > 0 ? (
            <div
              className={styles.posterGrid}
              style={{ height: boardHeight }}
            >
              {positions.map(({ event, posStyle }) => (
                <Poster
                  key={event.id}
                  event={event}
                  isPast={event.isPast}
                  onClick={setSelectedEvent}
                  posStyle={posStyle}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyBoard}>
              <span>📌</span>
              The board is empty...<br />
              Be the first to pin a poster!
            </div>
          )}
        </div>
      </div>

      {/* Poster Modal */}
      {selectedEvent && (
        <PosterModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* Pinning Animation Overlay */}
      {showPinAnimation && animatingEvent && (
        <div className={styles.pinningAnimationOverlay} onClick={() => setShowPinAnimation(false)}>
          <div className={styles.pinningPoster}>
            {attachmentType === 'pin' ? (
              <svg
                className={`${styles.pinDecoration} ${styles.pinDropAnimation}`}
                viewBox="0 0 24 24"
                fill="none"
                style={{ position: 'absolute', top: -8, left: '50%', zIndex: 5, width: 28, height: 28 }}
              >
                <circle cx="12" cy="8" r="6" fill="#cc3333" stroke="#991111" strokeWidth="1" />
                <circle cx="12" cy="8" r="2.5" fill="#ff5555" />
                <line x1="12" y1="14" x2="12" y2="22" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <div
                className={`${styles.tapeDecoration} ${styles.tapeSlideAnimation}`}
                style={{ position: 'absolute', top: -6, left: '50%', zIndex: 5 }}
              />
            )}
            <div className={styles.paperRustle}>
              <div
                className={styles.posterInner}
                style={{
                  width: 240,
                  background: '#fff',
                  boxShadow: '4px 6px 24px rgba(0,0,0,0.25)',
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: 170 }}>
                  <img
                    src={animatingEvent.image}
                    alt={animatingEvent.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <div className={styles.posterContent}>
                  <div className={styles.posterCategory}>{animatingEvent.category}</div>
                  <h3 className={styles.posterTitle}>{animatingEvent.title}</h3>
                  <div className={styles.posterMeta}>
                    <div className={styles.posterMetaItem}>📅 {animatingEvent.date}</div>
                    <div className={styles.posterMetaItem}>📍 {animatingEvent.location}</div>
                  </div>
                  <div className={styles.posterFee}>{animatingEvent.entryFee || 'Free'}</div>
                </div>
              </div>
            </div>
            <div className={styles.pinningMessage}>
              ✨ Your poster is now on the board!
            </div>
          </div>
        </div>
      )}
    </>
  );
}
