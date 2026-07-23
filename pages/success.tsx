// pages/success.tsx
import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'
);

export default function SuccessPage() {
  useEffect(() => {
    async function processSaleAfterPayment() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const transactionId = urlParams.get('session_id') || 'test_tx';
        const coachId = urlParams.get('coach_id') || 'unbekannt';
        const productId = urlParams.get('product_id') || 'default_product';
        const totalAmount = parseFloat(urlParams.get('amount') || '0');

        const ipResponse = await fetch('https://ipify.org');
        const { ip } = await ipResponse.json();

        const rawFingerprint = `${navigator.userAgent}-${navigator.language}-${screen.colorDepth}`;
        const encoder = new TextEncoder();
        const data = encoder.encode(rawFingerprint);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const fingerprint = Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        await supabase.rpc('match_and_insert_sale', {
          p_transaction_id: transactionId,
          p_coach_id: coachId,
          p_product_id: productId,
          p_total_amount: totalAmount,
          p_buyer_ip: ip,
          p_buyer_fingerprint: fingerprint
        });

        console.log('Maut erfolgreich im Browser zugeordnet!');
      } catch (err: any) {
        console.error('Fehler bei Maut-Zuordnung:', err.message);
      }
    }

    processSaleAfterPayment();
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <h1>Vielen Dank für Ihren Einkauf! 🎉</h1>
      <p>Ihre Zahlung war erfolgreich. Die Maut wurde im Netzwerk verbucht.</p>
    </div>
  );
}
