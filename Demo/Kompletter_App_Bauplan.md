# KOMPLETT-BAUPLAN: Voice-App mit Aufnahme, manueller Input & Animation
## Handy-optimiert | Exakte Spezifikation für ALLE Seiten

---

## FARBEN (NICHT ÄNDERBAR)
- **Hintergrund (überall gleich)**: Dunkelgrau/Schwarz (#0F0F0F oder #1a1a1a)
- **Header/Top-Bar**: Dunkelgrau (#1a1a1a)
- **Content-Box (weiß)**: Weiß (#FFFFFF)
- **Pulsierender Kreis**: Blau → Cyan (#4A90E2 zu #00D4FF)
- **Mikrofon**: Weiß (#FFFFFF)
- **Buttons**: Blau (#4A90E2) oder Cyan (#00D4FF)
- **Text**: Dunkelgrau auf Weiß (#333333)

---

## LAYOUT GESAMT (ALLE SEITEN IDENTISCH)

### Viewport-Struktur
```
┌─────────────────────────────────┐
│ HEADER (Logout + Palette)       │  ← Oben (FEST)
├─────────────────────────────────┤
│                                 │
│   CONTENT-BOX (Weiß)            │  ← Zentriert
│   - Aufnahme-Animation          │
│   - ODER Input-Feld             │
│   - ODER Aufnahmestart-Button   │
│                                 │
├─────────────────────────────────┤
│ FOOTER (optional, klein)        │  ← Unten (wenn nötig)
└─────────────────────────────────┘
```

### Größen
- **Handy (< 600px Breite)**:
  - Header-Höhe: 60px
  - Content-Box: 90% Breite, Padding 20px
  - Max-Höhe Content: 400px (scrollfrei!)
  - Buttons: Mindestens 48px Höhe (Touch-friendly)

- **Desktop (>= 600px)**:
  - Header-Höhe: 70px
  - Content-Box: 500px Breite, Padding 30px
  - Max-Höhe Content: 500px
  - Buttons: Mindestens 50px Höhe

---

## HEADER (OBEN, FEST)

### Position & Größe
- **Höhe**: 60px (Handy) / 70px (Desktop)
- **Breite**: 100%
- **Position**: position: fixed, top: 0, z-index: 100
- **Background**: Dunkelgrau (#1a1a1a)
- **Padding**: 10px 20px (Handy) / 15px 30px (Desktop)

### Inhalt (von links nach rechts)
```
[Paletten-Icon]  ← Links, 32×32px
                 ← Flexible Mitte (Titel: z.B. "Voice Assistant")
                 [Benutzername] [Logout-Button] ← Rechts
```

### Palette-Icon (Links)
- **Größe**: 32px × 32px
- **Farbe**: Cyan (#00D4FF)
- **Style**: SVG oder Icon-Font
- **Funktion**: Theme/Design umschalten
- **Hover**: Leicht aufgehellt (#00E6FF)

### Benutzername + Logout (Rechts)
- **Anordnung**: Horizontal nebeneinander
- **Abstand**: 10px dazwischen
- **Logout-Button Eigenschaften**:
  - **Text**: "Logout" oder Icon (Türsymbol)
  - **Größe**: Min. 40px Höhe
  - **Padding**: 8px 16px
  - **Hintergrund**: Blau (#4A90E2)
  - **Text-Farbe**: Weiß (#FFFFFF)
  - **Border**: Abgerundete Ecken, 4px Radius
  - **Hover**: Dunkleres Blau (#2E5C99)
  - **Active**: Noch dunkler (#1F3D66)
  - **Cursor**: pointer
  - **Font**: Sans-Serif, 14px (Handy) / 16px (Desktop)

---

## CONTENT-BOX (ZENTRAL, ALLE SEITEN)

### Position & Größe
- **Breite**: 90% (Handy, max 500px) / 600px (Desktop)
- **Margin**: Auto (zentriert)
- **Padding**: 20px (Handy) / 30px (Desktop)
- **Background**: Weiß (#FFFFFF)
- **Border-Radius**: 8px
- **Box-Shadow**: 0 4px 12px rgba(0,0,0,0.15)
- **Top-Offset**: 60px (unter Header, Handy) / 70px (Desktop)
- **Bottom-Offset**: 20px Padding
- **Max-Height**: 400px (Handy) / 500px (Desktop)
- **Overflow**: Nicht sichtbar! (Kein Scrolling innerhalb der Box nötig!)

---

## SEITE 1: AUFNAHME-ANIMATION

### Was drin ist
```
┌──────────────────────────────┐
│   [Pulsierender Kreis]       │
│   [Mikrofon-Icon mittig]     │
│                              │
│   Status-Text: "Aufnahme..." │
│   (optional, unter Kreis)    │
│                              │
│   [Stopp-Button]             │
└──────────────────────────────┘
```

### Pulsierender Kreis (wie vorher)
- **Durchmesser Start**: 100px (Handy) / 120px (Desktop)
- **Durchmesser Max**: 220px (Handy) / 280px (Desktop)
- **Animation**: 1,5 Sekunden, ease-out, loop endlos
- **Farbe**: Linear Gradient (Blau zu Cyan)
- **Opacity**: 100% → 0%

### Mikrofon-Icon
- **Größe**: 32px × 32px (Handy) / 40px × 40px (Desktop)
- **Position**: Exakt zentral im Kreis
- **Animation**: KEINE! Statisch!

### Status-Text
- **Text**: "Aufnahme läuft..." oder ähnlich
- **Position**: Unter dem Kreis, 20px Abstand
- **Font**: Sans-Serif, 14px (Handy) / 16px (Desktop)
- **Farbe**: #666666
- **Text-Align**: Center

### Stopp-Button
- **Text**: "Stopp" oder Stoppsymbol (⏹)
- **Größe**: Min. 48px Höhe (Handy) / 50px (Desktop)
- **Breite**: 70% der Content-Box
- **Padding**: 12px 24px
- **Hintergrund**: Rot (#E74C3C) oder Dunkelrot (#C0392B)
- **Text-Farbe**: Weiß (#FFFFFF)
- **Border**: 4px Radius
- **Hover**: Helleres Rot (#EC7063)
- **Font**: Sans-Serif, Bold, 16px (Handy) / 18px (Desktop)
- **Cursor**: pointer
- **Position**: Unten in der Box

---

## SEITE 2: MANUELLER INPUT (Text eingeben)

### Was drin ist
```
┌──────────────────────────────┐
│   Text eingeben              │
│   [Input-Feld]               │
│   ┌────────────────────────┐ │
│   │ Hier tippen...         │ │
│   └────────────────────────┘ │
│                              │
│   [Senden-Button]            │
│                              │
│   [Zurück-Button]            │
└──────────────────────────────┘
```

### Input-Feld
- **Breite**: 100% der Content-Box
- **Höhe**: Min. 60px (Handy) / 80px (Desktop)
- **Padding**: 12px 16px
- **Font**: Sans-Serif, 16px (Handy) / 18px (Desktop)
- **Border**: 2px solid #CCCCCC
- **Border-Radius**: 4px
- **Background**: #FFFFFF
- **Farbe Text**: #333333
- **Placeholder-Farbe**: #999999
- **Focus**: Border-Farbe wird Blau (#4A90E2)

### Senden-Button
- **Text**: "Senden" oder Sendepfeil
- **Größe**: Min. 48px Höhe (Handy) / 50px (Desktop)
- **Breite**: 100% der Content-Box
- **Padding**: 12px 24px
- **Hintergrund**: Blau (#4A90E2)
- **Text-Farbe**: Weiß (#FFFFFF)
- **Border**: 4px Radius
- **Hover**: Dunkleres Blau (#2E5C99)
- **Active**: #1F3D66
- **Font**: Sans-Serif, Bold, 16px (Handy) / 18px (Desktop)
- **Cursor**: pointer
- **Disabled**: Grau (#CCCCCC), cursor: not-allowed

### Zurück-Button
- **Text**: "← Zurück" oder "Abbrechen"
- **Größe**: Min. 40px Höhe
- **Breite**: 60% der Content-Box
- **Hintergrund**: Hell-Grau (#F5F5F5)
- **Text-Farbe**: Dunkelgrau (#333333)
- **Border**: 2px solid #CCCCCC
- **Border-Radius**: 4px
- **Hover**: Mittles Grau (#E8E8E8)
- **Font**: Sans-Serif, 14px (Handy) / 16px (Desktop)
- **Position**: Unter dem Senden-Button, 10px Abstand

---

## SEITE 3: AUFNAHMESTART-BUTTON (Haupt-Screen)

### Was drin ist
```
┌──────────────────────────────┐
│                              │
│   [Großer Aufnahmebutton]    │
│                              │
│                              │
│   [Text: "Aufnahme starten"] │
│                              │
│   [Oder manuell eingeben]    │
│   [Sekundärer Button]        │
│                              │
└──────────────────────────────┘
```

### Primär-Button (Aufnahme starten)
- **Text**: "🎤 Aufnahme starten" oder "Aufnahme"
- **Größe**: GROSS!
  - **Handy**: Breite 80% Content-Box, Höhe 70px
  - **Desktop**: Breite 60% Content-Box, Höhe 80px
- **Padding**: 20px 40px
- **Hintergrund**: Blau → Cyan Gradient (#4A90E2 zu #00D4FF)
- **Text-Farbe**: Weiß (#FFFFFF)
- **Border**: Abgerundete Ecken, 8px Radius (großer Button!)
- **Font**: Sans-Serif, Bold, 20px (Handy) / 24px (Desktop)
- **Hover**: Helleres Gradient, Shadow ausgeprägter
- **Active**: Dunkleres Gradient, leicht eingedrückt
- **Cursor**: pointer
- **Box-Shadow**: 0 4px 12px rgba(74, 144, 226, 0.4)

### Sekundär-Button (Manuell eingeben)
- **Text**: "⌨️ Manuell eingeben" oder "Text eingeben"
- **Größe**: Etwas kleiner
  - **Handy**: Breite 70% Content-Box, Höhe 50px
  - **Desktop**: Breite 50% Content-Box, Höhe 60px
- **Padding**: 12px 24px
- **Hintergrund**: Hell-Grau (#F5F5F5)
- **Text-Farbe**: Dunkelgrau (#333333)
- **Border**: 2px solid #CCCCCC
- **Border-Radius**: 4px
- **Font**: Sans-Serif, 16px (Handy) / 18px (Desktop)
- **Hover**: Mittles Grau (#E8E8E8)
- **Position**: Unter dem Primär-Button, 20px Abstand

---

## RESPONSIVE BREAKPOINTS

### Handy (< 600px Breite)
- Header-Höhe: 60px
- Content-Box: 90% Breite, max. 500px
- Padding: 20px innen
- Buttons: Breite 80-100%, Min-Höhe 48px
- Font-Größen: -2px kleiner
- Pulsierender Kreis: Start 100px, Max 220px
- Mikrofon: 32px × 32px
- Abstand oben (unter Header): 60px + 20px = 80px

### Tablet (600px - 1024px)
- Header-Höhe: 65px
- Content-Box: 70% Breite, max. 600px
- Padding: 25px innen
- Buttons: Breite 60-80%, Min-Höhe 50px
- Pulsierender Kreis: Start 110px, Max 260px
- Mikrofon: 36px × 36px

### Desktop (>= 1024px)
- Header-Höhe: 70px
- Content-Box: 600px fix
- Padding: 30px innen
- Buttons: Breite 50-70%, Min-Höhe 50px
- Pulsierender Kreis: Start 120px, Max 280px
- Mikrofon: 40px × 40px

---

## CSS MEDIA QUERIES STRUKTUR

```css
/* Handy-First */
.header { height: 60px; padding: 10px 20px; }
.content-box { width: 90%; max-width: 500px; padding: 20px; margin-top: 80px; }
.pulse-circle { width: 100px; height: 100px; }
.button-primary { height: 60px; font-size: 18px; }

/* Tablet */
@media (min-width: 600px) {
  .header { height: 65px; }
  .content-box { width: 70%; max-width: 600px; padding: 25px; margin-top: 90px; }
  .pulse-circle { width: 110px; height: 110px; }
  .button-primary { height: 70px; font-size: 20px; }
}

/* Desktop */
@media (min-width: 1024px) {
  .header { height: 70px; }
  .content-box { width: 600px; padding: 30px; margin-top: 100px; }
  .pulse-circle { width: 120px; height: 120px; }
  .button-primary { height: 80px; font-size: 24px; }
}
```

---

## WICHTIGE REGELN (NICHT VERHANDELBAR!)

### Layout
- ✅ Header IMMER oben, FEST (fixed)
- ✅ Content-Box IMMER zentriert
- ✅ KEIN Scrolling innerhalb der Content-Box nötig!
- ✅ Auf Handy passt alles auf den Bildschirm
- ✅ Alle 3 Seiten haben denselben Hintergrund und Header

### Buttons
- ✅ Mindestens 48px Höhe (Touch-friendly)
- ✅ Klar erkennbar als Buttons (Border + Farbe)
- ✅ Hover-Effekte sichtbar
- ✅ KEIN Text-Dekorationen (Underline etc.)
- ✅ Aufnahme-Button: GROSS und prominent

### Animationen
- ✅ Pulsierender Kreis: Exakt 1,5 Sekunden
- ✅ Mikrofon: KEINE Animation, statisch
- ✅ Buttons: Hover/Active States vorhanden

### Farben
- ✅ Alle Farben streng vorgegeben
- ✅ KEINE Eigeninterpretationen!
- ✅ Blau #4A90E2, Cyan #00D4FF, Weiß #FFFFFF, Dunkelgrau #0F0F0F

### Handy-Optimierung
- ✅ Kein Scrollen nötig auf kleinen Displays
- ✅ Buttons groß genug zum Tippen
- ✅ Text lesbar auf 320px Breite
- ✅ Responsive ab < 600px anpassen

---

## CHECKLISTE FÜR UMSETZUNG

- [ ] Header oben fest (position: fixed)
- [ ] Paletten-Icon links im Header (32×32px, Cyan)
- [ ] Logout-Button rechts im Header (erkennbar, Blau, 40px min Höhe)
- [ ] Benutzername neben Logout-Button
- [ ] Content-Box zentriert (Weiß, Schatten)
- [ ] SEITE 1 (Aufnahme): Pulsierender Kreis + Mikrofon + Stopp-Button
- [ ] SEITE 2 (Input): Text-Feld + Senden-Button + Zurück-Button
- [ ] SEITE 3 (Start): Großer Aufnahmebutton + Sekundär-Button
- [ ] Alle Buttons mindestens 48px Höhe
- [ ] Aufnahme-Button ist der GRÖSSTE Button
- [ ] Auf Handy kein Scrollen nötig (passt alles auf Bildschirm)
- [ ] Responsive ab < 600px
- [ ] Alle Farben korrekt
- [ ] Alle Fonts serifenlos (Sans-Serif)
- [ ] Logout-Button hover/active States

---

## BEISPIEL-STRUKTUR (HTML)

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Voice Assistant</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- HEADER (ÜBERALL GLEICH) -->
  <header class="header">
    <div class="header-left">
      <svg class="palette-icon" viewBox="0 0 24 24"><!-- Paletten-Icon --></svg>
    </div>
    <div class="header-center">Voice Assistant</div>
    <div class="header-right">
      <span class="username">Max Mustermann</span>
      <button class="logout-btn">Logout</button>
    </div>
  </header>

  <!-- CONTENT-BOX (WECHSELT JE NACH SEITE) -->
  <div class="content-box">
    <!-- SEITE 1: Aufnahme -->
    <div class="page recording-page">
      <div class="pulse-container">
        <div class="pulse-circle"></div>
        <svg class="microphone"><!-- Mikrofon --></svg>
      </div>
      <p class="status-text">Aufnahme läuft...</p>
      <button class="stop-btn">Stopp</button>
    </div>

    <!-- SEITE 2: Manueller Input -->
    <div class="page input-page" style="display:none;">
      <h3>Text eingeben</h3>
      <input type="text" class="text-input" placeholder="Hier tippen...">
      <button class="send-btn">Senden</button>
      <button class="back-btn">← Zurück</button>
    </div>

    <!-- SEITE 3: Start -->
    <div class="page start-page" style="display:none;">
      <button class="button-primary">🎤 Aufnahme starten</button>
      <button class="button-secondary">⌨️ Manuell eingeben</button>
    </div>
  </div>
</body>
</html>
```

---

## WICHTIG!

Diesen Bauplan **EXAKT** befolgen. Keine Interpretationen, keine "kreativen Änderungen".
Bei Unklarheiten: FRAGEN, nicht raten!
Alle 3 Seiten müssen identisches Layout + Header haben.
