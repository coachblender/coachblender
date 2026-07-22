// pages/register.tsx
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [id, setId] = useState(''); // coach_id oder affiliate_id
  const [role, setRole] = useState('coach'); // 'coach' oder 'affiliate'
  const [message, setMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Verarbeite...');

    try {
      // 1. Benutzer im geschlossenen Supabase-Auth-System anlegen
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Registrierung fehlgeschlagen.');

      // 2. Eintrag in der jeweiligen Fach-Tabelle (coaches oder affiliates) anlegen
      if (role === 'coach') {
        const { error: coachError } = await supabase
          .from('coaches')
          .insert([{ coach_id: id, user_id: authData.user.id, company_name: name }]);
        if (coachError) throw coachError;
      } else {
        const { error: affError } = await supabase
          .from('affiliates')
          .insert([{ affiliate_id: id, user_id: authData.user.id, full_name: name }]);
        if (affError) throw affError;
      }

      setMessage('Registrierung erfolgreich! Bitte E-Mail bestätigen.');
    } catch (err: any) {
      setMessage(`Fehler: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h2>Mautstelle - Portal-Registrierung</h2>
      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: '15px' }}>
          <label>Konto-Typ:</label><br />
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '8px' }}>
            <option value="coach">Coach (Anbieter)</option>
            <option value="affiliate">Dienstleister (Affiliate)</option>
          </select>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Wunsch-ID (z.B. deinName123):</label>
          <input type="text" value={id} onChange={(e) => setId(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Vollständiger Name / Firmenname:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>E-Mail-Adresse:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Passwort:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Konto anlegen
        </button>
      </form>
      {message && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}
