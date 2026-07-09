import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar/Navbar';
import VerticalEventCard from '../components/VerticalEventCard/VerticalEventCard';
import styles from '../styles/CreateEvent.module.css';

const CATEGORIES = ['WORKSHOP', 'PARTY', 'NETWORKING', 'CONFERENCE', 'WEBINAR'];
const AGE_LIMITS = ['All ages allowed', '18+ only', '21+ only'];
const MONTHS = [
  { value: '01', label: 'Jan' },
  { value: '02', label: 'Feb' },
  { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' },
  { value: '05', label: 'May' },
  { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' },
  { value: '08', label: 'Aug' },
  { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dec' },
];
const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => String(new Date().getFullYear() + i));

export default function CreateEvent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [view, setView] = useState('dashboard');
  const [hostedEvents, setHostedEvents] = useState([]);
  const [fetchingEvents, setFetchingEvents] = useState(true);
  
  const [step, setStep] = useState(1);
  const totalSteps = 11;
  const inputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    about: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    venue: '',
    ageLimit: '',
    entryFee: '',
    thingsToKnow: '',
    image: null
  });
  const [dateParts, setDateParts] = useState({ day: '', month: '', year: '' });
  const [timeParts, setTimeParts] = useState({
    startHour: '',
    startMinute: '00',
    startPeriod: 'PM',
    endHour: '',
    endMinute: '00',
    endPeriod: 'PM',
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch hosted events from client-side API
  useEffect(() => {
    if (user) {
      fetch('/api/events')
        .then(res => res.json())
        .then(data => {
          const myEvents = (data.events || []).filter(e => e.createdBy === user.id);
          setHostedEvents(myEvents);
          setFetchingEvents(false);
        })
        .catch(() => setFetchingEvents(false));
    }
  }, [user]);

  const calculateDuration = () => {
    if (!formData.startTime || !formData.endTime) return '';
    const [startH, startM] = formData.startTime.split(':').map(Number);
    const [endH, endM] = formData.endTime.split(':').map(Number);
    let diffMins = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffMins < 0) diffMins += 24 * 60;
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    if (h === 0) return `${m} Minutes`;
    if (m === 0) return h === 1 ? '1 Hour' : `${h} Hours`;
    return `${h} Hours ${m} Minutes`;
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/create-event');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [step]);

  const handleNext = () => { if (step < totalSteps) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canProceed()) handleNext();
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getDaysInMonth = (month, year) => {
    const safeMonth = Number(month || '01');
    const safeYear = Number(year || YEAR_OPTIONS[0]);
    return new Date(safeYear, safeMonth, 0).getDate();
  };

  const updateDatePart = (part, value) => {
    const next = { ...dateParts, [part]: value };
    const maxDay = getDaysInMonth(next.month, next.year);

    if (next.day && Number(next.day) > maxDay) {
      next.day = String(maxDay).padStart(2, '0');
    }

    setDateParts(next);
    setFormData(prev => ({
      ...prev,
      date: next.day && next.month && next.year ? `${next.year}-${next.month}-${next.day}` : '',
    }));
  };

  const to24HourTime = (hour, minute, period) => {
    if (!hour || !minute || !period) return '';
    let hour24 = Number(hour);

    if (period === 'AM' && hour24 === 12) hour24 = 0;
    if (period === 'PM' && hour24 !== 12) hour24 += 12;

    return `${String(hour24).padStart(2, '0')}:${minute}`;
  };

  const updateTimePart = (section, part, value) => {
    const key = `${section}${part}`;
    const next = { ...timeParts, [key]: value };
    setTimeParts(next);

    const timeValue = to24HourTime(
      next[`${section}Hour`],
      next[`${section}Minute`],
      next[`${section}Period`]
    );

    setFormData(prev => ({
      ...prev,
      [section === 'start' ? 'startTime' : 'endTime']: timeValue,
    }));
  };

  const formatDateForSummary = () => {
    if (!formData.date) return '';
    const month = MONTHS.find(item => item.value === dateParts.month)?.label;
    return dateParts.day && month && dateParts.year
      ? `${Number(dateParts.day)} ${month} ${dateParts.year}`
      : formData.date;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.title.trim().length > 0;
      case 2: return formData.category !== '';
      case 3: return formData.description.trim().length > 0;
      case 4: return true;
      case 5: return formData.date !== '' && formData.startTime !== '' && formData.endTime !== '';
      case 6: return formData.location.trim().length > 0;
      case 7: return true;
      case 8: return true;
      case 9: return true;
      case 10: return formData.image !== null;
      default: return true;
    }
  };

  const formatTime12Hour = (time24) => {
    const [h, m] = time24.split(':');
    const hh = parseInt(h, 10);
    const suffix = hh >= 12 ? 'PM' : 'AM';
    const h12 = hh % 12 || 12;
    return `${h12}:${m} ${suffix}`;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'startTime' || key === 'endTime' || key === 'thingsToKnow') return;
        if (formData[key]) data.append(key, formData[key]);
      });
      const timeStr = `${formatTime12Hour(formData.startTime)} - ${formatTime12Hour(formData.endTime)}`;
      data.append('time', timeStr);
      data.append('duration', calculateDuration());
      const thingsArr = formData.thingsToKnow.split('\n').filter(s => s.trim().length > 0);
      data.append('thingsToKnow', JSON.stringify(thingsArr));

      const res = await fetch('/api/events', { method: 'POST', body: data });
      const result = await res.json();
      if (res.ok) {
        // If we came from the noticeboard, redirect back with pinning animation
        if (router.query.from === 'noticeboard') {
          router.push(`/noticeboard?newEvent=${result.event.slug}`);
        } else {
          router.push(`/events/${result.event.slug}`);
        }
      } else {
        setError(result.error || 'Failed to create event');
        setSubmitting(false);
      }
    } catch (err) {
      setError('An error occurred while publishing the event');
      setSubmitting(false);
    }
  };

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>Create Event — AskHimalaya</title>
      </Head>

      <main className={styles.page}>
        <Navbar activePage="CREATE EVENTS" />

        {view === 'dashboard' ? (
          <div className={`${styles.container} ${styles.dashboardContainer}`}>
            <div className={styles.dashboardHeader}>
              <h1 className={styles.dashboardTitle}>
                My Hosted Events
              </h1>
              <button 
                onClick={() => setView('form')}
                className={styles.dashboardCreateButton}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Create New Event
              </button>
            </div>

            {fetchingEvents ? (
              <div style={{ color: '#A3A3A3', fontFamily: 'Inter', textAlign: 'center', marginTop: '80px' }}>Loading your events...</div>
            ) : hostedEvents.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '80px', color: '#A3A3A3', fontFamily: 'Inter, sans-serif' }}>
                <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.2 }}>🎭</div>
                <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '16px' }}>No Events Hosted Yet</h2>
                <p style={{ marginBottom: '32px' }}>Ready to host your first event? AskHimalaya makes it easy.</p>
                <button 
                  onClick={() => setView('form')}
                  style={{
                    background: '#80C439', color: '#000', border: 'none',
                    padding: '16px 32px', borderRadius: '30px',
                    fontFamily: 'Montserrat, sans-serif', fontWeight: 600,
                    fontSize: '16px', cursor: 'pointer'
                  }}
                >
                  Create your first event
                </button>
              </div>
            ) : (
              <div className={styles.hostedGrid}>
                {hostedEvents.map(event => (
                  <VerticalEventCard 
                    key={event.id} 
                    event={event} 
                    onEdit={() => router.push(`/events/${event.slug}/edit`)}
                    compactGrid
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.container}>
            <button 
              onClick={() => setView('dashboard')}
              style={{ background: 'none', border: 'none', color: '#A3A3A3', fontFamily: 'Inter', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              ← Back to Dashboard
            </button>
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${(step / totalSteps) * 100}%` }} />
              </div>
              <div className={styles.stepCounter}>Step {step} of {totalSteps}</div>
            </div>

            <div className={styles.slideContainer} key={step}>
              {step === 1 && (
                <>
                  <h1 className={styles.prompt}>What&apos;s your event called?</h1>
                  <input ref={inputRef} type="text" name="title" value={formData.title} onChange={handleChange} onKeyDown={handleKeyDown} className={styles.inputLarge} placeholder="e.g. Summer Rooftop Party" />
                </>
              )}
              {step === 2 && (
                <>
                  <h1 className={styles.prompt}>What kind of event is it?</h1>
                  <div className={styles.optionsGrid}>
                    {CATEGORIES.map(cat => (
                      <div key={cat} className={`${styles.optionCard} ${formData.category === cat ? styles.active : ''}`} onClick={() => setFormData({ ...formData, category: cat })}>
                        {cat.charAt(0) + cat.slice(1).toLowerCase()}
                      </div>
                    ))}
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <h1 className={styles.prompt}>Describe your event in a few lines.</h1>
                  <textarea ref={inputRef} name="description" value={formData.description} onChange={handleChange} className={styles.textareaLarge} placeholder="A short, catchy description that will appear on the event card..." />
                </>
              )}
              {step === 4 && (
                <>
                  <h1 className={styles.prompt}>Tell us more about it. (Optional)</h1>
                  <textarea ref={inputRef} name="about" value={formData.about} onChange={handleChange} className={styles.textareaLarge} placeholder="Dive into the details. What can attendees expect? Who is performing/speaking?" />
                </>
              )}
              {step === 5 && (
                <>
                  <h1 className={styles.prompt}>When is it happening?</h1>
                  <div className={styles.whenGrid}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Date</label>
                      <div className={styles.dateSelectGrid}>
                        <select
                          ref={inputRef}
                          aria-label="Event day"
                          value={dateParts.day}
                          onChange={(e) => updateDatePart('day', e.target.value)}
                          className={styles.select}
                        >
                          <option value="">Day</option>
                          {Array.from({ length: getDaysInMonth(dateParts.month, dateParts.year) }, (_, i) => String(i + 1).padStart(2, '0')).map(day => (
                            <option key={day} value={day}>{Number(day)}</option>
                          ))}
                        </select>
                        <select
                          aria-label="Event month"
                          value={dateParts.month}
                          onChange={(e) => updateDatePart('month', e.target.value)}
                          className={styles.select}
                        >
                          <option value="">Month</option>
                          {MONTHS.map(month => (
                            <option key={month.value} value={month.value}>{month.label}</option>
                          ))}
                        </select>
                        <select
                          aria-label="Event year"
                          value={dateParts.year}
                          onChange={(e) => updateDatePart('year', e.target.value)}
                          className={styles.select}
                        >
                          <option value="">Year</option>
                          {YEAR_OPTIONS.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className={styles.timeRows}>
                      {[
                        { key: 'start', label: 'Start Time' },
                        { key: 'end', label: 'End Time' },
                      ].map(item => (
                        <div className={styles.inputGroup} key={item.key}>
                          <label className={styles.label}>{item.label}</label>
                          <div className={styles.timeSelectGrid}>
                            <select
                              aria-label={`${item.label} hour`}
                              value={timeParts[`${item.key}Hour`]}
                              onChange={(e) => updateTimePart(item.key, 'Hour', e.target.value)}
                              className={styles.select}
                            >
                              <option value="">Hour</option>
                              {HOUR_OPTIONS.map(hour => (
                                <option key={hour} value={hour}>{hour}</option>
                              ))}
                            </select>
                            <select
                              aria-label={`${item.label} minute`}
                              value={timeParts[`${item.key}Minute`]}
                              onChange={(e) => updateTimePart(item.key, 'Minute', e.target.value)}
                              className={styles.select}
                            >
                              {MINUTE_OPTIONS.map(minute => (
                                <option key={minute} value={minute}>{minute}</option>
                              ))}
                            </select>
                            <select
                              aria-label={`${item.label} AM or PM`}
                              value={timeParts[`${item.key}Period`]}
                              onChange={(e) => updateTimePart(item.key, 'Period', e.target.value)}
                              className={styles.select}
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className={styles.durationText}>
                        {formData.startTime && formData.endTime ? `Duration: ${calculateDuration()}` : ''}
                    </div>
                  </div>
                </>
              )}
              {step === 6 && (
                <>
                  <h1 className={styles.prompt}>Where is it happening?</h1>
                  <div className={styles.twoCols}>
                    <div className={styles.inputGroup} style={{ position: 'relative' }}>
                      <label className={styles.label}>City/Area</label>
                      <select name="location" value={formData.location} onChange={handleChange} className={styles.input} style={{ appearance: 'none', WebkitAppearance: 'none', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: formData.location ? '#fff' : '#737373', cursor: 'pointer' }}>
                        <option value="" disabled>Select City</option>
                        <option value="Darjeeling">Darjeeling</option>
                        <option value="Kalimpong">Kalimpong</option>
                        <option value="Gangtok">Gangtok</option>
                      </select>
                      <div style={{ position: 'absolute', right: '16px', top: '42px', pointerEvents: 'none' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Venue Name (e.g. Chowrasta)</label>
                      <input type="text" name="venue" value={formData.venue} onChange={handleChange} onKeyDown={handleKeyDown} className={styles.input} />
                    </div>
                  </div>
                </>
              )}
              {step === 7 && (
                <>
                  <h1 className={styles.prompt}>Things to know (Optional)</h1>
                  <p style={{ color: '#A3A3A3', fontFamily: 'Inter', fontSize: '14px', marginBottom: '16px' }}>
                    Add any important rules, inclusions, or notes. One per line.
                  </p>
                  <textarea ref={inputRef} name="thingsToKnow" value={formData.thingsToKnow} onChange={handleChange} className={styles.textareaLarge} placeholder={"e.g. Bring your own yoga mat.\nEntry allowed for 18+ only."} />
                </>
              )}
              {step === 8 && (
                <>
                  <h1 className={styles.prompt}>Is there an age limit?</h1>
                  <div className={styles.optionsGrid}>
                    {AGE_LIMITS.map(limit => (
                      <div key={limit} className={`${styles.optionCard} ${formData.ageLimit === limit ? styles.active : ''}`} onClick={() => setFormData({ ...formData, ageLimit: limit })}>
                        {limit}
                      </div>
                    ))}
                  </div>
                </>
              )}
              {step === 9 && (
                <>
                  <h1 className={styles.prompt}>What&apos;s the entry fee?</h1>
                  <input ref={inputRef} type="text" name="entryFee" value={formData.entryFee} onChange={handleChange} onKeyDown={handleKeyDown} className={styles.inputLarge} placeholder="e.g. Rs 500 or Free" />
                </>
              )}
              {step === 10 && (
                <>
                  <h1 className={styles.prompt}>Upload a cover image.</h1>
                  <label className={styles.fileUpload}>
                    <input type="file" accept="image/*" onChange={handleImageChange} className={styles.fileInput} />
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className={styles.uploadPreview} />
                    ) : (
                      <div className={styles.uploadText}>Click to browse or drag image here</div>
                    )}
                  </label>
                </>
              )}
              {step === 11 && (
                <>
                  <h1 className={styles.prompt}>Ready to publish?</h1>
                  {error && <div style={{ color: '#E93C3C', marginBottom: '20px' }}>{error}</div>}
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryItem}>
                      <div className={styles.summaryLabel}>Event</div>
                      <div className={styles.summaryValue}>{formData.title}</div>
                    </div>
                    <div className={styles.summaryItem}>
                      <div className={styles.summaryLabel}>Category</div>
                      <div className={styles.summaryValue}>{formData.category}</div>
                    </div>
                    <div className={styles.summaryItem}>
                      <div className={styles.summaryLabel}>When</div>
                      <div className={styles.summaryValue}>
                        {formatDateForSummary()} • {formData.startTime && formatTime12Hour(formData.startTime)} - {formData.endTime && formatTime12Hour(formData.endTime)}
                      </div>
                    </div>
                    <div className={styles.summaryItem}>
                      <div className={styles.summaryLabel}>Where</div>
                      <div className={styles.summaryValue}>{formData.venue}, {formData.location}</div>
                    </div>
                    <div className={styles.summaryItem}>
                      <div className={styles.summaryLabel}>Price</div>
                      <div className={styles.summaryValue}>{formData.entryFee || 'Free'}</div>
                    </div>
                  </div>
                  <button className={styles.btnPublish} onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Publishing...' : 'Publish Event'}
                  </button>
                </>
              )}
            </div>

            {step < totalSteps && (
              <div className={styles.controls}>
                <button className={styles.btnBack} onClick={handleBack} style={{ visibility: step === 1 ? 'hidden' : 'visible' }}>Back</button>
                <button className={styles.btnNext} onClick={handleNext} disabled={!canProceed()}>Next</button>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
