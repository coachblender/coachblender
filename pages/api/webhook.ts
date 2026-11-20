// pages/api/webhook.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(readable: any) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

// Deine neue Supabase-Singapur-Instanz (nutzt Vercel Environment Variables oder deine direkte URL)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.co';
// Wichtig: Für serverseitige Updates am besten den Secret/Service-Role Key in Vercel hinterlegen
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const rawBody = await getRawBody(req);
    const event = JSON.parse(rawBody);

    // Prüft auf abgeschlossene Stripe-Checkout-Zahlung
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Liest die Session-UUID aus client_reference_id (oder alternativ aus metadata.anonymous_id)
      const anonymousId = session.client_reference_id || session.metadata?.anonymous_id;

      if (!anonymousId) {
        return res.status(200).json({ received: true, status: 'ignored_no_client_reference_id' });
      }

      // Setzt den Status in anonymous_sessions auf "paid"
      const { error } = await supabase
        .from('anonymous_sessions')
        .update({ status: 'paid' })
        .eq('id', anonymousId);

      if (error) {
        console.error('Supabase Update Fehler:', error.message);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ received: true, updated_session: anonymousId });
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
}
