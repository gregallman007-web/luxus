# Luxus Lifestyle Management — Website

One-page marketing site (Graphite Noir), static HTML/CSS/JS. No build step.

## Files
| File | Purpose |
|---|---|
| `index.html` | The one-page site (hero → stats → services → how it works → about → memberships → testimonials → contact → footer). |
| `site.css` | Full design system: tokens, fluid type scale, components, responsive rules. |
| `site.js` | Header state, mobile menu, scroll-reveal, stat counters, liquid-gold WebGL hero. |
| `privacy.html` · `terms.html` | Legal pages (linked from the footer). |
| `images/` | Photography, founder & testimonial portraits, the gold X mark, service stills. |

## Deploy on GitHub Pages
1. Upload the **contents of this folder** to your repo root (keep the folder structure — `index.html`, `site.css`, `site.js`, `privacy.html`, `terms.html`, and the `images/` folder).
2. Repo **Settings → Pages → Deploy from a branch**.
3. Branch **main**, folder **/ (root)**, then **Save**.
4. Live at `https://<username>.github.io/<repo>/` in ~1 minute.

Fonts (Cormorant Garamond + Archivo) load from Google Fonts; everything else is local. The hero degrades to a static gold gradient if WebGL is unavailable, and all motion respects `prefers-reduced-motion`.

## Building in Elementor Pro / Fluent Forms
This is the design + behaviour reference. Recreate sections as Elementor containers using the tokens in `site.css`; drop the hero markup + shader (from `site.js`) into an HTML widget; and replace the placeholder `<form>` in the contact section with your **Fluent Forms** widget (the field set already matches).
