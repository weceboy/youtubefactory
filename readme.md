# AI YouTube Factory / Research — 5-Stufen-Produktionsplan

Dieses Repository soll schrittweise zu einer **AI-gestützten YouTube-Content-Factory** ausgebaut werden. Das Ziel ist ausdrücklich **nicht** nur ein einfacher KI-Video-Generator, sondern eine nachvollziehbare Produktionsplattform für einen oder mehrere faceless YouTube-Kanäle.

Die Entwicklung wird bewusst in **5 Stufen** umgesetzt. Jede Stufe muss für sich nutzbar sein und eine stabile Grundlage für die nächste Stufe liefern. Die erste Stufe soll **so schnell wie möglich** produktiv werden — und zwar wirklich schnell: Bevor in Datenmodelle, Provenance-Graphen oder Multi-Provider-Adapter investiert wird, muss ein einziges, echtes Video den kompletten Kreislauf einmal durchlaufen haben. Erst danach wird die Infrastruktur ausgebaut.

---

## 1. Produktvision

Das System soll langfristig diesen Kreislauf abbilden:

```text
CHANNEL / STRATEGY
        ↓
RESEARCH / IDEAS
        ↓
SCRIPT
        ↓
SCENES / TIMELINE
        ↓
VISUALS + VOICE
        ↓
VIDEO RENDER
        ↓
YOUTUBE PUBLISH
        ↓
YOUTUBE ANALYTICS
        ↓
LEARNINGS
        ↓
NEUE IDEEN / BESSERE SCRIPTS
```

Der Benutzer soll dabei nicht die technische Komplexität der einzelnen Anbieter kennen müssen. Provider, Modelle, API-Schlüssel, Kosten, Assets, Versionen und Quellen werden zentral verwaltet.

### Leitprinzipien

1. **Schrittweise liefern statt Big Bang.** Das gilt auch *innerhalb* von Stufe 1: erst der dünne End-to-End-Durchstich, dann die Infrastruktur (siehe 2.0).
2. **Jede Generation muss nachvollziehbar sein.**
3. **Jedes Asset muss eine Herkunft und Nutzungshistorie besitzen.**
4. **Keine undurchsichtige Asset-Duplikation.**
5. **Provider austauschbar halten.** Das gilt auch für PPQ.ai selbst — siehe Leitprinzip 6.
6. **PPQ.ai als einen von mehreren gleichberechtigten Providern unterstützen**, nicht als verpflichtende Zwischenschicht für jede KI-Operation. Provider-Abstraktion, die nur einen austauschbaren Provider kennt (PPQ), ist keine echte Abstraktion.
7. **Human-in-the-loop bleibt jederzeit möglich.**
8. **Automatisierung darf keine Nachvollziehbarkeit zerstören.**
9. **Kosten müssen pro Generation und später pro Video messbar sein.**
10. **Die Architektur muss von einem Kanal auf mehrere Kanäle skalieren können.**
11. **Das Durchsatzziel pro Kanal (z. B. "3 Videos/Woche") bestimmt, wie viel Automatisierung nötig ist.** Ohne dieses Ziel lässt sich weder das Autopilot-Level noch die Review-Last sinnvoll dimensionieren.
12. **Kein veröffentlichtes Video darf gegen YouTubes Richtlinien zu automatisch erzeugtem/formelhaftem Content verstoßen.** Das ist kein Nice-to-have, sondern ein Kanal-Überlebensrisiko (siehe 5.4b).

---

# 2. Entwicklungsstufen

## STUFE 1 — MVP: Script + Scene Breakdown + Stock Visuals + manuelle KI-Bilder

### Ziel

Die erste Version muss **so schnell wie möglich stehen**. Sie soll noch keine komplette Video-Factory sein. Sie muss aber bereits einen echten Produktionsnutzen haben:

> Thema eingeben → Skript erzeugen → Skript in Szenen zerlegen → zu jeder Szene Visual-Prompts erzeugen → automatisch passende Stockbilder aus drei kostenlosen Stock-Anbietern suchen → Stockbilder in der Visual-Ansicht anzeigen → per Klick KI-Bild aus dem Prompt generieren → Stock- und KI-Visuals parallel an der passenden Script-/Videostelle anzeigen → Asset-Herkunft und bisherige Verwendung speichern.

### 2.0 Kick-off: Dünner End-to-End-Durchstich zuerst

**Bevor** die vollständige Stufe 1 (2.1–2.12) gebaut wird, muss ein minimaler Durchstich stehen — Ziel: **Tage, nicht Wochen.**

```text
Thema eingeben
      ↓
Skript erzeugen (ein LLM-Call)
      ↓
grobe Szenen-Zerlegung
      ↓
ein Stockbild pro Szene (ein Provider reicht)
      ↓
manuelle Ansicht: Text + Bild nebeneinander
```

Für diesen Durchstich reicht eine **minimale** Asset-Ablage (z. B. eine JSON-Datei pro Asset mit Provider, URL, Lizenz — kein Hashing, kein Dedup, kein Graph). Der Sinn des Durchstichs ist, so früh wie möglich zu lernen, ob Thema/Nische/Skriptqualität überhaupt funktionieren — das ist das eigentliche Risiko einer faceless-Factory, nicht fehlende Asset-Provenance.

Erst wenn dieser Durchstich läuft, wird auf die volle Stufe-1-Spezifikation (2.1–2.12) ausgebaut.

### 2.1 Projekt anlegen

Ein Projekt benötigt mindestens:

- Projektname
- Arbeitstitel
- Kanal-Zuordnung (optional in Stufe 1, aber Datenmodell bereits vorbereiten)
- Sprache
- gewünschtes Videoformat, z. B. 16:9
- Zielvideolänge
- Thema / Ausgangsprompt
- Status
- Erstellungsdatum
- Aktualisierungsdatum

### 2.2 Script-Erstellung

In Stufe 1 reicht zunächst ein einfacher manueller Startpunkt:

