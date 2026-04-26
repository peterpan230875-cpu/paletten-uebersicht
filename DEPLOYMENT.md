# 🚀 Deployment Anleitung - GitHub & Vercel

Schritt-für-Schritt Anleitung zum Deployen der Paletten-App auf GitHub und Vercel.

---

## 📋 Voraussetzungen

Bevor du startest, benötigst du:
- [ ] GitHub Account (https://github.com)
- [ ] Git installiert auf deinem PC
- [ ] Vercel Account (https://vercel.com - kostenlos)
- [ ] Supabase URL und API Key (aus deinem Projekt)
- [ ] Groq API Key (von Groq.com)

---

## 🔧 PART A: Lokale Vorbereitung

### Schritt A1: .env Datei erstellen

1. **Im Projektordner** `F:\Paletten` eine Datei `.env` erstellen
2. **Inhalt (mit echten Werten füllen):**

```
SUPABASE_URL=https://hrkwjlrqydgtcsflpwcx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3dqbHJxeWRndGNzZmxwd2N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NDY2OTEsImV4cCI6MjA5MjUyMjY5MX0._ZmdJa_r9CJNVBxS2FDOk-l7w3a8GkrmNIT_pr57CCU
GROQ_API_KEY=your_actual_groq_api_key_here
PORT=3000
NODE_ENV=development
```

3. **WICHTIG:** Speichern und diese Werte **GEHEIM halten** (nicht posten, nicht committen!)

### Schritt A2: Lokal testen

```bash
# Im Projektordner öffnen
cd F:\Paletten

# Dependencies installieren (falls noch nicht geschehen)
npm install

# Server starten
npm start

# Im Browser testen
http://localhost:3000
```

---

## 📤 PART B: GitHub Setup

### Schritt B1: Git konfigurieren (nur 1x!)

```bash
# Git starten und Konfiguration
git config --global user.name "Dein Name"
git config --global user.email "deine-email@gmail.com"
```

### Schritt B2: Git Repository initialisieren

```bash
cd F:\Paletten

# Lokales Git Repository starten
git init

# Alle Dateien hinzufügen (außer .env und node_modules - werden von .gitignore ausgeschlossen)
git add .

# Ersten Commit erstellen
git commit -m "Initial commit: Paletten Übersicht V1.37"
```

### Schritt B3: GitHub Repository erstellen

1. Gehe zu: https://github.com/new
2. **Repository Name:** `paletten-uebersicht`
3. **Beschreibung:** `Sprachgesteuerte Palettenverwaltungs-App`
4. **Public** auswählen (für Vercel Deployment)
5. **NICHT** "Initialize this repository" ankreuzen
6. Klick: **"Create repository"**

### Schritt B4: Code zu GitHub pushen

```bash
# Remote URL hinzufügen (ersetze YOUR-USERNAME!)
git remote add origin https://github.com/YOUR-USERNAME/paletten-uebersicht.git

# Main branch setzen
git branch -M main

# Zum GitHub pushen
git push -u origin main
```

**Wenn es fragt, ob du dich anmelden möchtest:**
- Wähle: "Authenticate with GitHub"
- Folge den Anweisungen
- Erlauben, dass Git auf dein GitHub zugreift

### Schritt B5: Auf GitHub verifizieren

1. Gehe zu: https://github.com/YOUR-USERNAME/paletten-uebersicht
2. Du solltest sehen:
   - ✅ Alle Dateien sind da (server.js, public/index.html, etc.)
   - ✅ `.env` Datei ist NICHT da (ist in .gitignore)
   - ✅ `node_modules` Ordner ist NICHT da
   - ✅ Nur saubere Source-Dateien sind sichtbar

---

## 🚀 PART C: Vercel Deployment

### Schritt C1: Vercel Account erstellen

1. Gehe zu: https://vercel.com
2. Klick: **"Sign Up"**
3. Wähle: **"Continue with GitHub"**
4. Gib GitHub Zugriff frei
5. Gib deine Email an und fertig!

### Schritt C2: Projekt zu Vercel hinzufügen

1. Gehe zu: https://vercel.com/dashboard
2. Klick: **"Add New Project"**
3. Klick: **"Import Git Repository"**
4. Suche: `paletten-uebersicht` (dein Repository)
5. Klick: **"Import"**

### Schritt C3: Environment Variables auf Vercel setzen

1. Im "Configure Project" Bildschirm:
2. Klick: **"Environment Variables"**
3. Füge folgende Variablen hinzu:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | `https://hrkwjlrqydgtcsflpwcx.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3dqbHJxeWRndGNzZmxwd2N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NDY2OTEsImV4cCI6MjA5MjUyMjY5MX0._ZmdJa_r9CJNVBxS2FDOk-l7w3a8GkrmNIT_pr57CCU` |
| `GROQ_API_KEY` | `your_actual_groq_api_key_here` |
| `NODE_ENV` | `production` |

4. Klick: **"Deploy"**

### Schritt C4: Deploy warten

- Vercel wird jetzt den Code bauen und deployen
- Das dauert ca. **2-3 Minuten**
- Du siehst einen Fortschrittsbalken
- Wenn alles grün ist = Erfolgreich! ✅

### Schritt C5: Live-URL testen

1. Nach erfolgreichem Deploy siehst du "Congratulations!"
2. Klick: **"Visit"** oder
3. Öffne deine Live-URL (ungefähr so): `https://paletten-uebersicht.vercel.app`
4. App sollte online funktionieren!

### Schritt C6: Funktions-Test (Online)

```
1. Login: Sven / passwort
2. Sprich: "Jens Meier hat eine Europalette mitgenommen"
3. Überprüfe: Kunde und Saldo speichert sich
4. Klick: Übersicht → Kundenliste → Kundendetails → Transaktionshistorie
5. Alle Features sollten funktionieren
```

---

## 🔄 PART D: Updates & Continuous Deployment

### Automatisches Update mit Vercel

Vercel deployt **automatisch** bei jedem Push zu GitHub!

### Workflow für Updates:

```bash
# 1. Änderungen lokal machen und testen
# 2. Ins Projektfolder gehen
cd F:\Paletten

# 3. Git-Status checken
git status

# 4. Alle Änderungen stagenm
git add .

# 5. Commit mit Beschreibung
git commit -m "Feature: [Beschreibung der Änderung]"

# 6. Zu GitHub pushen
git push origin main

# 7. Vercel deployt automatisch!
# Schaue auf https://vercel.com/dashboard um den Status zu sehen
# Nach ~2-3 Minuten ist die neue Version online
```

### Vercel Dashboard monitoren

1. Gehe zu: https://vercel.com/dashboard
2. Klick auf: `paletten-uebersicht`
3. Siehst alle Deployments:
   - 🟢 Grün = Erfolgreich
   - 🔴 Rot = Fehler (Logs anschauen)
   - 🟡 Gelb = Im Fortschritt

---

## 🔒 Sicherheit

### ⚠️ WICHTIG: API Keys schützen!

**NIEMALS:**
- API Keys in Code committen
- API Keys in GitHub posten
- API Keys mit anderen teilen

**IMMER:**
- Keys in `.env` Datei speichern
- `.env` in `.gitignore` eintragen (ist schon gemacht!)
- Environment Variables auf Vercel setzen

### Wenn API Key compromittiert:

1. Sofort auf Vercel Environment Variablen überprüfen
2. Neue Keys generieren (Supabase & Groq)
3. Alte Keys deaktivieren
4. Vercel mit neuen Keys aktualisieren

---

## 🐛 Troubleshooting

### "Deployment failed" auf Vercel

**Mögliche Ursachen & Lösungen:**

#### 1. Environment Variables nicht gesetzt
- [ ] Vercel Dashboard öffnen
- [ ] Projekt Settings
- [ ] Environment Variables überprüfen
- [ ] Fehlende Variablen hinzufügen
- [ ] Neu deployen

#### 2. Supabase Connection Error
- [ ] `.env` Datei auf Typos überprüfen
- [ ] SUPABASE_URL und KEY correct copy-pasten
- [ ] `/api/health-check` Endpoint testen

#### 3. Build Error (node_modules)
- [ ] `npm install` lokal ausführen
- [ ] `package-lock.json` zu GitHub pushen
- [ ] Neu deployen

#### 4. "File not found" Error
- [ ] Überprüfe: `public/index.html` existiert
- [ ] Überprüfe: server.js kennt neuen Pfad
- [ ] Überprüfe: Dateinamen sind korrekt

### Logs anschauen

1. Vercel Dashboard → Projekt
2. Klick: "Deployments"
3. Klick auf den fehlgeschlagenen Deploy
4. Klick: "View Logs"
5. Fehlermeldung lesen und Problem beheben

---

## 📊 Monitoring

### Health Check durchführen

```
Online auf: https://paletten-uebersicht.vercel.app/api/health-check

Sollte anzeigen: {"status":"connected","database":"ok"}
```

### Supabase Daten überprüfen

1. Supabase Dashboard öffnen
2. Datenbank → Tabellen
3. Überprüfe: Neue Transaktionen in "Paletten"
4. Überprüfe: Kundenbestände in "Kunden_Saldo"

---

## 🎉 Fertig!

Du hast deine App erfolgreich:
- ✅ Auf GitHub hochgeladen
- ✅ Auf Vercel online gestellt
- ✅ Kontinuierliches Deployment konfiguriert

Deine App ist jetzt **weltweit online** und updatet sich automatisch bei jedem Git Push!

---

## 📞 Hilfe & Kontakt

Bei Fragen:
1. GitHub Issues erstellen
2. Vercel Logs anschauen
3. Supabase Status überprüfen
4. `.env` Konfiguration doppelt überprüfen

---

**Version:** 1.37  
**Letzte Aktualisierung:** April 2026
