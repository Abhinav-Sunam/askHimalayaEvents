import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar/Navbar';
import Hero from '../components/Hero/Hero';
import SearchBar from '../components/SearchBar/SearchBar';
import UpcomingHighlights from '../components/UpcomingHighlights/UpcomingHighlights';
import AllEvents from '../components/AllEvents/AllEvents';
import Footer from '../components/Footer/Footer';
import getDb, { rowToEvent } from '../lib/db';
import { useLocation } from '../context/LocationContext';
import styles from '../styles/Home.module.css';

export default function Home({ events }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { location } = useLocation();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const targetCity = (location || 'Darjeeling').toLowerCase();
  const locationEvents = events.filter(e => e.location.toLowerCase().includes(targetCity));
  const hasEventsInCity = locationEvents.length > 0;
  
  const displayEvents = hasEventsInCity ? locationEvents : events;

  return (
    <>
      <Head>
        <title>AskHimalaya Events — Find Events That Inspire You</title>
        <meta name="description" content="Discover workshops, parties, networking events and more happening around Darjeeling. Explore and connect with your community through AskHimalaya Events." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.homeMain}>
        <Navbar />
        <div className={styles.mobileSearch}>
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>
        <Hero />
        
        {mounted && !hasEventsInCity && (
          <div style={{ textAlign: 'center', padding: '60px 20px 20px', color: '#A3A3A3', fontFamily: 'Inter', fontSize: '18px' }}>
            No events in your city right now. Check out events from other cities below!
          </div>
        )}

        {displayEvents.length > 0 && <UpcomingHighlights events={displayEvents.slice(0, 3)} />}
        <div className={styles.desktopSearch}>
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>
        <AllEvents searchQuery={searchQuery} events={displayEvents} />
        <Footer />
      </main>
    </>
  );
}

export async function getServerSideProps() {
  const db = await getDb();
  const res = await db.query('SELECT * FROM events ORDER BY created_at DESC');
  const events = res.rows.map(rowToEvent);
  return { props: { events } };
}
