import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import styles from './Navbar.module.css';

export default function Navbar({ activePage }) {
  const router = useRouter();
  const { user } = useAuth();
  const { location, changeLocation } = useLocation();
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const getDefault = () => {
    if (activePage) return activePage;
    if (router.pathname === '/profile') return 'PROFILE';
    if (router.pathname === '/saved') return 'SAVED';
    if (router.pathname === '/noticeboard') return 'NOTICEBOARD';
    if (router.pathname.startsWith('/events')) return 'EVENTS';
    if (router.pathname === '/create-event') return 'CREATE EVENTS';
    return 'HOME';
  };
  const activeTab = getDefault();

  const handleNavClick = (tabName, href, e) => {
    e.preventDefault();
    if (tabName === 'HOME') {
      if (router.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        router.push('/');
      }
    } else if (tabName === 'NOTICEBOARD') {
      router.push('/noticeboard');
    } else if (tabName === 'EVENTS') {
      router.push('/events');
    } else if (tabName === 'SAVED') {
      if (user) {
        router.push('/saved');
      } else {
        router.push('/login?redirect=/saved');
      }
    } else if (tabName === 'CREATE EVENTS') {
      if (user) {
        router.push('/create-event');
      } else {
        router.push('/login?redirect=/create-event');
      }
    }
  };

  const handleProfileClick = () => {
    if (user) {
      router.push('/profile');
    } else {
      router.push('/login');
    }
  };

  return (
    <nav className={styles.navbar} id="navbar">
      <Link href="/" className={styles.logoContainer}>
        <Image
          src="/images/eventlogo.png"
          alt="AskHimalaya"
          width={117}
          height={55}
          className={styles.logo}
          priority
        />
      </Link>

      <div className={styles.separator} />

      <div 
        className={styles.locationGroup}
        onClick={() => setShowLocationDropdown(!showLocationDropdown)}
        style={{ cursor: 'pointer', position: 'relative' }}
      >
        <svg className={styles.locationIcon} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 2C7.13 2 4 5.13 4 9c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="11" cy="9" r="2" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
        <span className={styles.locationText}>{location}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px', color: '#fff', transition: 'transform 0.2s', transform: showLocationDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>

        {showLocationDropdown && (
          <div className={styles.locationDropdown}>
            {['Darjeeling', 'Kalimpong', 'Gangtok'].map(loc => (
              <div 
                key={loc} 
                className={styles.locationOption}
                onClick={(e) => {
                  e.stopPropagation();
                  changeLocation(loc);
                  setShowLocationDropdown(false);
                }}
              >
                {loc}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.navLinks}>
        <Link 
          href="/" 
          className={`${styles.navLink} ${activeTab === 'HOME' ? styles.navLinkActive : ''}`}
          onClick={(e) => handleNavClick('HOME', '/', e)}
        >
          HOME
        </Link>
        <Link 
          href="/noticeboard" 
          className={`${styles.navLink} ${activeTab === 'NOTICEBOARD' ? styles.navLinkActive : ''}`}
          onClick={(e) => handleNavClick('NOTICEBOARD', '/noticeboard', e)}
        >
          NOTICEBOARD
        </Link>
        <Link 
          href="/events" 
          className={`${styles.navLink} ${activeTab === 'EVENTS' ? styles.navLinkActive : ''}`}
          onClick={(e) => handleNavClick('EVENTS', '/events', e)}
        >
          EVENTS
        </Link>
        <Link 
          href="/saved" 
          className={`${styles.navLink} ${activeTab === 'SAVED' ? styles.navLinkActive : ''}`}
          onClick={(e) => handleNavClick('SAVED', '/saved', e)}
        >
          SAVED
        </Link>
        <Link 
          href="/create-event" 
          className={`${styles.navLink} ${activeTab === 'CREATE EVENTS' ? styles.navLinkActive : ''}`}
          onClick={(e) => handleNavClick('CREATE EVENTS', '/create-event', e)}
        >
          CREATE EVENTS
        </Link>
      </div>

      <div 
        className={`${styles.profileButton} ${activeTab === 'PROFILE' ? styles.profileButtonActive : ''}`} 
        onClick={handleProfileClick} 
        style={{ cursor: 'pointer' }}
      >
        {user ? (
          <span className={styles.profileInitial}>{user.name.charAt(0).toUpperCase()}</span>
        ) : (
          <svg className={styles.profileIcon} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        )}
      </div>
    </nav>
  );
}
