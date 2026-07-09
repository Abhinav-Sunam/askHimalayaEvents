import Head from 'next/head';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import EventsCarousel from '../../components/EventsCarousel/EventsCarousel';
import EventsListing from '../../components/EventsListing/EventsListing';
import getDb, { rowToEvent } from '../../lib/db';

export default function EventsPage({ events }) {
  return (
    <>
      <Head>
        <title>Events — AskHimalaya</title>
        <meta name="description" content="Browse all upcoming events, workshops, parties, and networking sessions happening around Darjeeling." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ background: '#000000', minHeight: '100vh' }}>
        <Navbar activePage="EVENTS" />
        <EventsCarousel events={events} />
        <EventsListing events={events} />
        <Footer />
      </main>
    </>
  );
}

export async function getServerSideProps() {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM events ORDER BY created_at DESC').all();
  const events = rows.map(rowToEvent);
  return { props: { events } };
}
