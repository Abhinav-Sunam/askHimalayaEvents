import { useMemo } from 'react';
import Image from 'next/image';
import styles from './NoticeBoard.module.css';

// Generate random torn paper clip-path for each poster
function generateTornEdge(seed) {
  const random = (min, max) => {
    seed = (seed * 9301 + 49297) % 233280;
    return min + (seed / 233280) * (max - min);
  };

  const topPoints = [];
  const rightPoints = [];
  const bottomPoints = [];
  const leftPoints = [];

  for (let i = 0; i <= 100; i += random(8, 16)) {
    topPoints.push(`${Math.min(i, 100)}% ${random(0, 2)}%`);
  }
  for (let i = 0; i <= 100; i += random(8, 16)) {
    rightPoints.push(`${random(98, 100)}% ${Math.min(i, 100)}%`);
  }
  for (let i = 100; i >= 0; i -= random(8, 16)) {
    bottomPoints.push(`${Math.max(i, 0)}% ${random(98, 100)}%`);
  }
  for (let i = 100; i >= 0; i -= random(8, 16)) {
    leftPoints.push(`${random(0, 2)}% ${Math.max(i, 0)}%`);
  }

  const allPoints = [...topPoints, ...rightPoints, ...bottomPoints, ...leftPoints];
  return `polygon(${allPoints.join(', ')})`;
}

// Deterministic random from string
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Seeded random number generator
function seededRandom(seed) {
  return function (min = 0, max = 1) {
    seed = (seed * 16807 + 12345) % 2147483647;
    return min + (seed / 2147483647) * (max - min);
  };
}

export default function Poster({ event, isPast, onClick, posStyle }) {
  const hash = useMemo(() => hashCode(event.id || event.slug || event.title), [event]);
  const rng = useMemo(() => seededRandom(hash), [hash]);

  // Pin colors: variety of real pushpin colors
  const pinColors = [
    { head: '#cc3333', highlight: '#ff6666' },  // Red
    { head: '#2255bb', highlight: '#5588ee' },  // Blue
    { head: '#ddcc22', highlight: '#ffee66' },  // Yellow
    { head: '#22aa44', highlight: '#55dd77' },  // Green
    { head: '#e8e8e8', highlight: '#ffffff' },  // White/Silver
    { head: '#cc6600', highlight: '#ff9933' },  // Orange
  ];
  const pin = pinColors[hash % pinColors.length];

  // 5 attachment styles
  const attachmentStyle = hash % 5;

  // Rotation: -12 to 12 degrees
  const rotation = rng(-12, 12);

  // Dimensions — wider range
  const width = isPast ? rng(160, 210) : rng(200, 280);
  const imageHeight = isPast ? rng(100, 140) : rng(130, 210);

  // z-index for layering
  const zIndex = 2 + (hash % 10);

  // Tape angle
  const tapeAngle = rng(-6, 6);

  // Torn edge
  const clipPath = useMemo(() => generateTornEdge(hash), [hash]);

  // Subtle paper shadow angle variation
  const shadowAngle = rng(-3, 3);
  const shadowBlur = rng(8, 20);

  // Pin SVG
  const renderPin = (extraStyle = {}) => (
    <svg className={styles.pinDecoration} viewBox="0 0 24 30" fill="none" style={extraStyle}>
      {/* Shadow */}
      <ellipse cx="12" cy="28" rx="4" ry="1.5" fill="rgba(0,0,0,0.10)" />
      {/* Needle */}
      <line x1="12" y1="13" x2="12" y2="24" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
      {/* Head */}
      <circle cx="12" cy="8" r="6" fill={pin.head} />
      {/* Highlight */}
      <ellipse cx="10" cy="6" rx="2.5" ry="1.8" fill={pin.highlight} opacity="0.5" />
      {/* Specular */}
      <circle cx="9" cy="5.5" r="1" fill="rgba(255,255,255,0.6)" />
    </svg>
  );

  return (
    <div
      className={`${styles.poster} ${isPast ? styles.posterPast : ''}`}
      style={{
        ...posStyle,
        transform: `rotate(${rotation}deg)`,
        width: `${Math.round(width)}px`,
        zIndex,
      }}
      onClick={() => onClick && onClick(event)}
    >
      {/* Attachments */}
      {attachmentStyle === 0 && renderPin()}
      {attachmentStyle === 1 && (
        <div
          className={styles.tapeDecoration}
          style={{ transform: `translateX(-50%) rotate(${tapeAngle}deg)` }}
        />
      )}
      {attachmentStyle === 2 && (
        <div
          className={styles.tapeDecoration}
          style={{
            left: '10px',
            top: '-6px',
            transform: `rotate(${-35 + tapeAngle}deg)`,
            width: '50px',
          }}
        />
      )}
      {attachmentStyle === 3 && (
        <div
          className={styles.tapeDecoration}
          style={{
            left: 'auto',
            right: '-12px',
            top: '-6px',
            transform: `rotate(${35 + tapeAngle}deg)`,
            width: '50px',
          }}
        />
      )}
      {attachmentStyle === 4 && (
        <>
          {renderPin({ left: '18%', top: '-10px' })}
          {renderPin({ left: '78%', top: '-8px' })}
        </>
      )}

      {/* Card */}
      <div
        className={styles.posterInner}
        style={{
          clipPath,
          boxShadow: `${shadowAngle}px ${Math.abs(shadowAngle) + 2}px ${Math.round(shadowBlur)}px rgba(0,0,0,0.12)`,
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: Math.round(imageHeight) }}>
          <Image
            src={event.image}
            alt={event.title}
            fill
            className={styles.posterImage}
            style={{ objectFit: 'cover' }}
            sizes={`${Math.round(width)}px`}
          />
        </div>

        <div className={styles.posterContent}>
          <div className={styles.posterCategory}>{event.category}</div>
          <h3 className={styles.posterTitle}>{event.title}</h3>
          <div className={styles.posterMeta}>
            <div className={styles.posterMetaItem}>
              <svg className={styles.posterMetaIcon} viewBox="0 0 16 16" fill="none">
                <rect x="2" y="3" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M2 6h12" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              {event.date}
            </div>
            <div className={styles.posterMetaItem}>
              <svg className={styles.posterMetaIcon} viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1C5.24 1 3 3.24 3 6c0 4.13 5 9 5 9s5-4.87 5-9c0-2.76-2.24-5-5-5zm0 6.5c-.83 0-1.5-.67-1.5-1.5S7.17 4.5 8 4.5s1.5.67 1.5 1.5S8.83 7.5 8 7.5z"/>
              </svg>
              {event.venue && event.venue.toLowerCase() !== event.location.toLowerCase()
                ? `${event.venue}, ${event.location}`
                : event.location}
            </div>
          </div>
          <div className={styles.posterFee}>{event.entryFee || 'Free'}</div>
        </div>

        {isPast && <div className={styles.endedStamp}>ENDED</div>}
      </div>
    </div>
  );
}
