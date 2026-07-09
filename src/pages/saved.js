import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import VerticalEventCard from '../components/VerticalEventCard/VerticalEventCard';
import styles from '../styles/Saved.module.css';

export default function SavedEvents() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/saved');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch('/api/events/saved')
        .then(res => res.json())
        .then(data => {
          setEvents(data.events || []);
          setFetching(false);
        });
    }
  }, [user]);

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>Saved Events — AskHimalaya</title>
      </Head>

      <main className={styles.page}>
        <Navbar activePage="SAVED" />
        
        <div className={styles.container}>
          <h1 className={styles.title}>Saved Events</h1>

          {fetching ? (
            <div className={styles.loading}>Loading saved events...</div>
          ) : events.length === 0 ? (
            <div className={styles.empty}>
              You haven&apos;t saved any events yet.
            </div>
          ) : (
            <div className={styles.grid}>
              {events.map(event => (
                <div key={event.id}>
                  <VerticalEventCard event={event} compactGrid />
                </div>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </main>
    </>
  );
}
