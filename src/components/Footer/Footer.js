import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer} id="footer">
      <Image
        src="/images/footer-low-opacity.png"
        alt="Footer background"
        fill
        className={styles.footerBg}
      />

      <div className={styles.footerOverlay} />

      <div className={styles.footerContent}>
        <div className={styles.footerMain}>
          {/* Logo */}
          <Image
            src="/images/AskBlack.png"
            alt="AskHimalaya"
            width={273}
            height={127}
            className={styles.footerLogo}
          />

          {/* Company section */}
          <div className={styles.companySection}>
            <h4 className={styles.columnTitle}>Company</h4>
            <a href="#" className={styles.columnLink}>Terms & Conditions</a>
            <a href="#" className={styles.columnLink}>Privacy Policy</a>
          </div>

          {/* Get in touch section */}
          <div className={styles.contactSection}>
            <h4 className={styles.columnTitle}>Get In Touch</h4>

            <div className={styles.contactGroup}>
              <p className={styles.contactLabel}>EMAIL</p>
              <p className={styles.contactValue}>admin@askhimalaya.com</p>
            </div>

            <div className={styles.contactGroup}>
              <p className={styles.contactLabel}>INSTAGRAM</p>
              <p className={styles.contactValue}>@ask.himalaya</p>
            </div>
          </div>
        </div>

        {/* Footer bottom bar */}
        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            <svg className={styles.copyrightIcon} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="0.75" />
              <text x="6" y="8.5" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="sans-serif">©</text>
            </svg>
            <span>2026 AskHimalaya. All rights reserved</span>
          </div>

          <div className={styles.taglines}>
            <span className={styles.tagline}>Made in the Himalayas</span>
            <div className={styles.dot} />
            <span className={styles.tagline}>Powered by Locals</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
