// pages/api/webhook.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = req.body;

    // Nur verarbeiten, wenn die Zahlung bei Stripe erfolgreich war
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Daten aus den Stripe-Metadaten ziehen
      const transactionId = session.id;
      const totalAmount = session.amount_total / 100; // Stripe rechnet in Cents
      const coachId = session.metadata?.coach_id || 'unbekannt';
      const productId = session.metadata?.product_id || 'default_product';
      const buyerIp = session.customer_details?.ip_address || '127.0.0.1';
      
      // Platzhalter für den Fingerprint, da serverseitig kein Browser existiert
      const buyerFingerprint = 'stripe_webhook_pushed';

      // Die vorbereitete PostgreSQL-Matching-Funktion in Supabase triggern
      const { data, error } = await supabase.rpc('match_and_insert_sale', {
        p_transaction_id: transactionId,
        p_coach_id: coachId,
        p_product_id: productId,
        p_total_amount: totalAmount,
        p_buyer_ip: buyerIp,
        p_buyer_fingerprint: buyerFingerprint
      });

      if (error) throw error;
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Webhook-Fehler:', err.message);
    return res.status(400).json({ error: err.message });
  }
}
