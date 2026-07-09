'use client';
import { useState, useEffect, useCallback } from 'react';
import styles from './EventsCarousel.module.css';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function EventsCarousel({ events }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const router = useRouter();

  const goTo = useCallback((index) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 350);
  }, [animating]);

  const prev = () => goTo((current - 1 + events.length) % events.length);
  const next = () => goTo((current + 1) % events.length);

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % events.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [current, events.length, goTo]);

  const event = events[current];

  return (
    <div className={styles.carouselWrapper} id="events-carousel">
      <div
        className={`${styles.slide} ${animating ? styles.slideOut : styles.slideIn}`}
        style={{ background: event.carouselBg }}
      >
        {/* Left arrow */}
        <button className={styles.arrowLeft} onClick={prev} aria-label="Previous event">
          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 15L8 10L13 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Text content */}
        <div className={styles.textContent}>
          <p className={styles.dateLabel}>{event.carouselDate}</p>
          <h1 className={styles.eventTitle}>{event.title}</h1>
          <p className={styles.venue}>{event.carouselVenue}</p>
          <p className={styles.entryFee}>Entry fee : {event.entryFee}</p>
          <button
            className={styles.ctaButton}
            onClick={() => router.push(`/events/${event.slug}`)}
          >
            {event.cta}
          </button>
        </div>

        {/* Right image */}
        <div className={styles.imageContainer}>
          <Image
            src={event.image}
            alt={event.title}
            fill
            className={styles.eventImage}
            priority
          />
        </div>

        {/* Right arrow */}
        <button className={styles.arrowRight} onClick={next} aria-label="Next event">
          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 5L12 10L7 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Dot indicators */}
        <div className={styles.dots}>
          {events.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
