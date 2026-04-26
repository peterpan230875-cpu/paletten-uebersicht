const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
const app = express();

// ============================================
// KONFIGURATION - Environment Variables
// ============================================
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const TABLE_NAME = "Paletten";
const PORT = process.env.PORT || 3000;

// ============================================
// SETUP
// ============================================
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

app.use(express.json());
app.use(express.raw({ type: 'audio/*', limit: '10mb' }));
app.use(express.raw({ type: 'application/octet-stream', limit: '10mb' }));

// ============================================
// STARTUP: MITARBEITER INITIALISIEREN
// ============================================
async function initializeMitarbeiter() {
    try {
        console.log('🔄 Initialisiere Mitarbeiter-Tabelle...');

        // Versuche die Mitarbeiter-Tabelle zu erstellen (falls nicht vorhanden)
        const mitarbeiter = ['Marcel', 'Ralf', 'Steffen', 'Sven'];

        for (let name of mitarbeiter) {
            const { data: existing } = await supabase
                .from('Mitarbeiter')
                .select('id')
                .eq('Name', name)
                .limit(1);

            if (!existing || existing.length === 0) {
                // Mitarbeiter existiert nicht, erstelle ihn mit leeren Passwort (muss noch gesetzt werden)
                const { error } = await supabase
                    .from('Mitarbeiter')
                    .insert([{
                        Name: name,
                        Passwort: null,  // Kein Passwort bis zur ersten Verwendung
                        ErstelltAm: new Date().toISOString()
                    }]);

                if (error) {
                    console.log(`⚠️ Mitarbeiter ${name} konnte nicht erstellt werden (existiert wahrscheinlich schon): ${error.message}`);
                } else {
                    console.log(`✅ Mitarbeiter ${name} erstellt`);
                }
            } else {
                console.log(`ℹ️ Mitarbeiter ${name} existiert bereits`);
            }
        }
    } catch (err) {
        console.error('❌ Fehler beim Initialisieren der Mitarbeiter:', err.message);
    }
}

// Starte Mitarbeiter-Initialisierung
setTimeout(() => {
    initializeMitarbeiter();
}, 1000);

// ============================================
// HILFSFUNKTION: DEUTSCHE ZEIT (MESZ/MEZ)
// ============================================
function getGermanTimestamp() {
    const now = new Date();

    // Formatiere die Zeit in der Zeitzone 'Europe/Berlin' (MESZ/MEZ)
    const formatter = new Intl.DateTimeFormat('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Europe/Berlin'
    });

    const formatted = formatter.format(now);
    // Konvertiere Format "DD.MM.YYYY, HH:mm:ss" zu ISO-ähnliches "YYYY-MM-DDTHH:mm:ss"
    const [datePart, timePart] = formatted.split(', ');
    const [day, month, year] = datePart.split('.');

    return `${year}-${month}-${day}T${timePart}`;
}

// ============================================
// HILFSFUNKTION: ÄHNLICHE KUNDENNAMEN FINDEN
// ============================================
function berechneAhnlichkeit(str1, str2) {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    // 1. EXAKTE TREFFER
    if (s1 === s2) return 100;

    // 2. ENTFERNE BINDESTRICHE UND LEERZEICHEN
    const s1Clean = s1.replace(/[\s\-]/g, '');
    const s2Clean = s2.replace(/[\s\-]/g, '');

    if (s1Clean === s2Clean) return 95;

    // 3. SUBSTRING-MATCH: Wenn ein Name vollständig im anderen enthalten ist
    if (s1.includes(s2) || s2.includes(s1)) {
        return 90;
    }

    // 4. WORT-BASIERTE ÄHNLICHKEIT
    const woerter1 = s1.split(/[\s\-]+/).filter(w => w.length > 0);
    const woerter2 = s2.split(/[\s\-]+/).filter(w => w.length > 0);

    // Zähle gemeinsame Wörter
    const gemeinsameListe = [];
    for (let w1 of woerter1) {
        if (woerter2.includes(w1) && w1.length >= 3) {
            gemeinsameListe.push(w1);
        }
    }

    // Wenn Wörter gemeinsam sind
    if (gemeinsameListe.length > 0) {
        return 85;  // Starker Match für gemeinsame Wörter
    }

    // 5. LEVENSHTEIN-DISTANZ
    let matches = 0;
    for (let char of s1Clean) {
        if (s2Clean.includes(char)) matches++;
    }
    const ahnlichkeit = (matches / Math.max(s1Clean.length, s2Clean.length)) * 100;

    return ahnlichkeit;
}