- Benutzer gibt Thema / Prompt ein.
- Benutzer kann optional eigene Recherche oder Stichpunkte einfügen.
- KI erzeugt daraus ein strukturiertes Skript.
- Das Skript muss nicht nur als Fließtext gespeichert werden.
- Es muss in logisch getrennte Abschnitte bzw. Szenen überführt werden.

Das Datenmodell muss bereits Versionen erlauben:

```text
Script v1
Script v2
Script v3
```

Ein Update des Skripts darf die vorherigen Versionen nicht zerstören.

### 2.3 Scene Breakdown

Das Skript wird in Szenen zerlegt. Jede Szene benötigt mindestens:

- Scene ID
- Reihenfolge
- Start-/Endposition, sobald Timestamps vorhanden sind
- gesprochenen Text
- kurze visuelle Beschreibung
- Image Prompt
- optional Motion Prompt
- Visual Status
- verknüpfte Assets

Beispiel:

```text
Scene 03
00:17–00:29

Voice/Text:
"Hier beginnt der eigentliche Prozess ..."

Image Prompt:
"Top-down view of ..."

Motion Prompt:
"Slow camera push-in ..."
```

### 2.4 Automatische Stock-Suche

Für **jede relevante Szene** sollen automatisch passende Bilder aus zunächst drei kostenlosen Stock-Anbietern gesucht werden.

Initiale Provider:

1. **Unsplash**
2. **Pexels**
3. **Pixabay**

Die Auswahl dieser drei Anbieter ist als Startpunkt zu verstehen. Es soll **keinesfalls per HTML-Scraping** gearbeitet werden. Es sollen offizielle APIs bzw. offiziell erlaubte Schnittstellen verwendet werden, sofern für den jeweiligen Anbieter/API-Zugang erforderlich.

Die Provider müssen über Adapter abstrahiert werden:

```text
StockProvider
 ├── UnsplashProvider
 ├── PexelsProvider
 └── PixabayProvider
```

Dadurch kann später ein vierter oder fünfter Anbieter hinzugefügt werden, ohne die gesamte Anwendung umzubauen.

### 2.5 Stock-Suchergebnis

Für jedes gefundene Stock-Asset müssen mindestens gespeichert werden:

- interne Asset ID
- Provider
- externe Asset ID
- Original-URL
- Download-URL
- lokale/objektbasierte Speicherreferenz
- Thumbnail
- Autor / Creator, falls verfügbar
- Lizenz-/Nutzungsinformationen
- Provider-Seite / Source URL
- Suchbegriff
- zugehörige Scene ID
- Zeitpunkt der Suche
- Downloadzeitpunkt
- Hash/Checksumme, sofern sinnvoll

**Wichtig:** Die Anwendung darf niemals nur das Bild speichern. Die Metadaten zur Herkunft müssen immer zusammen mit dem Asset erhalten bleiben.

### 2.6 Visual-Ansicht

Die Visual-Ansicht ist ein zentraler Bestandteil von Stufe 1.

Für jede Szene soll der Benutzer unmittelbar sehen:

```text
SCENE 03
────────────────────────────────────
Gesprochener Text

[ STOCK 1 ] [ STOCK 2 ] [ STOCK 3 ]

           oder

[ AI IMAGE 1 ] [ AI IMAGE 2 ]

Image Prompt:
[................................]

[Generate AI Image]
```

Stock- und KI-Visuals müssen **parallel in derselben Scene** sichtbar sein.

Der Benutzer soll nicht zwischen verschiedenen Systemseiten wechseln müssen, um zu erkennen, welches Bild zu welcher Scriptstelle gehört.

### 2.7 Manuelle KI-Bildgenerierung

Neben dem automatisch gefundenen Stockmaterial muss der Benutzer den vorhandenen Image Prompt mit **einem Klick** an einen konfigurierten KI-Bildprovider senden können.

Der Ablauf:

```text
Scene
 ↓
Image Prompt
 ↓
[Generate]
 ↓
AI Provider
 ↓
Generation Attempt
 ↓
AI Asset
 ↓
Scene 03 Visual Gallery
```

Die KI-Generierung muss zunächst bewusst **manuell ausgelöst** werden. Vollautomatische Generierung kommt erst später.

### 2.8 PPQ.ai als einen KI-API-Provider unterstützen

Die Architektur soll von Anfang an so gebaut werden, dass die KI-Modelle wahlweise über **PayPerQ / PPQ.ai** genutzt werden können.

Offizielle Dokumentation:

https://ppq.ai/api-docs

PPQ ist ein empfohlener Standard-Provider für den schnellen Einstieg (eine API, mehrere Modelle), aber **kein Pflicht-Gateway**. Die Anwendung darf nicht so gebaut werden, dass andere Provider (z. B. ElevenLabs, OpenAI, Anbieter-eigene APIs) nur über den Umweg PPQ erreichbar sind — das wäre trotz Adapter-Schicht ein faktisches Lock-in. Direkte Provider-Anbindungen müssen jederzeit gleichwertig möglich sein, insbesondere wenn sie günstiger, schneller oder zuverlässiger sind.

PPQ stellt eine OpenAI-kompatible API bereit und unterstützt unter anderem Chat/LLM, Text-to-Speech, Image Generation und Video Generation. Die Integration soll über eine eigene Provider-Schicht erfolgen.

Empfohlene Struktur:

```text
AIProvider
   ├── PPQProvider
   │     ├── Chat / LLM
   │     ├── Image Generation
   │     ├── Text-to-Speech
   │     └── später Video Generation
   └── DirectProvider (gleichrangig, je nach Anwendungsfall)
         ├── z. B. direkter TTS-Anbieter
         └── z. B. direkter Image-Anbieter
```

API-Keys dürfen **niemals im Frontend oder im Git Repository** landen.

### 2.9 Asset Registry — Pflicht ab Stufe 1 (vollständige Version)

Dies ist eine der wichtigsten Anforderungen des gesamten Systems — **sobald der Durchstich aus 2.0 steht.**

