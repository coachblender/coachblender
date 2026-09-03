import { useState, useEffect } from 'react';

// Ersetze diese Werte mit deinen echten Supabase-Daten
const SUPABASE_URL = "DEIN_SUPABASE_URL";
const SUPABASE_ANON_KEY = "DEIN_SUPABASE_ANON_KEY";

export default function Home() {
  const [instaUrl, setInstaUrl] = useState('');
  const [statusMsg, setStatusMsg] = useState('Bereit.');
  const [statusColor, setStatusColor] = useState('#4b5563');
  const [sessionUuid, setSessionUuid] = useState<string | null>(null);

  // Unsichtbare Magie: UUID generieren sobald die Seite lädt oder das Feld fokussiert wird
  const initializeSession = () => {
    if (typeof window !== 'undefined' && !sessionUuid) {
      let currentId = localStorage.getItem('coachblender_anonymous_id');
      
      if (!currentId) {
        // Generiert eine sichere Browser-UUID
        currentId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
        localStorage.setItem('coachblender_anonymous_id', currentId);
      }
      
      setSessionUuid(currentId);
      setStatusMsg("Sitzung anonym initialisiert.");
      setStatusColor("#10b981");
    }
  };

  const handleMix = async () => {
    if (!instaUrl.trim()) {
      alert('Bitte füge zuerst einen gültigen Instagram-Link ein.');
      return;
    }

    setStatusMsg("Verarbeite... Pipeline gestartet.");
    setStatusColor("#3b82f6");

    // Dein exakter Make-Webhook aus dem Bild (Stripe Live Neu)
    const makeWebhookUrl = "https://hook.eu1.make.com/9dhesa4fykc12az9ww7a1jmfpu8xhpp5";

    try {
      const response = await fetch(makeWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonymous_id: sessionUuid,
          instagram_url: instaUrl.trim(),
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setStatusMsg("Erfolgreich gemixt! Überprüfe die Pipeline.");
        setStatusColor("#10b981");
      } else {
        setStatusMsg("Schnittstellen-Fehler. Bitte erneut versuchen.");
        setStatusColor("#ef4444");
      }
    } catch (error) {
      setStatusMsg("Netzwerkfehler beim Senden an Make.");
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
      align-items: 'center',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '680px', textAlign: 'center' }}>
        
        {/* Branding */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 900,
            letterSpacing: '-0.05em',
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            removeAttribute: 'WebkitTextFillColor',
            marginBottom: '12px'
          }}>COACHBLENDER</h1>
          <p style={{ fontSize: '1.15rem', color: '#9ca3af', fontWeight: 400 }}>
            Egos filtern. Links mixen. Sofort-Zugriff ohne Anmeldung.
          </p>
        </div>

        {/* Central Search Element (Google-Style) */}
        <div style={{
          position: 'relative',
          background: '#111827',
          border: '1px solid #1f2937',
          borderRadius: '9999px',
          padding: '6px 6px 6px 24px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          marginBottom: '24px'
        }}>
          <input 
            type="text" 
            value={instaUrl}
            onChange={(e) => setInstaUrl(e.target.value)}
            onFocus={initializeSession}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '1.1rem',
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
              padding: '12px 32px',
              fontSize: '1.05rem',
              fontWeight: 600,
              cursor: pointer,
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

        {/* Hidden Status Feed */}
        <p style={{ fontSize: '0.85rem', color: statusColor, marginTop: '12px', transition: 'color 0.3s' }}>
          {statusMsg}
        </p>
      </div>
    </div>
  );
}
