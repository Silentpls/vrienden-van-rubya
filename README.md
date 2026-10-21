# Stichting Vrienden van Rubya, website

Statische site (HTML/CSS/JS, geen externe diensten). Bouwen: `node build.mjs`. Teksten staan in `build.mjs` en `legal.mjs`.

## Klant moet invullen (zoek op `[` in `legal.mjs`, dan `node build.mjs`)
| Placeholder | Waar |
|---|---|
| `[KVK-NUMMER]` | Colofon (contact.html#colofon) en privacyverklaring |
| `[BTW-NUMMER]` | Colofon. Niet btw-plichtig? Vervang door "Niet btw-plichtig" |
| `[TELEFOONNUMMER]` | Colofon |

## Controleren door klant
- Bewaartermijnen en grondslagen in de privacyverklaring (contact 12 maanden, serverlogs 30 dagen): kloppen die met de praktijk? Hostingpartij en e-mailaanbieder: verwerkersovereenkomst afsluiten.
- Nieuwsbrief: zorg dat elke mail een afmeldlink bevat en dat alleen aangemelde mensen mail krijgen.
- Rechten op foto's: zie `CREDITS.md`.
- Het formulier opent het e-mailprogramma (mailto), geen server nodig. Wilt u een echt formulier, kies dan een EU-verwerker en werk de privacyverklaring bij.

## Livezetten
- HTTPS verplicht. Security headers: `_headers` (Netlify / Cloudflare Pages) of `.htaccess` (Apache). **GitHub Pages leest deze bestanden niet**; gebruik daar een andere host voor productie.
- `404.html` gebruikt relatieve paden; zet de site in de root van het domein.
- Geen cookies, dus geen cookiebanner. Gaat u later analytics, kaarten of video's toevoegen: eerst toestemmingsbanner (Accepteren en Weigeren even prominent), scripts pas daarna laden, en privacyverklaring bijwerken.

## Webshop
Niet van toepassing: alleen giften via bankoverschrijving, geen verkoop.