**Jedes Asset muss global eindeutig identifizierbar sein.**

Asset-Typen:

- image
- video
- audio
- voiceover
- music
- sfx
- thumbnail
- generated-image
- generated-video
- stock-image
- stock-video

Ein Asset benötigt mindestens:

```text
asset_id
asset_type
source_type
provider
external_id
source_url
original_url
storage_url
license
creator
created_at
content_hash
```

**Für `music` und `sfx` gelten dieselben Provenance- und Lizenzpflichten wie für Bilder und Videos.** Musik ist in der Praxis eine der häufigsten Ursachen für Copyright-Claims auf YouTube — die Lizenzklärung darf nicht implizit vorausgesetzt werden, sondern muss wie bei Bildmaterial explizit erfasst und vor dem finalen Render geprüft werden (siehe 5.4b).

### 2.10 Asset Usage History

Das System muss jederzeit beantworten können:

> Woher stammt dieses Asset?

und:

> In welchen Videos/Projekten wurde dieses Asset bereits verwendet?

Beispiel:

```text
Asset: asset_8f32...

Source:
Pexels
Photo ID: 123456
Creator: John Doe
Source URL: ...

Used in:
✓ Project 12 / Scene 03
✓ Project 27 / Scene 08
✓ Project 31 / Scene 02
```

Dies gilt **auch für KI-generierte Assets**.

Für KI-Assets müssen zusätzlich gespeichert werden:

- Modell
- Provider
- Prompt
- Negative Prompt, falls vorhanden
- Parameter
- Generation ID
- Kosten
- Zeitpunkt
- Input Asset(s), falls Image-to-Image
- Generation Attempt

### 2.11 Keine stillen Duplikate

Wenn ein identisches Asset bereits existiert, soll das System möglichst erkennen können, dass es sich um dasselbe Asset handelt.

Dafür sollen Hashes/Checksums und Provider-IDs genutzt werden.

Ziel:

```text
1 physisches Asset
       ↓
mehrere Nutzungsreferenzen
```

statt:

```text
5 Kopien desselben Bildes
```

### 2.12 Stufe-1-Akzeptanzkriterien

**Kick-off-Durchstich (2.0) — muss zuerst stehen:**

- [ ] Ein Thema kann eingegeben werden und erzeugt ein Skript.
- [ ] Skript wird grob in Szenen zerlegt.
- [ ] Zu jeder Szene existiert mindestens ein Bild (Stock oder KI).
- [ ] Text und Bild sind in einer einfachen Ansicht nebeneinander sichtbar.
- [ ] Asset-Herkunft wird minimal erfasst (Provider, URL, Lizenz) — auch ohne vollen Graph.

**Vollständige Stufe 1 — danach:**

- [ ] Projekt kann angelegt werden.
- [ ] LLM-Anbindung funktioniert über mindestens einen konfigurierten Provider (PPQ.ai oder direkt).
- [ ] Stock-Suche funktioniert über Unsplash, Pexels und Pixabay bzw. deren offiziell verfügbare APIs.
- [ ] Stockbilder werden automatisch den passenden Szenen zugeordnet.
- [ ] Stockbilder werden in der Visual-Ansicht angezeigt.
- [ ] Benutzer kann pro Szene einen Image Prompt mit einem Klick generieren.
- [ ] KI-Bilder erscheinen neben den Stockbildern derselben Szene.
- [ ] Jede Generierung erzeugt eine nachvollziehbare Generation Attempt.
- [ ] Jede Asset-Quelle wird gespeichert, inklusive Lizenzstatus für Bild, Video, Musik und SFX.
- [ ] Jede Asset-Nutzung wird gespeichert.
- [ ] Asset-Historie kann angezeigt werden.
- [ ] Skript- und Visual-Versionen gehen bei Änderungen nicht verloren.
- [ ] API Keys sind serverseitig geschützt.

---

# STUFE 2 — Research- und Script-Automatisierung

### Ziel

Stufe 2 soll aus dem einfachen "Thema eingeben" einen intelligenteren Research- und Script-Workflow machen.

Der Benutzer soll zunehmend weniger Vorarbeit leisten müssen.

### 3.1 Research Engine

Die Research Engine soll aus einem Thema selbstständig Rechercheinformationen zusammenstellen.

Mögliche Inputs:

- Thema
- Keyword
- Nische
- Zielgruppe
- Sprache
- gewünschte Videolänge
- optional gewünschter Stil

Die Engine soll unter anderem:

- relevante Webseiten recherchieren
- aktuelle Informationen finden
- Quellen sammeln
- wichtige Fakten extrahieren
- widersprüchliche Angaben erkennen
- Quellen den Aussagen zuordnen
- Research als versioniertes Artefakt speichern

PPQ.ai kann für LLM-Aufgaben verwendet werden, ist aber auch hier kein Pflicht-Provider. Die konkrete Nutzung soll über eine konfigurierbare Research-Provider-Schicht erfolgen.

### 3.2 Source Registry

Jede wichtige Rechercheaussage soll auf Quellen zurückgeführt werden können.

```text
Claim
 ↓
Source
 ↓
URL
 ↓
Retrieved At
 ↓
Research Version
 ↓
Script Claim
```

Das System soll nicht nur das fertige Research-Dokument speichern, sondern dessen Quellenstruktur.

### 3.3 Idea Engine

Später soll aus Research eine Liste möglicher Videoideen erzeugt werden.

Beispiel:

```text
Topic
 ↓
20 Ideas
 ↓
AI Scoring
 ↓
Top 5
 ↓
User selects
 ↓
Script
```

Ein Idea Record soll mindestens besitzen:

- Titelidee
- Hook-Idee
- Zielgruppe
- Keywords
- erwarteter Nutzen
- Evergreen/News-Klassifizierung
- Research References
- Score
- Status

### 3.4 Script Engine verbessern

