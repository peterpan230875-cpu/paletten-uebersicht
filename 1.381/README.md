# Paletten Übersicht

🎤 Sprachgesteuerte Palettenverwaltungs-App mit Echtzeit-Tracking und dreistufiger Kundenübersicht.

## ✨ Features

- 🎤 **Sprachaufnahme** - Paletten-Transaktion per Sprachbefehl erfassen
- 📊 **Dreistufige Kundenübersicht** - Übersicht → Details → Transaktionshistorie
- 👥 **Mitarbeiter-Authentifizierung** - Login mit Passwort und Passwort-Setup
- 📈 **Transaktionshistorie** - Alle Palettenbewegungen mit Zeitstempel und Mitarbeitername
- 🔐 **Supabase-Integration** - Sichere Cloud-Datenbank (PostgreSQL)
- 🎯 **Intelligente Kundenerkennung** - Fuzzy-Matching für ähnliche Kundennamen

## 🛠️ Technologie

- **Frontend:** HTML5, CSS3, JavaScript (Single-Page-App)
- **Backend:** Express.js (Node.js)
- **Datenbank:** Supabase (PostgreSQL)
- **APIs:** 
  - Groq API für Speech-to-Text Transkription
  - Web Audio API für Sprachaufnahme

## 📥 Installation (lokal)

### Voraussetzungen
- Node.js 16 oder höher
- Supabase Account mit DB-Zugriff
- Groq API Key

### Setup

1. **Repository klonen**
```bash
git clone https://github.com/YOUR-USERNAME/paletten-uebersicht.git
cd paletten-uebersicht
```

2. **Dependencies installieren**
```bash
npm install
```

3. **.env Datei erstellen**
```bash
cp .env.example .env
```
Dann `.env` mit echten Credentials füllen:
```
SUPABASE_URL=your_actual_supabase_url
SUPABASE_ANON_KEY=your_actual_supabase_key
GROQ_API_KEY=your_actual_groq_key
```

4. **Server starten**
```bash
npm start
```

5. **Im Browser öffnen**
```
http://localhost:3000
```

## 📦 Projektstruktur

```
paletten-uebersicht/
├── server.js                 # Express Backend mit API Endpoints
├── public/
│   └── index.html           # Frontend Single-Page-App
├── package.json             # Dependencies & Scripts
├── package-lock.json        # Locked Versions
├── .env.example             # Template für Env-Variablen
├── .gitignore               # Git-Ignore Konfiguration
├── vercel.json              # Vercel Deployment Config
├── README.md                # Diese Datei
└── DEPLOYMENT.md            # Deployment Anleitung
```

## 🚀 Deployment auf Vercel

Siehe [DEPLOYMENT.md](./DEPLOYMENT.md) für detaillierte Anleitung.

**Quick Start:**
1. GitHub Repository verbinden
2. Environment Variables auf Vercel setzen
3. Deploy triggern
4. Live-URL testen

## 🔄 Workflow für lokale Entwicklung

### Änderungen machen & testen
```bash
# Änderungen speichern
# Server neustart (wenn nötig)

# Teste lokal auf http://localhost:3000
```

### Zu GitHub pushen
```bash
git add .
git commit -m "Beschreibung der Änderungen"
git push origin main
```

### Vercel deployt automatisch
- Jeder Push zum `main` Branch triggert automatischen Deploy
- Status sichtbar im Vercel Dashboard
- Nach ~2-3 Minuten online

## 📝 API Endpoints (Backend)

### Authentifizierung
- `POST /api/login-mitarbeiter` - Mitarbeiter-Login
- `POST /api/set-password` - Passwort setzen/ändern

### Palettendaten
- `POST /api/save` - Neue Transaktion speichern
- `GET /api/get-all-saldos` - Alle Kundenbestände
- `GET /api/customer-detail/:kundenname` - Details eines Kunden
- `GET /api/palette-history/:kundenname/:palettenart` - Transaktionshistorie
- `POST /api/update-saldo` - Saldo manuell anpassen

### Hilfsfunktionen
- `GET /api/get-all-customers` - Alle Kundennamen
- `POST /api/find-similar-customers` - Fuzzy-Search für Kunden
- `GET /api/health-check` - Supabase Verbindungsstatus

## 🔐 Sicherheit

### ⚠️ Wichtig: Secrets nicht committen!
- `.env` datei wird automatisch von `.gitignore` ausgeschlossen
- Verwende IMMER `.env.example` als Template
- API Keys sollten NIE in Quellcode stehen

### Environment Variables verwenden
```javascript
// ✅ RICHTIG
const SUPABASE_URL = process.env.SUPABASE_URL;

// ❌ FALSCH
const SUPABASE_URL = "https://...supabase.co";
```

## 🧪 Testen

### Lokales Testing
1. Login mit Mitarbeiter-Account (z.B. Sven)
2. Sprichbefehl testen: "Jens Meier hat eine Europalette mitgenommen"
3. Überprüfe: Kunde und Saldo in Übersicht
4. Klick Übersicht → Kundenliste → Kundendetails → Transaktionshistorie

### Production Testing (nach Vercel Deploy)
1. Live-URL im Browser öffnen
2. Alle obigen Tests wiederholen
3. Supabase-Datenbank auf neue Daten überprüfen

## 📋 Datenbank-Tabellen

### Paletten (Transaction Log)
- Kundenname, Kundennummer, Palettenart, Menge, Aktion, Zeitstempel, Mitarbeiter

### Kunden_Saldo (Customer Balances)
- Kundenname, Palettenart, Saldo, Kundennummer

### Mitarbeiter (Employee Accounts)
- Name, Passwort (gehashed), ErstelltAm
- Vorkonfiguriert: Marcel, Ralf, Steffen, Sven

## 🐛 Troubleshooting

### "Supabase connection error"
- Überprüfe `.env` Datei auf richtige Credentials
- Teste mit `/api/health-check` Endpoint

### "Groq API error"
- Überprüfe GROQ_API_KEY in `.env`
- Verifiziere API Key ist nicht abgelaufen

### Sprachaufnahme funktioniert nicht
- Browser-Berechtigung für Mikrofon überprüfen
- HTTPS erforderlich auf Production (Vercel nutzt HTTPS)
- Chrome/Firefox/Safari werden unterstützt

## 📞 Support

Bei Fragen oder Problemen:
1. Überprüfe `.env` Datei
2. Schaue Server-Logs: `npm start`
3. Öffne Browser-DevTools (F12) → Console auf Fehler prüfen

## 📄 Lizenz

Privat - Nicht für öffentliche Nutzung

---

**Version:** 1.37  
**Letzte Aktualisierung:** April 2026
