import { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import styles from '../styles/Profile.module.css';

const MASCOTS = [
  '/images/Mascot-01.svg',
  '/images/Mascot-02.svg',
  '/images/Mascot-03.svg',
  '/images/Mascot-04.svg',
  '/images/Mascot-05.svg',
  '/images/Mascot-06.svg',
  '/images/Mascot-07.svg',
  '/images/Mascot-08.svg',
  '/images/Mascot-09.svg',
];

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [savedCount, setSavedCount] = useState(0);
  const [hostedCount, setHostedCount] = useState(0);
  const [fetchingStats, setFetchingStats] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      // Fetch saved and hosted counts in parallel
      Promise.all([
        fetch('/api/events/saved').then(res => res.json()).catch(() => ({ events: [] })),
        fetch('/api/events').then(res => res.json()).catch(() => ({ events: [] }))
      ]).then(([savedData, allEventsData]) => {
        setSavedCount((savedData.events || []).length);
        const myEvents = (allEventsData.events || []).filter(e => e.createdBy === user.id);
        setHostedCount(myEvents.length);
        setFetchingStats(false);
      }).catch(() => {
        setFetchingStats(false);
      });
    }
  }, [user]);

  // Pick a mascot based on user name (deterministic)
  const mascotIndex = user ? user.name.charCodeAt(0) % MASCOTS.length : 0;

  if (loading || !user) {
    return (
      <main className={styles.page}>
        <Navbar activePage="PROFILE" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Montserrat, sans-serif' }}>
          Loading profile...
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Profile — AskHimalaya</title>
      </Head>

      <main className={styles.page}>
        <Navbar activePage="PROFILE" />

        <div className={styles.container}>
          {/* Hero banner with mascot */}
          <div className={styles.profileBanner}>
            <div className={styles.bannerContent}>
              <button className={styles.backBtn} onClick={() => router.push('/')} aria-label="Back to Home">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M5 12L12 19M5 12L12 5"/>
                </svg>
              </button>
              <span className={styles.headerTitle}>Profile</span>
            </div>
            <div className={styles.bannerMascot}>
              <Image src={MASCOTS[mascotIndex]} alt="Mascot" width={110} height={110} className={styles.mascotImg} />
            </div>
          </div>

          {/* User Info Card */}
          <div className={styles.userCard}>
            <div className={styles.avatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userDetails}>
              <div className={styles.userNameRow}>
                <h1 className={styles.userName}>{user.name}</h1>
                <span className={styles.userBadge}>Member</span>
              </div>
              <span className={styles.userPhone}>{user.phone}</span>
              {user.email && <span className={styles.userEmail}>{user.email}</span>}
            </div>
          </div>

          {/* Stats Dashboard Grid */}
          <div className={styles.quickActions}>
            <button className={styles.quickAction} onClick={() => router.push('/saved')}>
              <div className={styles.quickActionIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.quickActionInfo}>
                <span className={styles.quickActionLabel}>Saved Events</span>
                <span className={styles.statsBadge}>{fetchingStats ? '...' : savedCount}</span>
              </div>
            </button>
            <button className={styles.quickAction} onClick={() => router.push('/create-event')}>
              <div className={styles.quickActionIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.quickActionInfo}>
                <span className={styles.quickActionLabel}>Hosted Events</span>
                <span className={styles.statsBadge}>{fetchingStats ? '...' : hostedCount}</span>
              </div>
            </button>
          </div>

          {/* Bookings and Actions */}
          <div className={styles.section}>
            <div className={styles.actionButton} onClick={() => router.push('/saved')}>
              <div className={styles.actionLeft}>
                <div className={styles.actionIconWrapper}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>View Saved Events</span>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={styles.chevronIcon} xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <div className={styles.actionButton} onClick={() => router.push('/saved')}>
              <div className={styles.actionLeft}>
                <div className={styles.actionIconWrapper}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span>View all bookings</span>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={styles.chevronIcon} xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Support</h2>
            <div className={styles.actionButton}>
              <div className={styles.actionLeft}>
                <div className={styles.actionIconWrapper}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>Chat with us</span>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={styles.chevronIcon} xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>More</h2>
            <div className={styles.menuGroup}>
              <div className={styles.menuItem}>
                <div className={styles.actionLeft}>
                  <div className={styles.actionIconWrapper}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>Terms & Conditions</span>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={styles.chevronIcon} xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.menuDivider} />
              <div className={styles.menuItem}>
                <div className={styles.actionLeft}>
                  <div className={styles.actionIconWrapper}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>Privacy Policy</span>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={styles.chevronIcon} xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <button className={styles.logoutBtn} onClick={logout}>
            <div className={styles.actionLeft}>
              <div className={styles.logoutIconWrapper}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span>Logout</span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={styles.chevronIcon} xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <Footer />
      </main>
    </>
  );
}
