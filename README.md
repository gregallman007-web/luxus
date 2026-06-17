# Luxus Lifestyle Management — Website

One-page marketing site (Graphite Noir), static HTML/CSS/JS. No build step. All images are WebP.

## Files
| File | Purpose |
|---|---|
| `index.html` | The one-page site (hero → stats → services → how it works → about → memberships → testimonials → contact → footer). |
| `site.css` | Full design system: tokens, fluid type scale, components, responsive rules. |
| `site.js` | Header state, mobile menu, scroll-reveal, stat counters, liquid-gold WebGL hero. |
| `privacy.html` · `terms.html` | Legal pages (linked from the footer). |
| `images/` | Founder & testimonial portraits (WebP). |

## Deploy on GitHub Pages
1. Upload the **contents of this folder** to your repo root (keep the folder structure).
2. Repo **Settings → Pages → Deploy from a branch**.
3. Branch **main**, folder **/ (root)**, then **Save**.
4. Live at `https://<username>.github.io/<repo>/` in ~1 minute.

Fonts (Cormorant Garamond + Archivo) load from Google Fonts; everything else is local. The hero degrades to a static gold gradient if WebGL is unavailable, and all motion respects `prefers-reduced-motion`.

## Building in Elementor Pro / Fluent Forms
Recreate sections as Elementor containers using the tokens in `site.css`; drop the hero markup + shader (from `site.js`) into an HTML widget; replace the placeholder `<form>` in the contact section with your **Fluent Forms** widget (the field set already matches).