Die Script Engine soll aus Research nicht nur Text erzeugen, sondern eine definierte Dramaturgie verwenden können:

```text
Hook
 ↓
Open Loop
 ↓
Context
 ↓
Problem / Conflict
 ↓
Development
 ↓
Surprise / Payoff
 ↓
Conclusion
 ↓
CTA
```

Die Struktur muss konfigurierbar sein.

### 3.5 Script Quality Checks

Vor der Freigabe soll das System automatisch prüfen können:

- fehlende Informationen
- Wiederholungen
- unklare Aussagen
- sehr lange Absätze
- schwache Hooks
- fehlende Quellen
- mögliche Faktenprobleme
- unerwünschte Formulierungen
- Ziel-Länge

### 3.6 Stufe-2-Akzeptanzkriterien

- [ ] Research kann weitgehend automatisch aus einem Thema erstellt werden.
- [ ] Quellen werden gespeichert.
- [ ] Research ist versioniert.
- [ ] Aus Research können mehrere Videoideen generiert werden.
- [ ] Ideen können bewertet und ausgewählt werden.
- [ ] Script Engine nutzt Research als Kontext.
- [ ] Script kann nach konfigurierbarer Dramaturgie erzeugt werden.
- [ ] Script-Versionen bleiben nachvollziehbar.
- [ ] Claims können auf Research-Quellen zurückgeführt werden.

---

# STUFE 3 — TTS / Voiceover

### Ziel

Das freigegebene Skript wird automatisch in ein hochwertiges Voiceover umgewandelt.

TTS-Anbieter (z. B. ElevenLabs) können **wahlweise** direkt oder über PPQ.ai angesprochen werden. Die Anwendung soll nicht voraussetzen, dass ein separater direkter API-Key im System hinterlegt werden *muss* — aber sie darf umgekehrt auch nicht voraussetzen, dass PPQ.ai der einzige Weg ist. Welcher Weg günstiger/zuverlässiger ist, soll pro Kanal konfigurierbar sein.

PPQ dokumentiert einen OpenAI-kompatiblen Text-to-Speech-Endpunkt unter:

`POST https://api.ppq.ai/v1/audio/speech`

und unterstützt ElevenLabs-Modelle wie `eleven_multilingual_v2`. Die verfügbaren Modelle und Stimmen sollen dynamisch über die jeweilige API ermittelt werden, soweit möglich.

### 4.1 Voice Provider Layer

```text
TTSProvider
   ├── PPQProvider
   │     └── ElevenLabs model
   └── DirectProvider
         └── z. B. ElevenLabs direkt
```

Weitere TTS-Provider müssen später ergänzt werden können.

### 4.2 Voice Settings

Pro Kanal bzw. Projekt soll konfigurierbar sein:

- Voice ID
- Modell
- Sprache
- Geschwindigkeit, falls Provider unterstützt
- weitere unterstützte Parameter

### 4.3 Audio-Segmentierung

Das System soll nicht nur eine einzige MP3-Datei erzeugen, sondern nach Möglichkeit eine Zuordnung zu den Script-/Scene-Abschnitten ermöglichen.

Ideal:

```text
Scene 01 → audio_01
Scene 02 → audio_02
Scene 03 → audio_03
```

oder ein Master-Voiceover plus präzise Timestamps.

### 4.4 Timestamps

Das System muss die gesprochene Audiospur mit den Szenen synchronisieren können.

Ziel:

```text
00:00–00:08 → Scene 01
00:08–00:17 → Scene 02
00:17–00:29 → Scene 03
```

Diese Zeitinformationen werden später für das Rendering benötigt.

### 4.5 Voice Asset Lineage

Auch Voiceover-Dateien müssen vollständig nachvollziehbar sein:

- Script-Version
- Voice Provider
- Modell
- Voice ID
- Generation/Request ID, falls verfügbar
- Kosten
- Timestamp
- Audio-Datei
- verwendete Szenen

### 4.6 Stufe-3-Akzeptanzkriterien

- [ ] Freigegebenes Skript kann in TTS umgewandelt werden — via PPQ.ai oder direktem Provider.
- [ ] Voice kann pro Kanal/Projekt gewählt werden.
- [ ] TTS-Generierung ist versioniert.
- [ ] Audio wird gespeichert.
- [ ] Audio ist mit Script und Scenes verknüpft.
- [ ] Timestamps können erzeugt/zugeordnet werden.
- [ ] Kosten und Provider werden gespeichert.
- [ ] Fehler und Retries werden als Attempts protokolliert.

---

# STUFE 4 — Video Rendering + Motion Graphics + automatisches YouTube Publishing

### Ziel

Aus Script + Voiceover + Scenes + Visuals wird ein echtes fertiges Video gerendert.

Anschließend soll das System das Video automatisch auf YouTube hochladen können.

### 5.1 Rendering Engine

Der Renderer muss mindestens unterstützen:

- 16:9 Longform
- 9:16 Shorts als vorbereitete Architektur
- Voiceover
- Bilder
- Videos
- Stock Assets
- KI Assets
- Scene Timing
- Übergänge
- Zoom/Pan
- Motion Effects
- Text Overlays
- Untertitel
- Musik
- SFX
- Lautstärke-Mixing

### 5.2 Motion Graphics

Motion Graphics sollen aus Scene-Daten und Motion Prompts erzeugt bzw. konfiguriert werden können.

Beispiele:

- Ken Burns
- Slow Zoom
- Pan
- Slide
- Fade
- Text Reveal
- Highlight
- einfache Diagramme
- einfache Lower Thirds
- Kapitel-/Section-Transitions

Die Rendering Engine muss deterministisch bzw. reproduzierbar sein, soweit es die verwendeten Provider zulassen.

### 5.3 Visual Selection

Die Render Engine darf nur das **aktuell ausgewählte/freigegebene Asset** einer Szene verwenden.

Nicht ausgewählte Kandidaten dürfen nicht versehentlich im finalen Video landen.

