// next-frontend/pages/go.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function Go() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    async function processInvisibleMaut() {
      const { c_id, affiliate_id, redirect_to } = router.query;

      // Sicherheitsreißleine: Ohne gültige Coach-UUID blockiert das System zum Eigenschutz
      if (!c_id || typeof c_id !== 'string') {
        router.push('/');
        return;
      }

      let targetUrl = redirect_to ? decodeURIComponent(redirect_to as string) : 'https://coachblender.com';

      try {
        // 1. IP-Adresse des In-App-Browsers ermitteln
        const ipResponse = await fetch('https://ipify.org');
        const { ip } = await ipResponse.json();

        // 2. Unbestechlicher Device-Fingerprint (Reine Logik-Kommunikation)
        const rawFingerprint = `${navigator.userAgent}-${navigator.language}-${screen.colorDepth}`;
        const encoder = new TextEncoder();
        const data = encoder.encode(rawFingerprint);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const fingerprint = Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        // 3. Klick in die Supabase-Tabelle 'clicks' feuern
        const { data: clickRecord, error } = await supabase
          .from('clicks')
          .insert([{
            coach_id: c_id,
            affiliate_id: affiliate_id || 'direct',
            device_fingerprint: fingerprint,
            ip_address: ip,
            user_agent: navigator.userAgent,
            status: 'pending'
          }])
          .select('click_id')
          .single();

        if (error) throw error;

        // 4. DER CLOU (Die Estland-Logik): Wir reichern den Stripe-Zahlungslink mit der Klick-ID an!
        if (clickRecord && clickRecord.click_id) {
          const stripeUrl = new URL(targetUrl);
          // Stripe erkennt diesen Parameter automatisch und schleift ihn bis zum Make-Webhook durch!
          stripeUrl.searchParams.set('client_reference_id', clickRecord.click_id);
          targetUrl = stripeUrl.toString();
        }

      } catch (err) {
        // Absolute Ausfallsicherheit: Client-Fehler unterbrechen NIEMALS den Zahlungsfluss des Coaches!
        console.error('Sicherheits-Failover aktiviert. Weiterleitung erfolgt nativ:', err);
      } finally {
        // 5. Radikale Weiterschaltung an die präparierte Stripe-URL
        window.location.href = targetUrl;
      }
    }

    processInvisibleMaut();
  }, [router.isReady, router.query]);

  return (
    <div style={{ backgroundColor: '#0B0F19', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#4B5563', fontFamily: 'sans-serif' }}>
      <p style={{ fontSize: '0.875rem', letterSpacing: '0.05em' }}>Sichere Express-Verbindung wird hergestellt...</p>
    </div>
  );
}
