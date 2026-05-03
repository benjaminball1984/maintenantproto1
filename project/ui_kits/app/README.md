# Maintenant! App — UI Kit

High-fidelity recreation of the Maintenant! / THE99COINPROJECT mobile-first civic platform.

## Usage
Open `index.html` to explore the interactive prototype.

## Components
- `Layout.jsx` — sticky header, mobile bottom nav, footer
- `HomePage.jsx` — hero + stats + petition feed
- `PetitionCard.jsx` — petition card with progress bar
- `ServicesPage.jsx` — services hub mosaic
- `CreerPage.jsx` — creation mosaic (11 tiles)

## Design tokens
All colors/fonts reference `../../colors_and_type.css`.

## Notes
- Icons: lucide-react CDN (unpkg.com/lucide@latest)
- Fonts: Sora (headings) + Inter (body) via Google Fonts
- Dark mode via `prefers-color-scheme`
- Mobile-first; test at 375px width
