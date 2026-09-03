<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>COACHBLENDER - Egos filtern. Links mixen.</title>
    <!-- Einbindung des offiziellen Supabase-Clients -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        body {
            background-color: #0b0f19; /* Eiskaltes, dunkles Interface */
            color: #f3f4f6;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            width: 100%;
            max-width: 680px;
            text-align: center;
        }

        /* 1. Das Branding */
        .branding {
            margin-bottom: 48px;
        }

        .title {
            font-size: 3.5rem;
            font-weight: 900;
            letter-spacing: -0.05em;
            text-transform: uppercase;
            background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 12px;
        }

        .subtitle {
            font-size: 1.15rem;
            color: #9ca3af;
            font-weight: 400;
            letter-spacing: 0.02em;
        }

        /* 2. Das zentrale Suchfeld (Google-Style) */
        .search-container {
            position: relative;
            background: #111827;
            border: 1px solid #1f2937;
            border-radius: 9999px;
            padding: 6px 6px 6px 24px;
            display: flex;
            align-items: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
            margin-bottom: 24px;
        }

        .search-container:focus-within {
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2), 0 4px 20px rgba(0, 0, 0, 0.4);
            background: #141c2f;
        }

        .search-input {
            flex: 1;
            background: transparent;
            border: none;
            outline: none;
            color: #ffffff;
            font-size: 1.1rem;
            padding: 12px 0;
            width: 100%;
        }

        .search-input::placeholder {
            color: #4b5563;
        }

        /* 3. Der Action-Button */
        .mix-button {
            background: #2563eb;
            color: #ffffff;
            border: none;
            outline: none;
            border-radius: 9999px;
            padding: 12px 32px;
            font-size: 1.05rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s ease, transform 0.1s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .mix-button:hover {
            background: #1d4ed8;
        }

        .mix-button:active {
            transform: scale(0.98);
        }

        /* Unsichtbare Statusanzeige */
        .status-badge {
            font-size: 0.85rem;
            color: #4b5563;
            margin-top: 12px;
            transition: color 0.3s ease;
        }

        .status-badge.active {
            color: #10b981;
        }
    </style>
</head>
<body>

    <div class="container">
        <!-- Branding Section -->
        <div class="branding">
            <h1 class="title">COACHBLENDER</h1>
            <p class="subtitle">Egos filtern. Links mixen. Sofort-Zugriff ohne Anmeldung.</p>
        </div>

        <!-- Action Zone (Google-Style Search) -->
        <div class="search-container">
            <input 
                type="text" 
                id="instaUrl" 
                class="search-input" 
                placeholder="instagram.com/reel/..." 
                autocomplete="off"
                spellcheck="false"
            >
            <button id="mixBtn" class="mix-button">
                <span>Mixen</span>
                <!-- Blitz-Symbol SVG -->
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
            </button>
        </div>

        <!-- Still-Rückmeldung im Hintergrund -->
        <p id="statusMsg" class="status-badge">Bereit.</p>
    </div>

    <script>
        // --- 4. UNSICHTBARE LOGIK (SUPABASE & WEBHOOK) ---
        
        // Füge hier deine echten Supabase-Zugangsdaten ein
        const SUPABASE_URL = "DEIN_SUPABASE_URL";
        const SUPABASE_ANON_KEY = "DEIN_SUPABASE_ANON_KEY";
        const supabase = window.supabase ? window.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

        const inputField = document.getElementById('instaUrl');
        const statusMsg = document.getElementById('statusMsg');
        const mixBtn = document.getElementById('mixBtn');

        let sessionUuid = localStorage.getItem('coachblender_anonymous_id');

        // Die unsichtbare Magie: Sobald der Cursor ins Feld springt, wird die anonyme UUID generiert
        inputField.addEventListener('focus', async () => {
            if (!sessionUuid) {
                // Generiert eine sichere RFC4122 v4 UUID direkt im Browser
                sessionUuid = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
                );
                
                localStorage.setItem('coachblender_anonymous_id', sessionUuid);
                statusMsg.textContent = "Sitzung anonym initialisiert.";
                statusMsg.classList.add('active');

                // Legt die anonyme ID im Hintergrund stillschweigend in Supabase an
                if (supabase) {
                    await supabase.from('anonymous_sessions').insert([{ id: sessionUuid }]);
                }
            }
        });

        // Klick auf den "Mixen" Button feuert die Pipeline ab
        mixBtn.addEventListener('click', async () => {
            const urlValue = inputField.value.trim();
            if (!urlValue) {
                alert('Bitte füge zuerst einen gültigen Instagram-Link ein.');
                return;
            }

            statusMsg.textContent = "Verarbeite... Pipeline gestartet.";
            statusMsg.style.color = "#3b82f6";

            // Dein exakter Make-Webhook aus dem Bild (Stripe Live Neu)
            const makeWebhookUrl = "https://hook.eu1.make.com/9dhesa4fykc12az9ww7a1jmfpu8xhpp5";

            try {
                const response = await fetch(makeWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        anonymous_id: sessionUuid,
                        instagram_url: urlValue,
                        timestamp: new Date().toISOString()
                    })
                });

                if (response.ok) {
                    statusMsg.textContent = "Erfolgreich gemixt! Überprüfe die Pipeline.";
                    statusMsg.style.color = "#10b981";
                } else {
                    statusMsg.textContent = "Schnittstellen-Fehler. Bitte erneut versuchen.";
                    statusMsg.style.color = "#ef4444";
                }
            } catch (error) {
                statusMsg.textContent = "Netzwerkfehler beim Senden an Make.";
                statusMsg.style.color = "#ef4444";
            }
        });
    </script>
</body>
</html>
