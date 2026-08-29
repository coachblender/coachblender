// next-frontend/pages/go.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

// Minimaler, robuster Client für das asynchrone Logging im Hintergrund
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function Go() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    async function processInvisibleMaut() {
      // Wir holen die UUID des Coaches (c_id) und die Ziel-Verkaufsseite (redirect_to) aus der URL
      const { c_id, affiliate_id, redirect_to } = router.query;

      // Ohne Coach-UUID bricht das System ab und schützt sich selbst
      if (!c_id || typeof c_id !== 'string') {
        router.push('/');
        return;
      }

      // Die Zielseite des Coaches (z.B. sein Stripe Checkout oder Elopage Link)
      const targetUrl = redirect_to ? decodeURIComponent(redirect_to as string) : 'https://coachblender.com';

      try {
        // 1. IP-Adresse des In-App-Browsers ermitteln
        const ipResponse = await fetch('https://ipify.org');
        const { ip } = await ipResponse.json();

        // 2. Unbestechlicher Device-Fingerprint (Logik-Kommunikation)
        const rawFingerprint = `${navigator.userAgent}-${navigator.language}-${screen.colorDepth}`;
        const encoder = new TextEncoder();
        const data = encoder.encode(rawFingerprint);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const fingerprint = Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        // 3. Klick asynchron in die Supabase 'clicks'-Tabelle feuern
        const { data: clickRecord, error } = await supabase
          .from('clicks')
          .insert([{
            coach_id: c_id, // Die UUID des Coaches aus der URL
            affiliate_id: affiliate_id || 'direct',
            device_fingerprint: fingerprint,
            ip_address: ip,
            user_agent: navigator.userAgent,
            status: 'pending'
          }])
          .select('click_id')
          .single();

        if (error) throw error;

        // 4. Setzen des First-Party-Cookies für die spätere Stripe-Connect-Maut (30 Tage gültig)
        if (clickRecord) {
          document.cookie = `cb_click_id=${clickRecord.click_id}; path=/; max-age=2592000; SameSite=Lax; Secure`;
          sessionStorage.setItem('cb_click_id', clickRecord.click_id);
        }

      } catch (err) {
        // Fehler blockieren NIEMALS den Nutzer. Das System leitet trotzdem weiter!
        console.error('Unsichtbares Tracking fehlgeschlagen, leite Sicherheits-Failover ein:', err);
      } finally {
        // 5. Radikale Weiterschaltung: Der Kunde merkt absolut nichts von der Maut
        window.location.href = targetUrl;
      }
    }

    processInvisibleMaut();
  }, [router.isReady, router.query]);

  return (
    <div style={{ backgroundColor: '#0B0F19', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#4B5563', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.875rem', letterSpacing: '0.05em', margin: 0 }}>Sichere Express-Verbindung wird hergestellt...</p>
      </div>
    </div>
  );
}
