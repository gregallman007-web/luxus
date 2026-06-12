# Luxus — Hero Concepts

Twelve full-bleed magazine-cover hero directions for the Luxus homepage,
in the Graphite Noir style. Mostly static HTML/CSS — no build step. Two carry
motion: **The Reverie** (#10) uses a looping background video, and **The Alchemy**
(#12) is a generative, cursor-reactive WebGL “liquid gold” field (GSAP entrance).
All stills carry a cinematic colour grade, an animated gold nav underline,
hover-sweep CTAs, and a slow ken-burns drift (disabled under prefers-reduced-motion).

## View locally
Open `index.html` in a browser. Click any concept to view it full-screen;
use the "← All concepts" chip (bottom-left) to return.

## Deploy on GitHub Pages
1. Create a repo and upload the **contents of this folder** to the root
   (`index.html`, `hero.css`, `liquid-gold.js`, `01.html`–`12.html`, the `images/` and `media/` folders).
2. Repo **Settings → Pages → Build and deployment → Deploy from a branch**.
3. Branch **main**, folder **/ (root)**, then **Save**.
4. Live at `https://<username>.github.io/<repo>/` in ~1 minute.

## The eleven directions
| # | Name | Image | Idea |
|---|------|-------|------|
| 01 | The Masthead Cover | Cliffside villa | Centred masthead · italic title · spinning seal |
| 02 | The Split Crop | NYC penthouse | Colossal title across the architecture |
| 03 | The Vertical Spine | Private jet | Stacked edge nav · members seal |
| 04 | Centred Symmetry | Stone pool | Title in the vanishing point |
| 05 | The Broadsheet | Yacht bow | Title in the sky · nav at the foot |
| 06 | Sidebar Folio | Private dining | Content block in the right rail |
| 07 | The Whisper | Grotto pool | Ultra-minimal · one word |
| 08 | The Framed Edition | Spa | Inset gold frame · cover masthead |
| 09 | The Dateline | Monaco at night | Split top bar · colossal title bottom-left |
| 10 | The Reverie | Jet cabin (video) | Full-bleed motion · centred lower-third title |
| 11 | The Contents | Private island | Dark folio rail · numbered index |
| 12 | The Alchemy | Generative (WebGL) | Cursor-reactive molten liquid-gold field · GSAP |

### Elementor / WordPress note
The Alchemy (#12) is built to drop into an Elementor **HTML widget**: paste the
body markup, load `hero.css` + GSAP (CDN) + `liquid-gold.js`. The effect is a
single full-bleed `<canvas>` (WebGL1) with the editorial type as ordinary HTML
over it — no images required, and it degrades to a static gold gradient if WebGL
is unavailable.

Fonts (Cormorant Garamond + Archivo) load from Google Fonts, so an internet
connection is needed for the exact typography.