// ============================================
// API: ALLE KUNDENNAMEN ABRUFEN
// ============================================
app.get('/api/get-all-customers', async (req, res) => {
    try {
        const { data: kunden, error } = await supabase
            .from('Kunden_Saldo')
            .select('Kundenname')
            .not('Kundenname', 'is', null);

        if (error) {
            return res.json([]);
        }

        // Extrahiere unique Namen
        const uniqueNames = [...new Set(kunden.map(k => k.Kundenname))];
        res.json(uniqueNames);

    } catch (err) {
        res.json([]);
    }
});

// ============================================
// API: ÄHNLICHE KUNDENNAMEN SUCHEN
// ============================================
app.post('/api/find-similar-customers', async (req, res) => {
    try {
        const { kundenname } = req.body;
        console.log(`🔎 find-similar-customers: kundenname="${kundenname}"`);

        if (!kundenname) {
            return res.json({ found: false, candidates: [] });
        }

        // Hole alle Kundennamen aus Kunden_Saldo
        const { data: kunden, error } = await supabase
            .from('Kunden_Saldo')
            .select('Kundenname')
            .not('Kundenname', 'is', null);

        if (error) {
            console.error('DB-Fehler:', error);
            return res.json({ found: false, candidates: [] });
        }

        console.log(`📊 Gefundene Kundennamen in DB: ${kunden.length}`);
        const uniqueNames = [...new Set(kunden.map(k => k.Kundenname))];
        console.log(`📋 Unique Namen: ${uniqueNames}`);

        // Finde ähnliche Namen
        const candidates = [];

        for (let existingName of uniqueNames) {
            console.log(`📌 Prüfe: "${kundenname}" gegen "${existingName}"`);
            const ahnlichkeit = berechneAhnlichkeit(kundenname, existingName);

            // Schwellenwert: 75% Ähnlichkeit (nur starke Matches, um falsche Korektionen zu vermeiden)
            if (ahnlichkeit >= 75 && ahnlichkeit < 100) {
                console.log(`✅ Match gefunden: ${ahnlichkeit}%`);
                candidates.push({
                    name: existingName,
                    similarity: Math.round(ahnlichkeit)
                });
            }
        }

        console.log(`🎯 Gesamte Kandidaten: ${candidates.length}`);

        // Sortiere nach Ähnlichkeit
        candidates.sort((a, b) => b.similarity - a.similarity);

        res.json({
            found: candidates.length > 0,
            candidates: candidates.slice(0, 5)  // Maximal 5 Vorschläge
        });

    } catch (err) {
        console.error('❌ Fehler in find-similar-customers:', err);
        res.json({ found: false, candidates: [] });
    }
});