```text
Scene
 ├── Stock Candidate A
 ├── Stock Candidate B
 ├── AI Candidate A
 └── AI Candidate B
          ↓
      SELECTED
          ↓
       RENDER
```

### 5.4 Final QA Gate

Vor dem Upload soll mindestens geprüft werden:

- alle Szenen besitzen Visuals
- alle benötigten Assets sind verfügbar
- alle Assets sind lizenzseitig akzeptiert — inklusive Musik und SFX
- Audio ist vorhanden
- Timestamps sind vollständig
- keine Scene-Lücke
- Render erfolgreich
- Datei abspielbar
- erwartete Dauer plausibel
- erwartete Auflösung korrekt

### 5.4b YouTube Policy Compliance Gate

Zusätzlich zur technischen QA muss vor der Veröffentlichung geprüft werden, ob das Video gegen YouTubes Richtlinien zu massenhaft erzeugtem/formelhaftem Content verstößt. Das ist kein optionaler Zusatz — Verstöße können zu Demonetarisierung oder Kanalsperrung führen, unabhängig davon, wie gut die technische Pipeline sonst funktioniert.

Mindestprüfungen:

- **Struktur-Variation:** Weicht dieses Video in Aufbau/Dramaturgie/Cold-Open erkennbar von den letzten Videos desselben Kanals ab? (Kein Video darf exakt dieselbe Beat-Struktur wie die letzten N Videos verwenden.)
- **Offenlegung synthetischer Inhalte:** Wo YouTube eine Kennzeichnung von realistisch wirkendem KI-generiertem Material verlangt, muss diese beim Upload gesetzt werden (siehe 5.5).
- **Kein reines Recycling:** Das Video darf kein bereits veröffentlichtes fremdes oder eigenes Video im Wesentlichen wiederholen.
- **Nachvollziehbare menschliche Beteiligung:** Es sollte protokolliert sein, dass ein Mensch das Skript und das finale Video freigegeben hat (Review Queue, siehe 5.3 in Abschnitt UI/UX).

Dieses Gate soll als eigener Status in der Publishing State Machine (5.7) auftauchen und kann bei Verstößen den Upload blockieren.

### 5.5 YouTube Upload

YouTube muss als eigener Provider/Adapter integriert werden.

```text
YouTubeProvider
 ├── Upload
 ├── Metadata
 ├── Thumbnail
 ├── Captions
 ├── Playlist
 └── Scheduling
```

Mindestens:

- Video Upload
- Titel
- Beschreibung
- Tags, sofern weiterhin relevant
- Thumbnail
- Sprache
- Kategorie
- Playlist
- Sichtbarkeit
- geplante Veröffentlichung
- Untertitel
- Kennzeichnung als KI-unterstützt/synthetisch, wo von YouTube verlangt

Titel und Thumbnail sollen bereits hier als **mehrere benannte Varianten** gespeichert werden können (nicht nur ein finaler Wert), damit YouTubes natives A/B-Test-Feature genutzt werden kann, sobald ein Video live ist. Die eigentliche datengetriebene Auswertung, welche Variante gewinnt, gehört in Stufe 5 (CTR/Packaging Intelligence) — aber die Datenstruktur dafür muss schon hier existieren, nicht erst nachträglich angeflanscht werden.

### 5.6 YouTube Credentials

OAuth Credentials müssen sicher gespeichert werden.

Keine YouTube Tokens im Frontend.

Tokens müssen verschlüsselt bzw. über einen sicheren Secret Store verwaltet werden.

### 5.7 Publishing State Machine

```text
DRAFT
 ↓
READY_FOR_RENDER
 ↓
RENDERING
 ↓
RENDERED
 ↓
QA
 ↓
POLICY_CHECK
 ↓
READY_TO_PUBLISH
 ↓
UPLOADING
 ↓
SCHEDULED / PUBLISHED
 ↓
ANALYTICS
```

Jeder Statuswechsel muss nachvollziehbar sein.

### 5.8 Stufe-4-Akzeptanzkriterien

- [ ] Echtes Video wird gerendert.
- [ ] Voiceover und Visuals werden synchronisiert.
- [ ] Motion Graphics funktionieren.
- [ ] Text/Untertitel können gerendert werden.
- [ ] Lizenz-/Approval-Gates werden vor dem Render berücksichtigt, inklusive Musik/SFX.
- [ ] Finales Render kann in einer Preview betrachtet werden.
- [ ] YouTube Policy Compliance Gate läuft vor jedem Upload und kann blockieren.
- [ ] YouTube OAuth funktioniert.
- [ ] Video kann automatisch hochgeladen werden.
- [ ] Metadaten werden übertragen.
- [ ] Mehrere Titel-/Thumbnail-Varianten können gespeichert und übertragen werden.
- [ ] Veröffentlichung kann geplant werden.
- [ ] Upload-Status wird gespeichert.
- [ ] YouTube Video ID wird mit dem internen Projekt verknüpft.

---

# STUFE 5 — YouTube Analytics + Growth Intelligence

### Ziel

Ab Stufe 5 wird das System von einer Produktionsplattform zu einer **lernenden YouTube-Content-Factory**.

Die zentrale Feedbackschleife lautet:

```text
VIDEO
 ↓
YOUTUBE
 ↓
ANALYTICS
 ↓
PATTERN DETECTION
 ↓
AI INSIGHTS
 ↓
CONTENT STRATEGY
 ↓
NEXT VIDEO
```

### 6.1 Analytics Import

Das System soll YouTube-Daten regelmäßig synchronisieren.

Mindestens relevante Metriken:

- Views
- Impressions
- CTR
- Watch Time
- Average View Duration
- Average Percentage Viewed
- Likes
- Comments
- Shares, sofern verfügbar
- Subscribers gained
- Revenue / geschätzte Einnahmen, sofern über die verfügbare API verfügbar

### 6.2 Video Performance Record

Jedes veröffentlichte Video erhält einen Performance-Datensatz.

