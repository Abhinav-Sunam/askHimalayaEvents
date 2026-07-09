import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar/Navbar';
import NoticeBoard from '../components/NoticeBoard/NoticeBoard';
import getDb, { rowToEvent } from '../lib/db';
import styles from '../components/NoticeBoard/NoticeBoard.module.css';

export default function NoticeBoardPage({ events }) {
  const router = useRouter();
  const { newEvent } = router.query;

  return (
    <>
      <Head>
        <title>Noticeboard — AskHimalaya Events</title>
        <meta name="description" content="Check out the noticeboard! See what events are pinned up, explore upcoming happenings, and pin your own poster." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.boardPage}>
        <Navbar activePage="NOTICEBOARD" />
        <NoticeBoard events={events} newEventSlug={newEvent || null} />
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
