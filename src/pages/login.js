import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Auth.module.css';

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

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mascotIndex, setMascotIndex] = useState(0);
  const router = useRouter();
  const { login, signup } = useAuth();

  const redirect = router.query.redirect || '/profile';

  // Cycle mascots every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMascotIndex(prev => (prev + 1) % MASCOTS.length);
    }, 1700);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let res;
    if (isLogin) {
      res = await login(formData.phone || formData.email, formData.password);
    } else {
      if (!formData.name || !formData.phone || !formData.password) {
        setError('Name, phone, and password are required.');
        setLoading(false);
        return;
      }
      res = await signup(formData.name, formData.phone, formData.email, formData.password);
    }

    if (res.success) {
      router.push(redirect);
    } else {
      setError(res.error || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{`${isLogin ? 'Log In' : 'Sign Up'} — AskHimalaya`}</title>
      </Head>

      <main className={styles.page}>
        <div className={styles.splitContainer}>
          {/* Left Side - Welcome Panel */}
          <div className={styles.welcomePanel}>
            <div className={styles.welcomeOverlay}>
              <div className={styles.welcomeContent}>
                <Image src="/images/eventlogo.png" alt="AskHimalaya" width={160} height={75} style={{ marginBottom: '24px' }} />
                <h1 className={styles.welcomeTitle}>
                  {isLogin ? 'WELCOME\nBACK' : 'JOIN\nTHE TRIBE'}
                </h1>
                <p className={styles.welcomeSubtitle}>
                  {isLogin
                    ? 'Discover, host, and experience unforgettable events in the Himalayas.'
                    : 'Create an account to start hosting and exploring amazing events.'}
                </p>
              </div>

              {/* Mascot cycling */}
              <div className={styles.mascotContainer}>
                {MASCOTS.map((src, i) => (
                  <div
                    key={i}
                    className={`${styles.mascot} ${i === mascotIndex ? styles.mascotActive : ''}`}
                  >
                    <Image src={src} alt="AskHimalaya Mascot" width={180} height={180} />
                  </div>
                ))}
              </div>

              {/* Decorative circles */}
              <div className={styles.circle1} />
              <div className={styles.circle2} />
              <div className={styles.circle3} />
            </div>
          </div>

          {/* Right Side - Form */}
          <div className={styles.formPanel}>
            <div className={styles.formContainer}>
              <Link href="/" className={styles.backLink}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Home
              </Link>
              <h2 className={styles.formTitle}>{isLogin ? 'Sign in' : 'Create account'}</h2>
              <p className={styles.formSubtitle}>
                {isLogin
                  ? 'Enter your credentials to access your account.'
                  : 'Fill in your details to get started.'}
              </p>

              {error && <div className={styles.error}>{error}</div>}

              <form className={styles.form} onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Full Name</label>
                    <div className={styles.inputWrapper}>
                      <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="Sonam Wangchuk"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label className={styles.label}>{isLogin ? 'Phone or Email' : 'Phone Number'}</label>
                  <div className={styles.inputWrapper}>
                    <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder={isLogin ? 'Phone or email' : '+91 9876543210'}
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Email Address (Optional)</label>
                    <div className={styles.inputWrapper}>
                      <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Password</label>
                  <div className={styles.inputWrapper}>
                    <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className={styles.showBtn}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </div>

                <button type="submit" className={styles.button} disabled={loading}>
                  {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
                </button>
              </form>

              <p className={styles.toggleText}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  className={styles.toggleLink}
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