```text
Internal Project ID
        ↓
YouTube Video ID
        ↓
Daily Metrics
        ↓
Aggregated Performance
```

### 6.3 Retention Intelligence

Das System soll erkennen können:

- wo Zuschauer abspringen
- welche Hooks funktionieren
- welche Szenentypen hohe Bindung erzeugen
- welche Videolängen gut funktionieren
- welche Formate überdurchschnittlich sind

Beispiel:

```text
Hook Type A
→ 72% retention @ 30s

Hook Type B
→ 54% retention @ 30s
```

Diese Erkenntnisse sollen für zukünftige Scripts nutzbar sein.

### 6.4 CTR / Packaging Intelligence

Titel und Thumbnail werden als eigene Entitäten geführt (Datenstruktur bereits seit 5.5 vorhanden).

```text
Video
 ├── Title Version A
 ├── Title Version B
 ├── Thumbnail A
 └── Thumbnail B
```

Die Plattform soll aus Performance-Daten lernen, welche Kombinationen funktionieren, und diese Learnings auf zukünftige Titel-/Thumbnail-Vorschläge anwenden.

### 6.5 Content Intelligence

Die Plattform soll Fragen beantworten können wie:

- Welche Themen funktionieren?
- Welche Formate funktionieren?
- Welche Videolängen funktionieren?
- Welche Hooks funktionieren?
- Welche Titelmuster funktionieren?
- Welche Visual-Stile funktionieren?
- Welche Themen erzeugen Abonnenten?
- Welche Videos sind besonders profitabel?
- Welche Videos sind teuer und schwach?

### 6.6 Kosten-/Profitabilitätsanalyse

Jedes Projekt soll langfristig seine Produktionskosten kennen:

```text
Research
LLM
Image Generation
Stock
TTS
Video Generation
Rendering
Storage
```

Dann kann das System später berechnen:

```text
Cost / Video
Cost / Minute
Cost / 1,000 Views
Revenue / Video
Profit / Video
ROI
```

### 6.7 AI Recommendations

Die KI soll aus Analytics konkrete Vorschläge erzeugen können:

> "Videos mit dem Format X erzielen bei diesem Kanal 38% höhere durchschnittliche Watch Time."

> "Themen aus Kategorie Y haben überdurchschnittliche CTR, aber schwache Retention."

> "Die ersten 15 Sekunden sollten stärker auf den konkreten Konflikt fokussieren."

Die Empfehlungen müssen auf gespeicherten Daten beruhen und mit den zugrunde liegenden Videos/Metriken nachvollziehbar sein.

### 6.8 Stufe-5-Akzeptanzkriterien

- [ ] YouTube Videos werden automatisch erkannt/synchronisiert.
- [ ] Analytics werden gespeichert.
- [ ] Performance kann pro Video betrachtet werden.
- [ ] CTR/Retention/Watch Time können ausgewertet werden.
- [ ] Titel/Thumbnail-Versionen können mit Performance verbunden werden.
- [ ] Produktionskosten werden Performance-Daten gegenübergestellt.
- [ ] AI Insights können erzeugt werden.
- [ ] Insights können auf neue Ideen/Scripts zurückwirken.

---

# 3. Globale Anforderungen für ALLE 5 Stufen

## 3.1 Vollständige Asset Provenance

Dies ist eine harte Kernanforderung — für den vollen Funktionsumfang. Für den Kick-off-Durchstich (2.0) genügt vorübergehend eine minimale Variante.

Für **jedes** Bild, Video, Audio und sonstige Media Asset muss nachvollziehbar sein:

1. Woher stammt es?
2. Welcher Provider?
3. Welche externe ID?
4. Welche Lizenz?
5. Wann wurde es importiert/generiert?
6. Mit welchem Prompt wurde es generiert?
7. Mit welchem Modell wurde es generiert?
8. Welche Generation Attempt war es?
9. In welcher Scene wurde es verwendet?
10. In welchen Projekten/Videos wurde es verwendet?
11. Welche Version ist aktuell ausgewählt?

### Asset Provenance Graph

Langfristig soll die Datenstruktur einen Graphen ermöglichen:

```text
Research
  ↓
Script v3
  ↓
Scene 12
  ↓
Visual v4
  ↓
Generation Attempt 2
  ↓
Asset
  ↓
Render v5
  ↓
YouTube Video
```

Damit kann jeder Teil des fertigen Videos bis zur ursprünglichen Quelle zurückverfolgt werden.

---

## 3.2 Versionierung

Folgende Objekte müssen versionierbar sein:

- Research
- Ideas
- Scripts
- Scenes
- Image Prompts
- Motion Prompts
- Visuals
- Voiceovers
- Audio
- Render Config
- Final Render
- Title
- Thumbnail
- YouTube Metadata

Alte Versionen dürfen nicht destruktiv überschrieben werden.

---

## 3.3 Generation Attempts

Jede KI-Operation muss einen Attempt erzeugen.

Beispiel:

```text
Attempt 1 → failed
Attempt 2 → generated
Attempt 3 → generated
```

Der Benutzer kann anschließend eine Version auswählen.

Gespeichert werden sollen nach Möglichkeit:

- Provider
- Model
- Prompt
- Parameters
- Input
- Output
- Cost
- Latency
- Error
- Timestamp

---

## 3.4 Provider-Abstraktion

Keine zentrale Business-Logik darf direkt an einen einzigen KI-Anbieter gekoppelt werden — **auch nicht an PPQ.ai.**

Beispiel:

```text
LLMProvider
 ├── PPQProvider
 └── DirectProvider (z. B. OpenAI, Anthropic, ...)

ImageProvider
 ├── PPQImageProvider
 └── DirectImageProvider

TTSProvider
 ├── PPQElevenLabsProvider
 └── DirectElevenLabsProvider

StockProvider
 ├── UnsplashProvider
 ├── PexelsProvider
 └── PixabayProvider

VideoProvider
 └── später weitere

PublishingProvider
 └── YouTubeProvider
```

