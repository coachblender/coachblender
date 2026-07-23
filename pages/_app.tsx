// pages/_app.tsx
import Head from 'next/head';
import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'
);

export default function App({ Component, pageProps }: any) {
  useEffect(() => {
    async function trackInstagramClick() {
      const urlParams = new URLSearchParams(window.location.search);
      const coachId = urlParams.get('coach_id');
      const affiliateId = urlParams.get('affiliate_id');

      if (!coachId || !affiliateId) return;

      try {
        const ipResponse = await fetch('https://ipify.org');
        const { ip } = await ipResponse.json();

        const rawFingerprint = `${navigator.userAgent}-${navigator.language}-${screen.colorDepth}`;
        const encoder = new TextEncoder();
        const data = encoder.encode(rawFingerprint);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const fingerprint = Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        const { data: clickRecord, error } = await supabase
          .from('clicks')
          .insert([{
            coach_id: coachId,
            affiliate_id: affiliateId,
            device_fingerprint: fingerprint,
            ip_address: ip,
            user_agent: navigator.userAgent
          }])
          .select('click_id')
          .single();

        if (error) throw error;

        sessionStorage.setItem('cb_click_id', clickRecord.click_id);
        sessionStorage.setItem('matched_affiliate', affiliateId);
        console.log('Tracking aktiv. Klick-ID erfasst:', clickRecord.click_id);

      } catch (err: any) {
        console.error('Tracking-Fehler:', err.message);
      }
    }

    trackInstagramClick();
  }, []);

  return (
    <>
      <Head>
        <title>CoachBlender | Mixe dein Coaching!</title>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
