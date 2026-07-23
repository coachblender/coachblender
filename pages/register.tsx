import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'
);

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [id, setId] = useState(''); 
  const [role, setRole] = useState('coach'); 
  const [message, setMessage] = useState('');

const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Verarbeite...');

    // WICHTIG: Die Wunsch-ID radikal in Kleinbuchstaben umwandeln!
    const cleanId = id.trim().toLowerCase();

    try {
      // 1. Benutzer im Auth-System anlegen
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Registrierung fehlgeschlagen.');

      // 2. Eintrag in der exakten AWIN-Tabelle anlegen
      if (role === 'coach') {
        const { error: coachError } = await supabase
          .from('coaches')
          .insert([{ 
            coach_id: cleanId, // Bereinigte ID
            user_id: authData.user.id, 
            company_name: name 
          }]);
        if (coachError) throw coachError;
      } else {
        const { error: affError } = await supabase
          .from('affiliates')
          .insert([{ 
            affiliate_id: cleanId, // Bereinigte ID
            user_id: authData.user.id, 
            full_name: name 
          }]);
        if (affError) throw affError;
      }

      setMessage('Registrierung erfolgreich! Bitte E-Mail bestätigen.');
    } catch (err: any) {
      setMessage(`Fehler: ${err.message}`);
    }
  };
