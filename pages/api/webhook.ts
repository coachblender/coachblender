// pages/api/webhook.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Vercel anweisen, den Datenstrom NICHT als JSON zu parsen (Raw Body)
export const config = {
  api: {
    bodyParser: false,
  },
};

// Hilfsfunktion, um den unberührten Datenstrom von Stripe einzulesen
async function getRawBody(readable: any) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // Den unberührten String für Stripe sichern
    const rawBody = await getRawBody(req);
    const event = JSON.parse(rawBody); // Einfaches Parsing ohne strenge Signatur-Prüfung

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Daten aus den Stripe-Metadaten ziehen
      const transactionId = session.id;
      const totalAmount = session.amount_total / 100;
      const coachId = session.metadata?.coach_id || 'unbekannt';
      const productId = session.metadata?.product_id || 'default_product';
      const buyerIp = session.customer_details?.ip_address || '127.0.0.1';

      // Abgleich-Funktion in Supabase triggern
      await supabase.rpc('match_and_insert_sale', {
        p_transaction_id: transactionId,
        p_coach_id: coachId,
        p_product_id: productId,
        p_total_amount: totalAmount,
        p_buyer_ip: buyerIp,
        p_buyer_fingerprint: 'stripe_webhook_pushed'
      });
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
}
