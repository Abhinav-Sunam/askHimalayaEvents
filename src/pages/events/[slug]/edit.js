import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';
import Toast from '../../../components/Toast/Toast';
import styles from '../../../styles/EventDetail.module.css';

export default function EditEventPage({ event }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    about: event?.about || '',
    date: event?.date || '',
    time: event?.time || '',
    location: event?.location || '',
    venue: event?.venue || '',
    entryFee: event?.entryFee || '',
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(event?.image || '');

  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(`/login?redirect=/events/${event?.slug}/edit`);
      } else if (user.role !== 'admin' && user.id !== event?.createdBy) {
        router.push(`/events/${event?.slug}`);
      }
    }
  }, [user, loading, event, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });
      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await fetch(`/api/events/${event.slug}`, {
        method: 'PUT',
        body: data
      });
      if (res.ok) {
        setToast({ message: 'Event updated successfully', type: 'success' });
        setEditingField(null);
        setTimeout(() => router.push(`/events/${event.slug}`), 800);
      } else {
        const err = await res.json();
        setToast({ message: err.error || 'Failed to update event', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Something went wrong. Please try again.', type: 'error' });
    }
    setSaving(false);
  };

  const renderEditableText = (name, value, Element = 'span', className = '') => {
    const isEditing = editingField === name;

    if (isEditing) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginBottom: '16px' }}>
          {Element === 'textarea' || name === 'about' || name === 'description' ? (
            <textarea
              name={name}
              value={value}
              onChange={handleChange}
              style={{ width: '100%', padding: '12px', background: '#111', color: '#fff', border: '1px solid #80C439', borderRadius: '8px', minHeight: '120px', fontFamily: 'Inter, sans-serif', fontSize: '15px', resize: 'vertical', outline: 'none' }}
              autoFocus
            />
          ) : (
            <input
              type="text"
              name={name}
              value={value}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', background: '#111', color: '#fff', border: '1px solid #80C439', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '15px', outline: 'none' }}
              autoFocus
            />
          )}
          <button 
            onClick={() => setEditingField(null)}
            style={{ alignSelf: 'flex-start', background: '#80C439', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '13px' }}
          >
            Done Editing
          </button>
        </div>
      );
    }

    const isBlock = Element === 'p' || Element === 'h1' || Element === 'h2' || Element === 'h3';

    return (
      <Element 
        className={className} 
        style={{ 
          position: 'relative', 
          display: isBlock ? 'block' : 'inline-flex', 
          alignItems: isBlock ? 'flex-start' : 'center',
          gap: '8px',
          padding: '8px 12px', 
          margin: '-8px -12px', 
          borderRadius: '8px', 
          cursor: 'pointer',
          border: '1px solid transparent',
          transition: 'all 0.2s ease',
          verticalAlign: 'middle',
          width: isBlock ? 'calc(100% + 24px)' : 'auto'
        }}
        onMouseEnter={e => { 
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; 
          e.currentTarget.style.border = '1px dashed #666'; 
          const icon = e.currentTarget.querySelector('.edit-icon');
          if (icon) icon.style.opacity = '1';
        }}
        onMouseLeave={e => { 
          e.currentTarget.style.background = 'transparent'; 
          e.currentTarget.style.border = '1px solid transparent'; 
          const icon = e.currentTarget.querySelector('.edit-icon');
          if (icon) icon.style.opacity = '0';
        }}
        onClick={() => setEditingField(name)}
      >
        {value || <span style={{ color: '#888', fontStyle: 'italic', fontSize: '14px' }}>Add {name}...</span>}
        <span 
          className="edit-icon"
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            color: '#000',
            opacity: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#80C439',
            borderRadius: '50%',
            padding: '6px',
            transition: 'opacity 0.2s ease',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            zIndex: 10
          }}
          title={`Edit ${name}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </span>
      </Element>
    );
  };

  if (!event || loading || !user) {
    return (
      <main style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#fff', fontFamily: 'Montserrat', fontSize: 24 }}>Loading...</p>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>{`Edit ${event.title} — AskHimalaya Events`}</title>
      </Head>

      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#111', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
        <div style={{ color: '#fff', fontFamily: 'Montserrat', fontWeight: 600 }}>WYSIWYG Editor</div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            onClick={() => router.push(`/create-event`)}
            style={{ background: 'transparent', color: '#fff', border: '1px solid #444', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            style={{ background: '#80C439', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 600 }}
          >
            {saving ? 'Saving...' : 'Publish Changes'}
          </button>
        </div>
      </div>

      <main className={styles.page}>
        <Navbar activePage="EVENTS" />

        <div className={styles.heroSection}>
          <div className={styles.heroLeft}>
            {renderEditableText('title', formData.title, 'h1', styles.heroTitle)}
            
            <p className={styles.heroMeta}>
              {renderEditableText('date', formData.date, 'span')}
              <span>, </span>
              {renderEditableText('time', formData.time, 'span')}
              <span className={styles.metaDivider}></span>
              {renderEditableText('venue', formData.venue, 'span')}
            </p>

            <label className={styles.heroImageContainer} style={{ position: 'relative', cursor: 'pointer', display: 'block' }}>
              <Image
                src={previewUrl}
                alt={event.title}
                fill
                className={styles.heroImage}
                priority
              />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                style={{ display: 'none' }} 
              />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                <span style={{ color: '#fff', background: 'rgba(0,0,0,0.8)', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', fontFamily: 'Inter', fontWeight: 500 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  Upload New Image
                </span>
              </div>
            </label>
          </div>

          <div className={styles.heroRight}>
            <h2 className={styles.aboutTitle}>Description (Short)</h2>
            {renderEditableText('description', formData.description, 'p', styles.aboutText)}
            
            <h2 className={styles.aboutTitle} style={{ marginTop: '24px' }}>About</h2>
            {renderEditableText('about', formData.about, 'p', styles.aboutText)}
          </div>
        </div>

        <div className={styles.detailsSection}>
          <div className={styles.detailsLeft}>
            <h3 className={styles.detailsTitle}>Event Details</h3>
            <div className={styles.detailsGrid}>
              <div className={styles.detailRow}>
                <span className={styles.detailIcon}>{getDetailIcon('location')}</span>
                <span className={styles.detailLabel}>Location</span>
                <span className={styles.detailValue}>{renderEditableText('location', formData.location, 'span')}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailIcon}>{getDetailIcon('date')}</span>
                <span className={styles.detailLabel}>Entry Fee</span>
                <span className={styles.detailValue}>{renderEditableText('entryFee', formData.entryFee, 'span')}</span>
              </div>
            </div>
          </div>

        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

          <div className={styles.thingsToKnow}>
            <h3 className={styles.detailsTitle}>Things to know</h3>
            <ul className={styles.thingsList}>
              {event.thingsToKnow && event.thingsToKnow.map((item, i) => (
                <li key={i} className={styles.thingsItem}>
                  <span className={styles.thingsIcon}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="5.5" stroke="#E6E6E6"/>
                      <path d="M3.5 6L5 7.5L8.5 4.5" stroke="#E6E6E6" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}

function getDetailIcon(type) {
  switch (type) {
    case 'date':
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="#E6E6E6" strokeWidth="1.9"/>
          <path d="M3 9h18M8 2v4M16 2v4" stroke="#E6E6E6" strokeWidth="1.9" strokeLinecap="round"/>
        </svg>
      );
    case 'location':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#E6E6E6"/>
          <circle cx="12" cy="9" r="2.5" fill="#000"/>
        </svg>
      );
    default:
      return null;
  }
}

export async function getServerSideProps(context) {
  const dbModule = await import('../../../lib/db');
  const getDb = dbModule.default;
  const rowToEvent = dbModule.rowToEvent;

  const db = getDb();
  const row = db.prepare('SELECT * FROM events WHERE slug = ?').get(context.params.slug);
  if (!row) {
    return { notFound: true };
  }
  const event = rowToEvent(row);
  return { props: { event } };
}
