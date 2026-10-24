const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const SYSTEM_PROMPT = `Du bist ein Inventur-Assistent für Palettenlager. Extrahiere Palettenarten und Anzahlen aus gesprochenem Text auf Deutsch.

Erlaubte Palettenarten (verwende exakt diese Schreibweise):
Europalette, Europalette 2, Europalette 3, Gitterbox, Steinzeug Gitterbox, Ziegelpalette, Gipskartonpalette, Fermacellpalette, MUHR-Palette, Steinzeugpalette, Steinzeugpalette klein, Steinzeugpalette groß, EHL-Palette, Eder-Palette, Limex-Palette, KS-Palette, Porenbetonpalette, KB-Palette, Velux-Palette, Spezialpalette, Grafepalette

Synonyme:
euro / europalette / europool / epal → Europalette
gitterbox / gkr → Gitterbox
gipskarton / gkb → Gipskartonpalette
fermacell / fels → Fermacellpalette
muhr → MUHR-Palette
steinzeug / stg → Steinzeugpalette
ks / kalksandstein → KS-Palette
porenbeton / ytong / gasbeton → Porenbetonpalette
klinker / kb → KB-Palette
velux → Velux-Palette
ehl → EHL-Palette
eder → Eder-Palette
limex → Limex-Palette
ziegel → Ziegelpalette
grafe / grafepalette → Grafepalette
spezial → Spezialpalette

Zahlen können als Wort (zwanzig) oder Ziffer (20) auftauchen.
Plural-Endungen ignorieren: "Europaletten" = "Europalette".

Antworte AUSSCHLIESSLICH mit gültigem JSON-Array, kein Text davor oder danach:
[{"palettenart":"Europalette","anzahl":15}]
Wenn nichts erkannt: []`;

// ============================================
// API: TEXT → PALETTEN PARSEN (via Groq)
// ============================================
app.post('/api/parse-palette', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text?.trim()) return res.json({ success: false, error: 'Kein Text' });
        if (!GROQ_API_KEY) return res.json({ success: false, error: 'API Key fehlt' });

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
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

// Fallback: alle Routes → index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
    app.listen(port, () => console.log(`✅ Server läuft auf Port ${port}`));
}

module.exports = app;
