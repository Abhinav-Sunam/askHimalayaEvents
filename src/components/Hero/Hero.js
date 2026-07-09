import Image from 'next/image';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.heroWrapper} id="hero">
      <div className={styles.hero}>
        <Image
          src="/images/find-events-that-inspire-you.jpg"
          alt="Find Events That Inspire You"
          fill
          className={styles.heroImage}
          priority
        />
        <div className={styles.overlay} />
        <div className={styles.content}>
          <h1 className={styles.heading}>
            Find Events That<br />Inspire You
          </h1>
          <p className={styles.subtext}>
            Workshops, parties, networking and more.<br />
            Explore events happening around you.
          </p>
        </div>
      </div>
    </section>
  );
}
