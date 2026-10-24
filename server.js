const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const SYSTEM_PROMPT = `Du bist ein Inventur-Assistent für Palettenlager. Der Text kommt von einer Spracherkennung und kann Tippfehler oder phonetische Fehler enthalten – sei bei der Erkennung großzügig.

Erlaubte Palettenarten (verwende exakt diese Schreibweise):
Europalette, Europalette 2, Europalette 3, Gitterbox, Steinzeug Gitterbox, Ziegelpalette, Gipskartonpalette, Fermacellpalette, MUHR-Palette, Steinzeugpalette, Steinzeugpalette klein, Steinzeugpalette groß, EHL-Palette, Eder-Palette, Limex-Palette, KS-Palette, Porenbetonpalette, KB-Palette, Velux-Palette, Spezialpalette, Grafepalette

Synonyme und typische Spracherkennungs-Fehler:
europalette 2 / euro 2 / ep2 → Europalette 2
europalette 3 / euro 3 / ep3 → Europalette 3
euro / europalette / europool / epal → Europalette (NUR wenn KEINE 2 oder 3 dabei)
gitterbox / gitter box / gitter-box / gkr → Gitterbox
gipskarton / gips karton / gips-karton / gips / gkb → Gipskartonpalette
fermacell / ferma cell / ferma zell / fermazell / fels / ferma → Fermacellpalette
muhr / mur / moor / muhr-palette → MUHR-Palette
steinzeug gitterbox / steinzeug-gitterbox / stein zeug gitterbox → Steinzeug Gitterbox
steinzeug groß / steinzeugpalette groß / steinzeug gross → Steinzeugpalette groß
steinzeug klein / steinzeugpalette klein → Steinzeugpalette klein
steinzeug / stein zeug / stg → Steinzeugpalette (NUR wenn KEIN groß/klein/gitterbox dabei)
ks / kalksandstein / kalk sandstein → KS-Palette
porenbeton / poren beton / ytong / gasbeton / h+h → Porenbetonpalette
klinker / kb / klinker-palette → KB-Palette
velux / welux / felix → Velux-Palette
ehl / eel / eel-palette → EHL-Palette
eder / eder-palette → Eder-Palette
limex / limes / lime x → Limex-Palette
ziegel / ziegel-palette / ziegelpalette → Ziegelpalette
grafe / grafepalette / graffe → Grafepalette
spezial / spezial-palette → Spezialpalette

Zahlen können als Wort (zwanzig) oder Ziffer (20) auftauchen.
Plural-Endungen ignorieren: "Europaletten" = "Europalette".
Wenn ein Wort phonetisch ähnlich klingt, verwende die beste Übereinstimmung.

WICHTIG: Der Nutzer nennt pro Spracheingabe IMMER NUR EINE Palettenart.
Gib deshalb immer genau ein Element zurück (nie mehrere).
Wähle die spezifischste Übereinstimmung (z.B. "Steinzeug Gitterbox" schlägt "Gitterbox" allein).

Antworte AUSSCHLIESSLICH mit gültigem JSON-Array, kein Text davor oder danach:
[{"palettenart":"Europalette","anzahl":15}]
Wenn nichts erkannt: []`;

// ============================================
// API: TEXT → PALETTEN PARSEN (via Groq)
// ============================================
app.post('/api/parse-palette', async (req, res) => {
    try {
        const { text, extraTypes = [] } = req.body;
        if (!text?.trim()) return res.json({ success: false, error: 'Kein Text' });
        if (!GROQ_API_KEY) return res.json({ success: false, error: 'API Key fehlt' });

        // Eigene Palettenarten dynamisch anhängen
        let systemPrompt = SYSTEM_PROMPT;
        if (Array.isArray(extraTypes) && extraTypes.length > 0) {
            const sanitized = extraTypes.map(t => String(t).replace(/[`"]/g, '')).slice(0, 50);
            systemPrompt += `\n\nZusätzliche benutzerdefinierte Palettenarten (ebenfalls gültig, exakt so zurückgeben):\n${sanitized.join(', ')}`;
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: text }
                ],
                max_tokens: 300,
                temperature: 0
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Groq Fehler:', errText);
            return res.json({ success: false, error: `Groq ${response.status}` });
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content?.trim() || '[]';

        let paletten = [];
        try {
            const match = content.match(/\[[\s\S]*\]/);
            if (match) paletten = JSON.parse(match[0]);
        } catch (e) {
            console.warn('JSON parse error:', e.message, '| Content:', content);
        }

        res.json({ success: true, paletten });
    } catch (err) {
        console.error('Fehler in /api/parse-palette:', err);
        res.json({ success: false, error: err.message });
    }
});

// Root → index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => console.log(`✅ Server läuft auf Port ${port}`));