// ============================================
// API: DATEN SPEICHERN (mit Saldo-Tracking)
// ============================================
app.post('/api/save', async (req, res) => {
    try {
        const { text_content, kundenname, kundennummer, palettenart, menge, aktion, mitarbeiter } = req.body;

        console.log('📥 Speichern-Anfrage:', { kundenname, kundennummer, palettenart, menge, aktion, mitarbeiter });

        if (!text_content) return res.status(400).json({ error: 'Text erforderlich' });
        if (!kundenname && !kundennummer) return res.status(400).json({ error: 'Kundenname oder Kundennummer erforderlich' });
        if (!palettenart) return res.status(400).json({ error: 'Palettenart erforderlich' });
        if (!menge || isNaN(menge)) return res.status(400).json({ error: 'Menge muss eine Zahl sein' });

        // 🎯 ERSTELLE ZEITSTEMPEL GANZ AM ANFANG (damit überall die gleiche Zeit verwendet wird)
        const zeitstempel = getGermanTimestamp();

        const mengeInt = parseInt(menge);
        const trimmedKundenname = kundenname && kundenname.trim() !== '' ? kundenname.trim() : null;
        let trimmedKundennummer = kundennummer && kundennummer.trim() !== '' ? kundennummer.trim() : null;

        // DEFENSIVE: Kundennummer darf NIEMALS gleich Kundenname sein (Groq-API-Fehler)
        if (trimmedKundennummer && trimmedKundennummer.toLowerCase() === trimmedKundenname?.toLowerCase()) {
            console.warn(`⚠️ BLOCKED: Kundennummer="${trimmedKundennummer}" = Kundenname → setze NULL`);
            trimmedKundennummer = null;
        }

        // Zusätzliche Sicherheit: Nur akzeptiere Kundennummer wenn sie NICHT nur Buchstaben sind
        // (echte Kundennummern sind meist alphanumerisch mit Zahlen)
        if (trimmedKundennummer && /^[a-zA-Z\s]+$/.test(trimmedKundennummer)) {
            console.warn(`⚠️ BLOCKED: Kundennummer="${trimmedKundennummer}" ist reine Text → setze NULL`);
            trimmedKundennummer = null;
        }

        // 🎯 SMART LOOKUP: Nutze berechneAhnlichkeit direkt
        let finalKundenname = trimmedKundenname;

        if (trimmedKundenname) {
            try {
                // Hole ALLE eindeutigen Kundennamen aus der Datenbank
                const { data: allCustomers } = await supabase
                    .from('Kunden_Saldo')
                    .select('Kundenname')
                    .not('Kundenname', 'is', null);

                if (allCustomers && allCustomers.length > 0) {
                    const uniqueNames = [...new Set(allCustomers.map(k => k.Kundenname))];

                    // Suche besten Match (auch Ähnlichkeitsmatches)
                    let bestMatch = null;
                    let bestScore = 0;

                    for (let existingName of uniqueNames) {
                        const score = berechneAhnlichkeit(trimmedKundenname, existingName);

                        // Exakte Matches: 100% (ignorieren, da wir nur ähnliche suchen)
                        // Ähnliche Matches: >= 60%
                        if (score >= 75 && score < 100 && score > bestScore) {
                            bestScore = score;
                            bestMatch = existingName;
                        }
                    }

                    if (bestMatch) {
                        console.log(`✅ KUNDE KORRIGIERT: "${trimmedKundenname}" → "${bestMatch}" (${Math.round(bestScore)}%)`);
                        finalKundenname = bestMatch;
                    }
                }
            } catch (err) {
                console.error(`❌ Fehler bei Kundenlookup:`, err.message);
                // Fehler? Verwende Original-Namen
            }
        }

        // Hole aktuellen Saldo (limit() statt single() um kein Error zu werfen)
        const { data: saldoRecordsForLookup } = await supabase
            .from('Kunden_Saldo')
            .select('Saldo, Kundennummer')
            .eq('Kundenname', finalKundenname)
            .eq('Palettenart', palettenart)
            .limit(1);

        const existingRecord = saldoRecordsForLookup && saldoRecordsForLookup.length > 0 ? saldoRecordsForLookup[0] : null;
        const currentSaldo = existingRecord?.Saldo || 0;
        console.log(`📊 Aktueller Saldo für "${finalKundenname}" (original: "${trimmedKundenname}"): ${currentSaldo}`);

        const aktionLower = aktion ? aktion.trim().toLowerCase() : '';
        console.log(`🎯 Aktion raw="${aktion}" lower="${aktionLower}" bytes=${JSON.stringify(aktionLower)}`);
        console.log(`  Test includes: zurück=${aktionLower.includes('zurück')} zuruck=${aktionLower.includes('zuruck')} erhalten=${aktionLower.includes('erhalten')}`);

        // Aktion kann sein: "mitgenommen" (Saldo +), "erhalten/zurück/zurückgebracht" (Saldo -)
        let isMitgenommen = aktionLower.includes('mitgenommen');

        // 🎯 VERBESSERTE ERKENNUNG: Alle Varianten für "Zurück" (mit/ohne Umlaut)
        let isErhalten = aktionLower.includes('erhalten') ||
                          aktionLower.includes('zurück') ||
                          aktionLower.includes('zuruck') ||  // Ohne Umlaut
                          aktionLower.includes('zurückgebracht') ||
                          aktionLower.includes('zuruckgebracht') ||
                          aktionLower.includes('gebracht zurück') ||
                          aktionLower.includes('gebracht zuruck') ||
                          aktionLower.includes('bringt zurück') ||
                          aktionLower.includes('bringt zuruck') ||
                          aktionLower.includes('brachte zurück') ||
                          aktionLower.includes('brachte zuruck') ||
                          aktionLower.includes('zurückbringen') ||
                          aktionLower.includes('zuruckbringen') ||
                          aktionLower.includes('abgegeben');

        // 🎯 FALLBACK: Wenn Aktion leer/null ist, versuche aus dem Text zu erraten
        const actionIsEmpty = !aktion || (typeof aktion === 'string' && aktion.trim() === '');
        if (actionIsEmpty) {
            console.warn(`⚠️ ACHTUNG: Aktion ist LEER (aktion="${aktion}", typeof=${typeof aktion})! Versuche aus text_content zu erraten...`);

            const textLower = text_content.toLowerCase();
            const worterZuruck = ['zurück', 'bringt zurück', 'gebracht zurück', 'erhalten', 'abgegeben', 'zurückgebracht'];
            const worterMitgenommen = ['mitgenommen', 'nimmt', 'hat'];

            const hatZuruck = worterZuruck.some(w => textLower.includes(w));
            const hatMitgenommen = worterMitgenommen.some(w => textLower.includes(w));

            if (hatZuruck && !hatMitgenommen) {
                isErhalten = true;
                isMitgenommen = false;
                console.log(`🔍 Erraten: ERHALTEN (Text enthält: ${worterZuruck.find(w => textLower.includes(w))})`);
            } else if (hatMitgenommen && !hatZuruck) {
                isMitgenommen = true;
                isErhalten = false;
                console.log(`🔍 Erraten: MITGENOMMEN (Text enthält: ${worterMitgenommen.find(w => textLower.includes(w))})`);
            } else {
                console.warn(`⚠️ WARNUNG: Kann Aktion nicht erraten! Nehme DEFAULT: mitgenommen`);
                isMitgenommen = true;
                isErhalten = false;
            }
        }

        console.log(`📌 isMitgenommen: ${isMitgenommen}, isErhalten: ${isErhalten}`);

        // Validierung: Nicht mehr zurückgeben (erhalten) als vorhanden
        if (isErhalten && mengeInt > currentSaldo) {
            console.warn(`⚠️ BLOCKED: Zu viel erhalten! ${mengeInt} > ${currentSaldo}`);
            return res.status(400).json({
                error: `Der Kunde hat keine ausreichend Paletten zum Zurückgeben. Verfügbar: ${currentSaldo}, Angefordert: ${mengeInt}`
            });
        }

        // Berechne neuen Saldo
        let newSaldo = currentSaldo;
        if (isMitgenommen) {
            console.log(`➕ MITGENOMMEN: ${currentSaldo} + ${mengeInt} = ${currentSaldo + mengeInt}`);
            newSaldo = currentSaldo + mengeInt;
        } else if (isErhalten) {
            console.log(`➖ ERHALTEN/ZURÜCK: ${currentSaldo} - ${mengeInt} = ${currentSaldo - mengeInt}`);
            newSaldo = currentSaldo - mengeInt;
        } else {
            console.log(`⚠️ AKTION NICHT ERKANNT: "${aktion}" - Saldo bleibt: ${currentSaldo}`);
        }

        // 1. Speichere in Paletten-Tabelle
        const { error: palettenError } = await supabase
            .from(TABLE_NAME)
            .insert([{
                "Kundenname": trimmedKundenname,
                "Kundennummer": trimmedKundennummer,
                "Palettenart": palettenart,
                "Menge": mengeInt,
                "Aktion": aktion && aktion.trim() !== '' ? aktion : null,
                "Zeitstempel": zeitstempel,
                "Mitarbeiter": mitarbeiter || null
            }]);

        if (palettenError) {
            console.error('❌ Paletten-Fehler:', palettenError);
            return res.status(500).json({ error: palettenError.message });
        }

        // 2. UPDATE oder INSERT Saldo
        if (existingRecord) {
            // Datensatz existiert → UPDATE
            console.log('🔄 UPDATE Saldo');
            // Wenn neue Kundennummer: auch die aktualisieren
            const updateData = { "Saldo": newSaldo };
            if (trimmedKundennummer && !existingRecord.Kundennummer) {
                updateData.Kundennummer = trimmedKundennummer;
            }

            const { error: saldoError } = await supabase
                .from('Kunden_Saldo')
                .update(updateData)
                .eq('Kundenname', finalKundenname)
                .eq('Palettenart', palettenart);

            if (saldoError) {
                console.error('❌ Update-Fehler:', saldoError);
                return res.status(500).json({ error: saldoError.message });
            }
        } else {
            // Datensatz existiert nicht → INSERT
            console.log('➕ INSERT Saldo');
            const { error: saldoError } = await supabase
                .from('Kunden_Saldo')
                .insert([{
                    "Kundenname": finalKundenname,
                    "Palettenart": palettenart,
                    "Kundennummer": trimmedKundennummer,
                    "Saldo": newSaldo
                }]);

            if (saldoError) {
                console.error('❌ Insert-Fehler:', saldoError);
                return res.status(500).json({ error: saldoError.message });
            }
        }

        console.log(`✅ Gespeichert: Saldo ${currentSaldo} → ${newSaldo}`);
        console.log(`⏰ Zeitstempel: ${zeitstempel}`);
        console.log(`📋 finalKundenname: "${finalKundenname}", original: "${trimmedKundenname}"`);
        res.json({
            success: true,
            message: 'Daten erfolgreich gespeichert!',
            data: {
                kundenname: finalKundenname,
                kundennameCorrected: finalKundenname !== trimmedKundenname,
                originalName: trimmedKundenname,
                kundennummer: trimmedKundennummer,
                palettenart,
                menge: mengeInt,
                aktion,
                aktionLower_debug: aktionLower,
                actionRecognition_debug: { isMitgenommen, isErhalten },
                currentSaldo,
                neuerSaldo: newSaldo,
                zeitstempel: zeitstempel
            }
        });

    } catch (err) {
        console.error('❌ Fehler:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// TEST: Smart-Lookup Debug
// ============================================
app.get('/api/test-smart-lookup', async (req, res) => {
    const testName = req.query.name || 'Meier';
    console.log(`🧪 Test Smart-Lookup für: "${testName}"`);

    try {
        const { data: allCustomers } = await supabase
            .from('Kunden_Saldo')
            .select('Kundenname')
            .not('Kundenname', 'is', null);

        if (allCustomers && allCustomers.length > 0) {
            const uniqueNames = [...new Set(allCustomers.map(k => k.Kundenname))];

            let bestMatch = null;
            let bestScore = 0;
            const results = [];

            for (let existingName of uniqueNames) {
                const score = berechneAhnlichkeit(testName, existingName);
                results.push({ name: existingName, score: Math.round(score) });

                if (score >= 60 && score < 100 && score > bestScore) {
                    bestScore = score;
                    bestMatch = existingName;
                }
            }

            res.json({
                testName,
                bestMatch,
                bestScore: Math.round(bestScore),
                topMatches: results.sort((a,b) => b.score - a.score).slice(0, 5)
            });
        }
    } catch (err) {
        res.json({ error: err.message });
    }
});

// ============================================
// DEBUG: SALDO ANZEIGEN
// ============================================
app.get('/api/debug-saldo', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Kunden_Saldo')
            .select('*');

        if (error) {
            return res.json({ error: error.message });
        }

        res.json({ data });
    } catch (err) {
        res.json({ error: err.message });
    }
});

// ============================================
// API: ALLE KUNDEN MIT DETAILLIERTEM SALDO
// ============================================
app.get('/api/get-all-saldos', async (req, res) => {
    try {
        const { data: saldoData, error } = await supabase
            .from('Kunden_Saldo')
            .select('Kundenname, Saldo, Palettenart');

        if (error) {
            return res.json({ error: error.message });
        }

        // 🔥 FILTER: Nur Palettentypen mit Saldo > 0
        const filteredData = saldoData.filter(record => {
            const saldo = typeof record.Saldo === 'string' ? parseInt(record.Saldo) : record.Saldo;
            return !isNaN(saldo) && saldo > 0;
        });

        // Strukturiere: Kunden -> Palettenarten -> Saldo
        const kundenMap = {};

        for (let record of filteredData) {
            const kundenname = record.Kundenname;
            const palettenart = record.Palettenart;
            const saldo = parseInt(record.Saldo);

            if (!kundenMap[kundenname]) {
                kundenMap[kundenname] = [];
            }

            kundenMap[kundenname].push({
                palettenart,
                saldo
            });
        }

        // Konvertiere zu Array, filtere leere Kunden, und sortiere alphabetisch
        const kunden = Object.entries(kundenMap)
            .map(([name, paletten]) => ({
                name,
                paletten: paletten.sort((a, b) => a.palettenart.localeCompare(b.palettenart))
            }))
            .filter(k => k.paletten && k.paletten.length > 0)  // 🔥 REMOVE EMPTY CUSTOMERS
            .sort((a, b) => a.name.localeCompare(b.name));

        res.json(kunden);
    } catch (err) {
        console.error('❌ Fehler in get-all-saldos:', err);
        res.json({ error: err.message });
    }
});

// ============================================
// API: KUNDENDETAILS (ALLE PALETTEN EINES KUNDEN)
// ============================================
app.get('/api/customer-detail/:kundenname', async (req, res) => {
    try {
        const kundenname = req.params.kundenname;

        // Abrufen aller Palettenarten für diesen Kunden
        const { data: saldoData, error } = await supabase
            .from('Kunden_Saldo')
            .select('Palettenart, Saldo')
            .eq('Kundenname', kundenname)
            .gt('Saldo', 0);  // Nur Paletten mit Saldo > 0

        if (error) {
            return res.json({ error: error.message });
        }

        // Gesamtsaldo berechnen
        const gesamtSaldo = saldoData.reduce((sum, p) => sum + p.Saldo, 0);

        // Sortiere Palettenarten alphabetisch
        const paletten = saldoData
            .map(p => ({
                palettenart: p.Palettenart,
                saldo: p.Saldo
            }))
            .sort((a, b) => a.palettenart.localeCompare(b.palettenart));

        res.json({
            kundenname,
            gesamtSaldo,
            paletten
        });
    } catch (err) {
        console.error('❌ Fehler in customer-detail:', err);
        res.json({ error: err.message });
    }
});

// ============================================
// API: PALETTENHISTORIE (TRANSAKTIONSZEITLEISTE)
// ============================================
app.get('/api/palette-history/:kundenname/:palettenart', async (req, res) => {
    try {
        const kundenname = req.params.kundenname;
        const palettenart = req.params.palettenart;

        // Abrufen aller Transaktionen für diese Kunde + Palettenart
        const { data: transactions, error } = await supabase
            .from('Paletten')
            .select('Zeitstempel, Mitarbeiter, Menge, Aktion')
            .eq('Kundenname', kundenname)
            .eq('Palettenart', palettenart)
            .order('Zeitstempel', { ascending: false });  // Neueste zuerst

        if (error) {
            return res.json({ error: error.message });
        }

        // Formatiere die Antwort
        const history = transactions.map(t => ({
            zeitstempel: t.Zeitstempel,
            mitarbeiter: t.Mitarbeiter || 'Unbekannt',
            menge: t.Menge,
            aktion: t.Aktion
        }));

        res.json({
            kundenname,
            palettenart,
            history
        });
    } catch (err) {
        console.error('❌ Fehler in palette-history:', err);
        res.json({ error: err.message });
    }
});

// ============================================
// API: SALDO MANUELL AKTUALISIEREN (mit Transaktion)
// ============================================
app.post('/api/update-saldo', async (req, res) => {
    try {
        const { kundenname, palettenart, alterSaldo, neuerSaldo, mitarbeiter } = req.body;

        // Validierung: Keine negativen Werte
        if (neuerSaldo < 0) {
            return res.json({
                error: 'Saldo darf nicht negativ sein',
                success: false
            });
        }

        // 🔥 BERECHNE DIFFERENZ UND AKTION
        const differenz = neuerSaldo - alterSaldo;
        const menge = Math.abs(differenz);
        let aktion = 'Manuelle Anpassung';

        if (differenz > 0) {
            aktion = 'mitgenommen';  // Paletten hinzugefügt
        } else if (differenz < 0) {
            aktion = 'zurückgebracht';  // Paletten entfernt
        }

        console.log(`💾 Manuelle Änderung: ${kundenname} - ${palettenart}: ${alterSaldo} → ${neuerSaldo} (${aktion} ${menge})`);

        // 🔥 SCHREIBE TRANSAKTIONSEINTRAG IN PALETTEN TABELLE
        if (differenz !== 0) {
            const zeitstempel = getGermanTimestamp();

            // Baue Insert-Objekt
            const insertData = {
                Kundenname: kundenname,
                Palettenart: palettenart,
                Menge: menge,
                Aktion: aktion,
                Zeitstempel: zeitstempel,
                Mitarbeiter: mitarbeiter || 'System'
            };

            console.log('📝 Erstelle Transaktionseintrag:', JSON.stringify(insertData, null, 2));

            const transactionResult = await supabase
                .from('Paletten')
                .insert([insertData]);

            if (transactionResult.error) {
                console.error('❌ FEHLER beim Insert in Paletten Tabelle:');
                console.error('   Code:', transactionResult.error.code);
                console.error('   Message:', transactionResult.error.message);
                console.error('   Details:', transactionResult.error.details);
                return res.json({
                    error: 'Transaktion konnte nicht gespeichert werden: ' + transactionResult.error.message,
                    success: false,
                    errorDetails: transactionResult.error
                });
            }

            console.log('✅ Transaktionseintrag erfolgreich erstellt in Paletten Tabelle');
        }

        // 🔥 AKTUALISIERE KUNDEN_SALDO TABELLE
        const { data: existingRecord } = await supabase
            .from('Kunden_Saldo')
            .select('*')
            .eq('Kundenname', kundenname)
            .eq('Palettenart', palettenart)
            .limit(1);

        let result;

        if (existingRecord && existingRecord.length > 0) {
            // UPDATE: Existierender Eintrag
            result = await supabase
                .from('Kunden_Saldo')
                .update({ Saldo: neuerSaldo })
                .eq('Kundenname', kundenname)
                .eq('Palettenart', palettenart);
        } else {
            // INSERT: Neuer Eintrag
            result = await supabase
                .from('Kunden_Saldo')
                .insert([{
                    Kundenname: kundenname,
                    Palettenart: palettenart,
                    Saldo: neuerSaldo,
                    Kundennummer: null
                }]);
        }

        if (result.error) {
            return res.json({
                error: result.error.message,
                success: false
            });
        }

        res.json({
            success: true,
            kundenname,
            palettenart,
            alterSaldo,
            neuerSaldo,
            differenz,
            aktion,
            menge
        });
    } catch (err) {
        console.error('❌ Fehler in update-saldo:', err);
        res.json({
            error: err.message,
            success: false
        });
    }
});

// ============================================
// API: LOGIN MIT MITARBEITERNAME
// ============================================
app.post('/api/login-mitarbeiter', async (req, res) => {
    try {
        const { mitarbeitername, passwort } = req.body;

        if (!mitarbeitername || !passwort) {
            return res.json({
                success: false,
                error: 'Benutzername und Passwort erforderlich'
            });
        }

        // Suche Mitarbeiter
        const { data: mitarbeiterData, error } = await supabase
            .from('Mitarbeiter')
            .select('Name, Passwort')
            .eq('Name', mitarbeitername)
            .limit(1);

        if (error) {
            return res.json({
                success: false,
                error: error.message
            });
        }

        if (!mitarbeiterData || mitarbeiterData.length === 0) {
            return res.json({
                success: false,
                error: 'Mitarbeiter nicht gefunden',
                firstTime: true  // Signal: Neuer Mitarbeiter?
            });
        }

        const mitarbeiter = mitarbeiterData[0];

        // Wenn kein Passwort gesetzt: First-Time Setup
        if (!mitarbeiter.Passwort) {
            return res.json({
                success: false,
                error: 'Passwort muss noch gesetzt werden',
                firstTime: true,
                mitarbeitername: mitarbeitername
            });
        }

        // Prüfe Passwort (Simple String-Vergleich für MVP)
        if (mitarbeiter.Passwort !== passwort) {
            return res.json({
                success: false,
                error: 'Passwort falsch'
            });
        }

        // Login erfolgreich
        res.json({
            success: true,
            mitarbeitername: mitarbeitername,
            message: 'Login erfolgreich'
        });
    } catch (err) {
        console.error('❌ Fehler in login-mitarbeiter:', err);
        res.json({
            success: false,
            error: err.message
        });
    }
});

// ============================================
// API: PASSWORT SETZEN (First-Time oder Admin)
// ============================================
app.post('/api/set-password', async (req, res) => {
    try {
        const { mitarbeitername, passwort, adminToken } = req.body;

        if (!mitarbeitername || !passwort) {
            return res.json({
                success: false,
                error: 'Benutzername und Passwort erforderlich'
            });
        }

        if (passwort.length < 4) {
            return res.json({
                success: false,
                error: 'Passwort muss mindestens 4 Zeichen lang sein'
            });
        }

        // Validierung: Nur Admin oder der Benutzer selbst kann Passwort setzen
        // (Simplified: Kein echtes Token-System, nur für MVP)

        // Aktualisiere Passwort
        const { error } = await supabase
            .from('Mitarbeiter')
            .update({ Passwort: passwort })
            .eq('Name', mitarbeitername);

        if (error) {
            return res.json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            message: 'Passwort erfolgreich gesetzt',
            mitarbeitername: mitarbeitername
        });
    } catch (err) {
        console.error('❌ Fehler in set-password:', err);
        res.json({
            success: false,
            error: err.message
        });
    }
});

// ============================================
// API: NEUEN MITARBEITER HINZUFÜGEN (Admin)
// ============================================
app.post('/api/add-employee', async (req, res) => {
    try {
        const { name, adminPassword } = req.body;

        // Simple Admin-Authentifizierung (sollte verbessert werden)
        if (adminPassword !== 'admin1234') {
            return res.json({
                success: false,
                error: 'Ungültiges Admin-Passwort'
            });
        }

        if (!name || name.trim() === '') {
            return res.json({
                success: false,
                error: 'Name erforderlich'
            });
        }

        // Überprüfe ob Mitarbeiter bereits existiert
        const { data: existing } = await supabase
            .from('Mitarbeiter')
            .select('id')
            .eq('Name', name)
            .limit(1);

        if (existing && existing.length > 0) {
            return res.json({
                success: false,
                error: 'Mitarbeiter mit diesem Namen existiert bereits'
            });
        }

        // Erstelle neuen Mitarbeiter
        const { error } = await supabase
            .from('Mitarbeiter')
            .insert([{
                Name: name.trim(),
                Passwort: null,  // Muss beim ersten Login gesetzt werden
                ErstelltAm: new Date().toISOString()
            }]);

        if (error) {
            return res.json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            message: `Mitarbeiter "${name}" erstellt. Er kann sich jetzt anmelden.`,
            name: name
        });
    } catch (err) {
        console.error('❌ Fehler in add-employee:', err);
        res.json({
            success: false,
            error: err.message
        });
    }
});

