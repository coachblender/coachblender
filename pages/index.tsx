import { useState } from 'react';
import { useRouter } from 'next/router';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export default function Home() {
  const router = useRouter();
  const [instaUrl, setInstaUrl] = useState('');
  const [statusMsg, setStatusMsg] = useState('Bereit.');
  const [statusColor, setStatusColor] = useState('#4b5563');

  const handleMix = async () => {
    if (!instaUrl.trim()) {
      alert('Bitte füge zuerst einen gültigen Instagram-Link ein.');
      return;
    }

    setStatusMsg("Verarbeite... Pipeline gestartet.");
    setStatusColor("#3b82f6");

    let currentId = typeof window !== 'undefined' ? localStorage.getItem('coachblender_anonymous_id') : null;
    if (!currentId) {
      currentId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('coachblender_anonymous_id', currentId);
      }
    }

    try {
      const supaRes = await fetch(`${SUPABASE_URL}/rest/v1/anonymous_sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify({
          id: currentId,
          instagram_url: instaUrl.trim(),
          status: 'unpaid'
        })
      });

      if (!supaRes.ok) {
        setStatusMsg("Datenbank-Fehler beim Anlegen der Session.");
        setStatusColor("#ef4444");
        return;
      }

      setStatusMsg("Erfolgreich gemixt! Weiterleitung...");
      setStatusColor("#10b981");
      router.push(`/${currentId}`);
    } catch (error) {
      setStatusMsg("Netzwerkfehler beim Starten der Session.");
      setStatusColor("#ef4444");
    }
  };

  return (
    <div style={{
      backgroundColor: '#0b0f19',
      color: '#f3f4f6',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '680px', textAlign: 'center' }}>
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '4rem',
            fontWeight: 900,
            letterSpacing: '-0.05em',
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '12px'
          }}>COACHBLENDER</h1>
          <p style={{ fontSize: '1.25rem', color: '#9ca3af', fontWeight: 400, letterSpacing: '0.02em' }}>
            Egos filtern. Links mixen. Sofort-Zugriff ohne Anmeldung.
          </p>
        </div>

        <div style={{
          position: 'relative',
          background: '#111827',
          border: '1px solid #1f2937',
          borderRadius: '9999px',
          padding: '6px 6px 6px 24px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          marginBottom: '24px'
        }}>
          <input 
            type="text" 
            value={instaUrl}
            onChange={(e) => setInstaUrl(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '1.15rem',
              padding: '12px 0',
              width: '100%'
            }}
            placeholder="://instagram.com..." 
            autoComplete="off"
            spellCheck="false"
          />
          <button 
            onClick={handleMix}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              outline: 'none',
              borderRadius: '9999px',
              padding: '14px 36px',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>Mixen</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: statusColor, marginTop: '12px', transition: 'color 0.3s ease', letterSpacing: '0.05em' }}>
          {statusMsg}
        </p>
      </div>
    </div>
  );
}
