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
