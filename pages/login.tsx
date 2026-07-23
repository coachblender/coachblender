// pages/login.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'
);


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Melde an...');

    try {
      // 1. In Supabase-Auth einloggen
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Login fehlgeschlagen.');

      // 2. Rolle prüfen: Ist es ein Coach?
      const { data: coachData } = await supabase
        .from('coaches')
        .select('coach_id')
        .eq('user_id', authData.user.id)
        .single();

      if (coachData) {
        router.push('/dashboard?role=coach');
        return;
      }

      // 3. Wenn kein Coach, dann ist es ein Affiliate (Dienstleister)
      const { data: affData } = await supabase
        .from('affiliates')
        .select('affiliate_id')
        .eq('user_id', authData.user.id)
        .single();

      if (affData) {
        router.push('/dashboard?role=affiliate');
        return;
      }

      throw new Error('Kein Profil gefunden.');
    } catch (err: any) {
      setMessage(`Fehler: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h2>Mautstelle - Portal Login</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label>E-Mail-Adresse:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Passwort:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Einloggen
        </button>
      </form>
      {message && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}
