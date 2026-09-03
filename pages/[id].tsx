import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// Ersetze diese Werte wieder mit deinen echten Supabase-Daten
const SUPABASE_URL = "DEIN_SUPABASE_URL";
const SUPABASE_ANON_KEY = "DEIN_SUPABASE_ANON_KEY";

export default function Workspace() {
  const router = useRouter();
  const { id } = router.query; // Das ist die UUID aus der URL
  const [loading, setLoading] = useState(true);
  const [paywallActive, setPaywallActive] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    // Simulierter Check: Wir schauen, ob Make die Daten bereits in Supabase abgelegt hat
    const checkData = async () => {
      // Hier kommt später dein echter Supabase-Fetch hin
      // z.B. let { data } = await supabase.from('links').select('*').eq('uuid', id).single();
      
      // Für den Start simulieren wir ein erfolgreiches Abfangen des Links:
      setTimeout(() => {
        setData({
          original_instagram: "https://instagram.com...",
          extracted_link: "https://die-geheime-kursseite-des-coaches.com"
        });
        setLoading(false);
      }, 2000);
    };

    checkData();
  }, [id]);

  // Funktion für den Stripe- oder Polar-Trigger (Pay-per-Click)
  const handlePayment = () => {
    // Hier fügst du einfach deinen Polar- oder Stripe-Checkout-Link ein!
    window.location.href = "HIER_DEIN_POLAR_ODER_STRIPE_LINK";
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#0b0f19', color: '#f3f4f6', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p style={{ fontSize: '1.2rem', fontFamily: 'sans-serif' }}>Mixer arbeitet... Daten werden per UUID gesichert...</p>
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
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '600px', background: '#111827', padding: '40px', borderRadius: '24px', border: '1px solid #1f2937', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', color: '#ffffff' }}>WORKSPACE</h2>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '32px', wordBreak: 'break-all' }}>ID: {id}</p>

        {paywallActive ? (
          /* DIE SCHRANKE: Hier verdienst du dein Geld */
          <div>
            <div style={{ background: '#1e1b4b', border: '1px solid #4338ca', padding: '20px', borderRadius: '16px', marginBottom: '32px' }}>
              <p style={{ color: '#c7d2fe', fontWeight: 600, marginBottom: '4px' }}>Link erfolgreich extrahiert!</p>
              <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>Der Instagram-DM-Tunnel wurde umgangen. Schalte den Sofort-Zugriff frei.</p>
            </div>
            
            <button 
              onClick={handlePayment}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                padding: '16px 40px',
                fontSize: '1.1rem',
                fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
              }}
            >
              Sofort-Klick freischalten (0,10 €)
            </button>
          </div>
        ) : (
          /* Nach der Bezahlung sieht er das Ergebnis */
          <div style={{ textAlign: 'left' }}>
            <p style={{ color: '#9ca3af', marginBottom: '8px' }}>Gemixtes Ergebnis:</p>
            <a 
              href={data?.extracted_link} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#3b82f6', fontWeight: 600, fontSize: '1.2rem', wordBreak: 'break-all' }}
            >
              {data?.extracted_link}
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
