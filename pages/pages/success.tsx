async function processSaleAfterPayment(transactionId, productId, totalAmount, coachId) {
  try {
    // 1. Aktuelle IP-Adresse des Käufers holen
    const ipResponse = await fetch('https://ipify.org');
    const { ip } = await ipResponse.json();

    // 2. Device-Fingerprint des aktuellen Browsers berechnen
    const rawFingerprint = `${navigator.userAgent}-${navigator.language}-${screen.colorDepth}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(rawFingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const fingerprint = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // 3. Den Match-Prozess in Supabase RPC aufrufen
    const { data: saleId, error } = await supabase.rpc('match_and_insert_sale', {
      p_transaction_id: transactionId,
      p_coach_id: coachId,
      p_product_id: productId,
      p_total_amount: totalAmount,
      p_buyer_ip: ip,
      p_buyer_fingerprint: fingerprint
    });

    if (error) throw error;
    console.log('Maut erfolgreich verbucht! Sale-ID:', saleId);

  } catch (err) {
    console.error('Maut-Zuweisungsfehler:', err.message);
  }
}