// ============================================
// API: ALLE MITARBEITER AUFLISTEN (Admin)
// ============================================
app.get('/api/employees', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Mitarbeiter')
            .select('Name, ErstelltAm')
            .order('Name', { ascending: true });

        if (error) {
            return res.json({
                error: error.message
            });
        }

        res.json(data);
    } catch (err) {
        console.error('❌ Fehler in employees:', err);
        res.json({
            error: err.message
        });
    }
});

// ============================================
// TEST ENDPOINTS
// ============================================
app.get('/api/test', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .limit(1);

        if (error) {
            return res.json({
                status: 'error',
                message: error.message
            });
        }

        res.json({
            status: 'ok',
            message: 'Supabase funktioniert! ✅',
            rows: data.length
        });
    } catch (err) {
        res.json({
            status: 'error',
            message: err.message
        });
    }
});

// ============================================
// AUDIO PROCESSING ENDPOINT (Groq Whisper + Llama)
// ============================================
app.post('/api/process-audio', async (req, res) => {
    try {
        const GROQ_API_KEY = process.env.GROQ_API_KEY;

        if (!GROQ_API_KEY) {
            return res.status(500).json({
                error: 'GROQ_API_KEY nicht konfiguriert'
            });
        }

        // Hole Base64 Audio vom Frontend
        const { audio: base64Audio } = req.body;

        if (!base64Audio) {
            return res.status(400).json({
                error: 'Kein Audio empfangen'
            });
        }

        // Decodiere Base64 zu Buffer
        const audioBuffer = Buffer.from(base64Audio, 'base64');
        console.log('📥 Audio empfangen und decodiert:', audioBuffer.length, 'bytes');

        // 🎯 SCHRITT 1: Whisper Transcription
        console.log('🎤 Transkribiere Audio mit Groq Whisper...');

        // Sende Audio direkt zu Groq mit multipart/form-data
        const FormData = require('form-data');
        const formData = new FormData();

        // Append Audio Buffer direkt (nicht als Stream)
        formData.append('file', audioBuffer, 'audio.webm');
        formData.append('model', 'whisper-large-v3');
        formData.append('language', 'de');

        console.log('📤 Sende zu Groq Whisper:', {
            audioSize: audioBuffer.length,
            model: 'whisper-large-v3'
        });

        const whisperRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + GROQ_API_KEY,
                ...formData.getHeaders()
            },
            body: formData
        });

        if (!whisperRes.ok) {
            const errorData = await whisperRes.text();
            console.error('❌ Whisper Fehler Details:');
            console.error('   Status:', whisperRes.status);
            console.error('   Response:', errorData);
            console.error('   Audio Buffer Size:', audioBuffer.length);

            return res.status(whisperRes.status).json({
                error: `Whisper-Fehler: ${whisperRes.status} - ${errorData}`
            });
        }

        const whisperData = await whisperRes.json();
        const rohText = whisperData.text || "";

        if (!rohText) {
            return res.status(400).json({
                error: "Keine Sprache erkannt. Bitte versuche es nochmal."
            });
        }

        console.log('✅ Transkription erfolgreich:', rohText.substring(0, 50) + '...');

        // 🎯 SCHRITT 2: Llama Strukturierung
        console.log('🧹 Strukturiere Text mit Groq Llama...');

        const llmaRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + GROQ_API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{
                    role: "system",
                    content: "Du bist ein Paletten-Tracker. Analysiere den GESPROCHENEN Text und gib EXAKT in diesem Format zurück:\n\nKundenname: Der Name des Kunden\nKundennummer: Die Kundennummer WENN EXPLIZIT genannt - sonst LEER lassen\nAktion: mitgenommen oder erhalten\n\nDann FÜR JEDE Palettenart:\nPalettenart: Art der Palette\nMenge: Die Anzahl als Zahl\n\nTrenne mehrere Palettenarten mit '---' auf einer neuen Zeile!"
                }, {
                    role: "user",
                    content: rohText
                }],
                temperature: 0.3,
                max_tokens: 300
            })
        });

        if (!llmaRes.ok) {
            const errorData = await llmaRes.text();
            console.error('❌ Llama Fehler:', llmaRes.status, errorData);
            return res.status(llmaRes.status).json({
                error: `Llama-Fehler: ${llmaRes.status}`
            });
        }

        const llmaData = await llmaRes.json();

        if (!llmaData.choices || !llmaData.choices[0]) {
            return res.status(400).json({
                error: "Keine Antwort von Llama"
            });
        }

        const structuredText = llmaData.choices[0].message.content;
        console.log('✅ Strukturierung erfolgreich');

        // Sende Ergebnis zurück an Frontend
        res.json({
            success: true,
            text: structuredText,
            rawText: rohText
        });

    } catch (err) {
        console.error('❌ Audio-Processing Fehler:', err.message);
        res.status(500).json({
            error: err.message
        });
    }
});

// ============================================
// MAIN ROUTE
// ============================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ============================================
// STATISCHE DATEIEN (nach allen API-Routen!)
// ============================================
app.use(express.static(path.join(__dirname)));

// ============================================
// SERVER START
// ============================================
app.listen(PORT, () => {
    console.log(`\n🚀 SERVER LÄUFT`);
    console.log(`📝 URL: http://localhost:${PORT}`);
    console.log(`📱 Öffne im Browser: http://localhost:${PORT}/Paletten_V1.36.html\n`);
});
