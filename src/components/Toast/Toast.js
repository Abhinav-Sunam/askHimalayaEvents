import { useState, useEffect, useCallback } from 'react';
import styles from './Toast.module.css';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  const [exiting, setExiting] = useState(false);

  const handleClose = useCallback(() => {
    setExiting(true);
    setTimeout(onClose, 250);
  }, [onClose]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(handleClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, handleClose]);

  if (!message) return null;

  return (
    <div className={`${styles.toast} ${styles[type]} ${exiting ? styles.exit : ''}`}>
      <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {type === 'success' ? (
          <>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </>
        )}
      </svg>
      <span className={styles.message}>{message}</span>
      <button className={styles.closeBtn} onClick={handleClose}>✕</button>
    </div>
  );
}
