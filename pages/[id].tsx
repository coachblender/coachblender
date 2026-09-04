import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// Trage hier deine echten Supabase-Zugangsdaten ein
const SUPABASE_URL = "DEIN_SUPABASE_URL";
const SUPABASE_ANON_KEY = "DEIN_SUPABASE_ANON_KEY";

export default function Workspace() {
  const router = useRouter();
  const { id } = router.query; // Holt die anonyme UUID aus der URL
  const [loading, setLoading] = useState(true);
  const [paywallActive, setPaywallActive] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    // Diese Funktion prüft in Echtzeit, ob Make die Daten in Supabase abgelegt hat
    const checkData = async () => {
      try {
        // Hier wird die Zeile über die eindeutige ID (UUID) abgefragt
        // Sobald deine Supabase-Tabelle bereit ist, entkommentierst du diese Zeilen:
        /*
        const response = await fetch(`${SUPABASE_URL}/rest/v1/anonymous_sessions?id=eq.${id}`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        const result = await response.json();
        if (result && result[0]) {
          setData(result[0]);
          if (result[0].status === 'paid') {
            setPaywallActive(false);
          }
        }
        */

        // Für den allerersten Start simulieren wir die erfolgreiche Extraktion:
        setData({
          original_instagram: "https://instagram.com...",
          extracted_link: "https://die-geheime-kursseite-des-coaches.com"
        });
        setLoading(false);
      } catch (error) {
        console.error("Fehler beim Laden der Daten aus Supabase:", error);
        setLoading(false);
      }
    };

    checkData();
    // Ein optionaler Intervall-Check (alle 3 Sekunden), falls Make noch im Hintergrund arbeitet
    const interval = setInterval(checkData, 3000);
    return () => clearInterval(interval);
  }, [id]);

  // Die unschlagbare Bezahlschranke über Polar
  const handlePayment = () => {
    if (!id) return;

    // DEIN LIVE POLAR PRODUKT LINK
    // Nutzt den URL-Pass-Through-Trick, um die UUID sauber an den Webhook weiterzugeben
    const polarProductUrl = "https://polar.sh";
    
    // Leitet den Nutzer direkt zum Checkout weiter und brennt die UUID in die Metadaten ein
    window.location.href = `${polarProductUrl}?metadata[anonymous_id]=${id}`;
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#0b0f19', color: '#f3f4f6', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p style={{ fontSize: '1.2rem', fontFamily: '-apple-system, sans-serif', letterSpacing: '0.05em' }}>
          Mixer arbeitet... Daten werden per UUID gesichert...
        </p>
      </div>
    );
  }

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
      <div style={{ 
        width: '100%', 
        maxWidth: '600px', 
        background: '#111827', 
        padding: '40px', 
        borderRadius: '24px', 
        border: '1px solid #1f2937', 
        textAlign: 'center', 
        boxShadow: '0 10px 40px rgba(0,0,0,0.6)' 
      }}>
        
        <h2 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '8px', color: '#ffffff', letterSpacing: '-0.03em' }}>
          WORKSPACE
        </h2>
        <p style={{ color: '#4b5563', fontSize: '0.85rem', marginBottom: '32px', wordBreak: 'break-all', letterSpacing: '0.05em' }}>
          SESSION-ID: {id}
        </p>

        {paywallActive ? (
          /* DIE SCHRANKE: Hier wird ab jetzt ohne Stripe-Frust abkassiert */
          <div>
            <div style={{ 
              background: '#1e1b4b', 
              border: '1px solid #4338ca', 
              padding: '24px', 
              borderRadius: '16px', 
              marginBottom: '32px',
              textAlign: 'left'
            }}>
              <p style={{ color: '#c7d2fe', fontWeight: 700, marginBottom: '6px', fontSize: '1.1rem' }}>
                💥 Link erfolgreich extrahiert!
              </p>
              <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Der Instagram-DM-Tunnel wurde vollständig umgangen. Schalte den Sofort-Klick frei, um den Inhalt direkt abzurufen.
              </p>
            </div>
            
            <button 
              onClick={handlePayment}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                padding: '18px 40px',
                fontSize: '1.15rem',
                fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
                boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)',
                transition: 'transform 0.1s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Sofort-Klick freischalten (Pay what you want)
            </button>
          </div>
        ) : (
          /* Das befreite Ergebnis nach der erfolgreichen Polar-Maut */
          <div style={{ textAlign: 'left', background: '#064e3b', border: '1px solid #059669', padding: '24px', borderRadius: '16px' }}>
            <p style={{ color: '#a7f3d0', fontWeight: 700, marginBottom: '8px' }}>Ziel-Link freigeschaltet:</p>
            <a 
              href={data?.extracted_link} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#ffffff', fontWeight: 600, fontSize: '1.25rem', wordBreak: 'break-all', decoration: 'underline' }}
            >
              {data?.extracted_link}
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
