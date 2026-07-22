import { createClient } from '@supabase/supabase-client'

// Initialisierung über die sicheren Vercel-Umgebungsvariablen
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function trackInstagramClick() {
  const urlParams = new URLSearchParams(window.location.search);
  const coachId = urlParams.get('coach_id');
  const affiliateId = urlParams.get('affiliate_id');

  // Abbrechen, wenn die IDs in der URL fehlen
  if (!coachId || !affiliateId) return;

  try {
    // 1. IP-Adresse des In-App-Browsers ermitteln
    const ipResponse = await fetch('https://ipify.org');
    const { ip } = await ipResponse.json();

    // 2. Eindeutigen Device-Fingerprint generieren (Instagram-Schutz)
    const rawFingerprint = `${navigator.userAgent}-${navigator.language}-${screen.colorDepth}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(rawFingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const fingerprint = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    // 3. Klick direkt in die Supabase 'clicks'-Tabelle feuern
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

    // 4. Klick-ID im Browser merken, damit die 5%-Maut beim Kauf zugeordnet werden kann
    sessionStorage.setItem('cb_click_id', clickRecord.click_id);
    sessionStorage.setItem('matched_affiliate', affiliateId);
    console.log('Tracking aktiv. Klick-ID erfasst:', clickRecord.click_id);

  } catch (err) {
    console.error('Tracking-Fehler:', err.message);
  }
}
