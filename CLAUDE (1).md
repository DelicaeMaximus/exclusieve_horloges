# CLAUDE.md — BennAI Frontend Regels

## Altijd als eerste doen
- **Laad de `frontend-design` skill** vóór het schrijven van frontend code, elke sessie, geen uitzonderingen.

## Referentie-afbeeldingen
- Als er een referentie-afbeelding is: kopieer de layout, spacing, typografie en kleuren exact. Gebruik placeholder-content (`https://placehold.co/` voor afbeeldingen, generieke tekst). Verbeter of voeg niets toe aan het ontwerp.
- Als er geen referentie is: ontwerp from scratch met hoge kwaliteit (zie guardrails hieronder).
- Maak een screenshot, vergelijk met de referentie, herstel afwijkingen, maak opnieuw een screenshot. Doe minimaal 2 vergelijkingsrondes. Stop alleen als er geen zichtbare verschillen meer zijn of als Rick het zegt.

## Lokale server
- **Altijd serveren via localhost** — maak nooit een screenshot van een `file:///` URL.
- Start de dev server: `node serve.mjs` (serveert de projectroot op `http://localhost:3000`)
- `serve.mjs` staat in de projectroot. Start het op de achtergrond vóór screenshots.
- Als de server al draait, start dan geen tweede instantie.

## Screenshot workflow
- Puppeteer is geïnstalleerd op `C:/Users/nateh/AppData/Local/Temp/puppeteer-test/`. Chrome cache staat op `C:/Users/nateh/.cache/puppeteer/`.
- **Altijd screenshotten via localhost:** `node screenshot.mjs http://localhost:3000`
- Screenshots worden automatisch opgeslagen in `./temporary screenshots/screenshot-N.png` (auto-incrementeel, nooit overschreven).
- Optioneel label: `node screenshot.mjs http://localhost:3000 label` → slaat op als `screenshot-N-label.png`
- `screenshot.mjs` staat in de projectroot. Gebruik het zoals het is.
- Na het screenshotten, lees de PNG uit `temporary screenshots/` met de Read tool — Claude kan de afbeelding direct bekijken en analyseren.
- Wees specifiek bij vergelijkingen: "heading is 32px maar referentie toont ~24px", "card gap is 16px maar moet 24px zijn"
- Check: spacing/padding, font size/gewicht/line-height, kleuren (exacte hex), uitlijning, border-radius, schaduwen, afbeeldingsformaten

## Output standaarden
- Één `index.html` bestand, alle stijlen inline, tenzij Niels anders aangeeft
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Placeholder afbeeldingen: `https://placehold.co/BREEDTExHOOGTE`
- Mobile-first responsive

## Niels Brand Assets
- Controleer altijd de `brand_assets/` map vóór het ontwerpen. Deze kan logo's, kleurengidsen, stijlgidsen of afbeeldingen bevatten.
- Als er assets aanwezig zijn, gebruik ze dan. Gebruik geen placeholders waar echte assets beschikbaar zijn.
- Als er een logo aanwezig is, gebruik het. Als er een kleurenpalet is gedefinieerd, gebruik exact die waarden — verzin geen merkkleuren.
- **Niels huisstijl:** Donker, modern, tech-forward. Denk aan diepzwart/antraciet als basis, met een scherpe accentkleur (controleer `brand_assets/` voor exacte waarden). Uitstraling: premium, betrouwbaar, Dutch AI authority.

## Anti-generieke guardrails
- **Kleuren:** Gebruik nooit het standaard Tailwind-palet (indigo-500, blue-600, etc.). Kies een aangepaste BennAI brandkleur en leid van daaruit af.
- **Schaduwen:** Nooit vlakke `shadow-md`. Gebruik gelaagde, kleurgetinte schaduwen met lage opacity.
- **Typografie:** Nooit hetzelfde font voor headings en body. Combineer een display/serif met een strak sans-serif. Pas strakke tracking toe (`-0.03em`) op grote headings, ruime line-height (`1.7`) op body.
- **Gradients:** Laag meerdere radiale gradients. Voeg grain/textuur toe via SVG noise filter voor diepte.
- **Animaties:** Animeer alleen `transform` en `opacity`. Nooit `transition-all`. Gebruik spring-stijl easing.
- **Interactieve states:** Elk klikbaar element heeft hover-, focus-visible- en active-states. Geen uitzonderingen.
- **Afbeeldingen:** Voeg een gradient overlay toe (`bg-gradient-to-t from-black/60`) en een kleurbehandelingslaag met `mix-blend-multiply`.
- **Spacing:** Gebruik bewuste, consistente spacing tokens — geen willekeurige Tailwind-stappen.
- **Diepte:** Vlakken moeten een lagensysteem hebben (basis → verhoogd → zwevend), niet allemaal op hetzelfde z-vlak.

## Harde regels
- Voeg geen secties, features of content toe die niet in de referentie staan
- "Verbeter" een referentieontwerp niet — kopieer het
- Stop niet na één screenshot-ronde
- Gebruik geen `transition-all`
- Gebruik geen standaard Tailwind blauw/indigo als primaire kleur
- Schrijf alle commentaar en variabelenamen in het Engels, maar communiceer met Rick in het Nederlands
