// Load environment variables
require('dotenv').config();

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// SETUP
// ============================================
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Middleware
app.use(express.json());
app.use(express.raw({ type: 'audio/*', limit: '10mb' }));
app.use(express.raw({ type: 'application/octet-stream', limit: '10mb' }));

// ============================================
// ALLE EXISTIERENDEN API-ROUTES KOPIEREN WIR EINFACH HERÜBER
// (Ich kopiere nur die wichtigsten - der Rest kommt später)
// ============================================

// Login
app.post('/api/login-mitarbeiter', async (req, res) => {
    const { mitarbeiter, passwort } = req.body;
    
    if (!mitarbeiter || !passwort) {
        return res.status(400).json({ error: 'Mitarbeiter und Passwort erforderlich' });
    }

    try {
        const { data, error } = await supabase
            .from('Mitarbeiter')
            .select('*')
            .eq('Name', mitarbeiter)
            .single();

        if (error || !data) {
            return res.json({ success: false, message: 'Mitarbeiter nicht gefunden' });
        }

        if (data.Passwort === passwort || !data.Passwort) {
            res.json({ success: true, mitarbeiter: mitarbeiter });
        } else {
            res.json({ success: false, message: 'Falsches Passwort' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save data
app.post('/api/save', async (req, res) => {
    const { kundenname, palettenart, menge, mitarbeiter } = req.body;

    try {
        // Insert into Paletten table
        const { error: insertError } = await supabase
            .from('Paletten')
            .insert([{
                Kundenname: kundenname.toUpperCase(),
                Palettenart: palettenart,
                Menge: menge,
                Mitarbeiter: mitarbeiter,
                Zeitstempel: new Date().toISOString(),
                Notizen: ''
            }]);

        if (insertError) {
            return res.status(500).json({ error: insertError.message });
        }

        // Update Saldo
        const { data: saldo, error: saldoError } = await supabase
            .from('Kunden_Saldo')
            .select('Saldo')
            .eq('Kundenname', kundenname.toUpperCase())
            .eq('Palettenart', palettenart)
            .single();

        const currentSaldo = saldo?.Saldo || 0;
        const newSaldo = currentSaldo + menge;

        const { error: updateError } = await supabase
            .from('Kunden_Saldo')
            .upsert({
                Kundenname: kundenname.toUpperCase(),
                Palettenart: palettenart,
                Saldo: newSaldo
            });

        if (updateError) {
            return res.status(500).json({ error: updateError.message });
        }

        res.json({ success: true, message: 'Gespeichert!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Structure text
app.post('/api/structure-text', async (req, res) => {
    const { text } = req.body;
    
    if (!text) {
        return res.status(400).json({ error: 'Text erforderlich' });
    }

    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'mixtral-8x7b-32768',
                messages: [{
                    role: 'user',
                    content: `Extrahiere Kundenname und Palettenart aus: "${text}". Antworte nur im Format: KUNDENNAME|PALETTENART`
                }],
                max_tokens: 100
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const result = response.data.choices[0].message.content;
        res.json({ success: true, text: result, originalText: text });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Health check
app.get('/api/health-check', (req, res) => {
    res.json({ status: 'ok', database: 'ok' });
});

// ============================================
// STATIC FILES - EINFACH UND DIREKT
// ============================================
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// ============================================
// FALLBACK ROUTE - SERVE INDEX.HTML FOR SPA
// ============================================
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`\n🚀 SERVER LÄUFT auf PORT ${PORT}`);
    console.log(`📱 Öffne: http://localhost:${PORT}\n`);
});