---

# 4. PPQ.ai Integration — empfohlener Standardprovider

PPQ.ai soll als **empfohlener Standard-Provider** für den schnellen Einstieg eingeplant werden — nicht als verpflichtende zentrale Schicht für jede KI-Operation.

Dokumentation:

https://ppq.ai/api-docs

Die PPQ-Dokumentation beschreibt eine OpenAI-kompatible API und stellt unter anderem Chat/LLM, Web Search, Speech-to-Text, Text-to-Speech, Image Generation und Video Generation bereit. Das macht PPQ praktisch für den Start (eine Integration, viele Fähigkeiten), rechtfertigt aber keine Pflichtkopplung — Latenz, Ausfallsicherheit und Kosten von PPQ als Zwischenschicht sollten regelmäßig gegen direkte Provider-Anbindungen geprüft werden.

### Anforderungen

- Base URL konfigurierbar.
- API Key nur serverseitig.
- Modelle dynamisch konfigurierbar.
- Provider/Model/Cost pro Request protokollieren.
- Fehler und Retries protokollieren.
- Kein API Key im Client Bundle.
- Kein API Key in Git.
- Model-Auswahl nicht hart codieren, wenn die PPQ Models API verfügbar ist.
- Für jede über PPQ angebotene Fähigkeit (LLM, TTS, Image) muss mindestens ein direkter Alternativ-Provider im Adapter-Interface vorgesehen sein, auch wenn er anfangs nicht implementiert ist.

### PPQ Client

Empfohlene zentrale Komponente:

```text
PPQClient
 ├── chat()
 ├── responses()
 ├── webSearch()
 ├── generateImage()
 ├── textToSpeech()
 ├── transcribe()
 └── generateVideo()   # ab Stufe 4/optional
```

Die konkrete Implementierung soll sich an der aktuellen PPQ API-Dokumentation orientieren und nicht von heute gültigen Modellnamen abhängig sein.

---

# 5. UI / UX Anforderungen

## 5.1 Produktionspipeline

Die Oberfläche soll einen klaren Fortschritt zeigen:

```text
Research → Script → Scenes → Voiceover → Timestamps → Visuals → Edit → Publish → Analytics
```

Jede Stufe zeigt:

- Status
- Version
- Fehler
- Anzahl fertiger Elemente
- Anzahl Review-Elemente
- Blocker

## 5.2 Visual Studio

Die Visual-Ansicht soll mindestens:

- Scene-Liste
- Script/Text
- Timestamp
- Stock-Kandidaten
- KI-Kandidaten
- ausgewähltes Asset
- Prompt
- Regenerate
- Generate
- Approve
- Reject
- Version History
- Provenance
- License
- Usage History

anzeigen können.

## 5.3 Review Queue

Alle manuellen Aufgaben sollen zentral gesammelt werden:

```text
REVIEW QUEUE

3 Visuals
1 Fact
1 Thumbnail
1 Final Render
1 Policy Check
```

Der Benutzer soll nicht jede Scene einzeln durchsuchen müssen.

## 5.4 Autopilot-Level

Architektur für drei Modi:

### Manual

Jeder relevante Schritt muss bestätigt werden.

### Assisted

KI erledigt Standardaufgaben automatisch; wichtige Entscheidungen werden vorgelegt.

### Autopilot

Pipeline läuft selbstständig und stoppt nur bei Fehlern, Lizenzproblemen, Policy-Verstößen oder definierten Quality Gates.

Diese Modi müssen später pro Projekt/Kanal konfigurierbar sein — passend zum jeweiligen Durchsatzziel des Kanals (siehe Leitprinzip 11 und 6.1).

---

# 6. Multi-Channel-Architektur

Das System soll von Anfang an mehrere Kanäle ermöglichen, auch wenn Stufe 1 zunächst nur einen Kanal benötigt.

```text
Workspace
 ├── Channel A
 │    ├── Brand
 │    ├── Voice
 │    ├── Templates
 │    └── Content
 │
 ├── Channel B
 │    └── ...
 │
 └── Channel C
      └── ...
```

Ein Asset kann theoretisch in mehreren Projekten verwendet werden, aber jede Nutzung muss protokolliert werden.

Kanal-spezifisch konfigurierbar:

- Sprache
- Voice
- Branding
- Intro/Outro
- Templates
- Visual Style
- Script Style
- CTA
- YouTube Account
- Publishing Defaults
- Content-Kalender / Publishing-Kadenz

## 6.1 Content-Kalender & Kanal-Strategie (leichtgewichtig)

Die Produktvision beginnt bei "CHANNEL/STRATEGY" — dafür braucht es eine minimale, aber explizite Entität, nicht nur implizite Kanal-Einstellungen:

- **Zielkadenz** (z. B. "3 Videos/Woche") — steuert, wie viel Autopilot nötig ist.
- **Themen-/Nischenplan** — grobe Rotation, damit nicht jedes Video einzeln erdacht werden muss.
- **Anstehende/geplante Projekte** je Kanal, sichtbar als einfache Liste oder Kalenderansicht.
- Optional, spätere Ausbaustufe: Wettbewerbsbeobachtung, Trend-Tracking.

Dieser Abschnitt soll bewusst klein bleiben — er ist kein Ersatz für die Research/Idea Engine aus Stufe 2, sondern die organisatorische Klammer darüber.

---

# 7. Sicherheit

- Secrets niemals in Git.
- API Keys serverseitig.
- YouTube OAuth Tokens sicher speichern.
- Provider Credentials verschlüsselt bzw. über Secret Management.
- Benutzerberechtigungen vorbereiten.
- Audit Log für wichtige Aktionen, inklusive Policy-Gate-Entscheidungen.
- Keine privaten Credentials in Logs.
- Keine vollständigen Authorization Header loggen.

---

# 8. Kostenkontrolle

Jeder kostenpflichtige Provider-Call soll nach Möglichkeit protokollieren:

- Provider
- Model
- Request ID
- Projekt
- Scene
- Operation
- Input Tokens
- Output Tokens
- Media Units
- geschätzte Kosten
- tatsächliche Kosten, sofern API verfügbar

Damit soll später ein Dashboard möglich sein:

```text
MONTHLY COST

LLM       $...
TTS       $...
Images    $...
Video     $...
Storage   $...

TOTAL     $...
```

---

# 9. Nichtfunktionale Anforderungen

## Stabilität

Fehlgeschlagene externe Requests dürfen nicht den gesamten Produktionsjob zerstören.

## Retry

Provider Calls sollen kontrolliert wiederholbar sein.

## Idempotenz

Ein Retry darf nicht versehentlich fünf identische Assets als neue, unverbundene Objekte erzeugen.

## Observability

Jobs und Provider Calls sollen nachvollziehbar sein.

## Skalierbarkeit

Die Architektur soll später parallele Jobs ermöglichen:

```text
Project A
  Scene 01 ─┐
  Scene 02 ─┼─ parallel workers
  Scene 03 ─┤
  Scene 04 ─┘
```

## Deterministische Beziehungen

Eine Scene muss immer eindeutig mit ihrem Script-Abschnitt und ihren Assets verbunden sein.

---

# 10. Empfohlene Entwicklungsstrategie

## Phase 0 — Kick-off-Durchstich (Tage, nicht Wochen)

Siehe 2.0. Thema → Skript → grobe Szenen → ein Bild pro Szene → einfache Text/Bild-Ansicht. Minimale Asset-Metadaten, kein Graph, kein Dedup. Ziel: so früh wie möglich lernen, ob Thema/Nische/Skriptqualität tragen — das ist das eigentliche Risiko, nicht die fehlende Infrastruktur.

## Phase 1 — vollständige Stufe 1

Erst danach:

1. Project (voll)
2. Script (versioniert)
3. Scenes
4. Stock Search (3 Provider)
5. Visual Gallery
6. Manual AI Image Generation
7. Asset Registry (voll, inkl. Musik/SFX-Lizenzfelder)
8. Provenance

## Phase 2

Research automatisieren und Scriptqualität erhöhen. Content-Kalender-Grundgerüst (6.1) einführen.

## Phase 3

TTS, wahlweise über ElevenLabs direkt oder via PPQ.ai.

## Phase 4

Echter Renderer + Motion Graphics + YouTube Publishing + Policy Compliance Gate + Titel-/Thumbnail-Varianten.

## Phase 5

Analytics + Growth Intelligence + Feedback Loop, inklusive datengetriebener Titel-/Thumbnail-Optimierung.

---

# 11. Definition of Done für das Gesamtprojekt

Das Gesamtprojekt ist erst dann als vollständige AI YouTube Factory zu betrachten, wenn folgende Schleife automatisiert und nachvollziehbar funktioniert:

```text
CHANNEL
  ↓
IDEA
  ↓
RESEARCH
  ↓
SCRIPT
  ↓
SCENES
  ↓
STOCK + AI VISUALS
  ↓
TTS
  ↓
TIMESTAMPS
  ↓
MOTION GRAPHICS
  ↓
RENDER
  ↓
QA / LICENSE GATE
  ↓
POLICY COMPLIANCE GATE
  ↓
YOUTUBE UPLOAD
  ↓
YOUTUBE ANALYTICS
  ↓
AI INSIGHTS
  ↓
NEXT IDEA
```

Dabei muss für jedes veröffentlichte Video rückwärts nachvollziehbar sein:

```text
YouTube Video
 ↓
Render
 ↓
Scene
 ↓
Script
 ↓
Research
 ↓
Source
```

und für jedes Asset vorwärts:

```text
Source / Generation
 ↓
Asset
 ↓
Scene
 ↓
Render
 ↓
YouTube Video(s)
```

**Das ist eine harte Kernanforderung und kein optionales Nice-to-have.**

---

# 12. Priorität

### P0 — zwingend

- Kick-off-Durchstich (2.0)
- Stufe 1 MVP (vollständig)
- Script
- Scene Breakdown
- Stock Provider
- Visual Gallery
- AI Image Generation
- Asset Registry
- Provenance
- Versioning
- PPQ.ai-Integration als ein Provider unter mehreren

### P1 — nächste Ausbaustufe

- Research Automation
- Idea Engine
- bessere Script Engine
- Source Registry
- Content-Kalender-Grundgerüst

### P2

- TTS (ElevenLabs direkt oder via PPQ.ai)
- Audio/Scene Synchronisation

### P3

- Rendering
- Motion Graphics
- YouTube Publishing
- YouTube Policy Compliance Gate
- Titel-/Thumbnail-Varianten-Datenmodell

### P4

- Analytics
- Retention
- CTR
- Cost/Profit
- AI Growth Recommendations
- Datengetriebene Titel-/Thumbnail-Optimierung

---

# 13. Wichtige Produktentscheidung

Das System soll **nicht** als "one-click AI slop generator" entwickelt werden.

Das Ziel ist eine professionelle, kontrollierbare Produktionsumgebung:

> **KI erzeugt Vorschläge und Assets. Das System hält Versionen, Quellen, Kosten, Lizenzen, Entscheidungen und Nutzungen sauber zusammen.**

Der Benutzer soll jederzeit verstehen können:

- Was wurde erzeugt?
- Warum wurde es erzeugt?
- Welcher Provider hat es erzeugt?
- Was hat es gekostet?
- Woher stammt es?
- Welche Version ist aktiv?
- Wer hat es freigegeben?
- In welchem Video wurde es verwendet?
- Verstößt es gegen YouTubes Richtlinien zu formelhaftem/automatisiertem Content?

Damit entsteht langfristig keine reine Video-App, sondern ein **Content Operating System für faceless YouTube-Kanäle** — eines, das schnell zum ersten echten Video kommt und danach kontrolliert wächst, statt zuerst die perfekte Architektur zu bauen.
