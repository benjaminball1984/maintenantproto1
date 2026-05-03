# Maintenant! Design System
> THE99COINPROJECT · Plateforme de mobilisation citoyenne

---

## OVERVIEW

**Maintenant!** ("Now!" in French) is a French-language civic mobilization platform built by **THE99COINPROJECT** — a movement positioning itself as the voice of "the 99%". The tagline is *"Face aux oppressions systémiques, nos luttes doivent devenir systémiques. Ils ont des milliards, soyons des millions !"* ("They have billions, let us be millions!").

The app is a mobile-first PWA covering: petitions, crowdfunding (solidarity, strike funds, participatory budgets), events/mobilizations, a social network (/Reseau), mutual-aid services (lending objects, carpooling, housing, SEL time-bank, fruit/veg exchange, marketplace), a blog/media, and an integrated crypto token (T99CP on Polygon).

**Source repository:** `github.com/benjaminball1984/maintenant` (Base44 / React 18 / Tailwind)  
**Stack:** React 18, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Base44 BaaS, Stripe (live), T99CP/Polygon

---

## PRODUCTS

| Product | Route | Notes |
|---------|-------|-------|
| Home / Petitions | `/Home` | Main landing; petition feed + stats |
| Mobilizations | `/MobilizationCalendar` | Events & mobilization calendar |
| Crowdfunding | `/CrowdFunding` | 4 tabs: Solidaires, Luttes, Participatif, Grandes Caisses |
| Services | `/Services` | Hub for mutual-aid services |
| Réseau Social | `/Reseau` | Auth-required Facebook-like social network |
| Creator tools | `/Creer` | Mosaic of 11 creation tiles |
| Campaigns | `/Campagnes` | Campaign pages (in progress) |
| Media | `/MaintentantMedia` | Blog / media articles |
| Back-office | `/BackOffice` | Admin panel |

---

## CONTENT FUNDAMENTALS

**Language:** French exclusively. Informal but passionate. Uses "vous" in legal contexts and "on" colloquially.  
**Tone:** Urgent, inclusive, solidarity-driven. Never cold or corporate. The movement speaks to and for ordinary people.  
**Casing:** Sentence-case headings. Never ALL-CAPS except in short badges/pills.  
**Emoji:** Used sparingly in mosaic/tile labels (📜 📅 💰 🤲 etc.) but absent from body copy and UI chrome.  
**Punctuation:** French spacing rules — space before `!`, `?`, `:`, `;`. Em-dashes used liberally.  
**Voice:** "Nous" (we) for the movement. "Vous" for addressing the user in CTAs. Never "I/Je".  
**Key phrases:** "Maintenant !", "La voix des 99%", "Moment Solidaire", "Mobilisation citoyenne", "Nos luttes deviennent systémiques."  
**CTAs:** Action-forward verbs — "Créer une pétition", "Adhérer", "Rejoindre", "Signer", "Soutenir".  
**Numbers:** Large stats displayed with animated counters. Real data preferred (946 membres, 10 583 abonnés).  

---

## VISUAL FOUNDATIONS

### Colors
- **Primary red:** `#C1121F` — the brand anchor, used in hero gradients, active nav, CTAs
- **Accent orange:** `#F4721E` — gradient endpoint, energy, highlight
- **Hero gradient:** `linear-gradient(135deg, #C1121F → #E63946 → #F4721E)` — used in splash, hero sections, action buttons
- **Neutral background:** `#F9FAFB` (gray-50) light, `#111827` (gray-900) dark
- **Card background:** `#FFFFFF` / dark `#111827`
- **Border:** `hsl(220 13% 90%)` — very subtle cool-gray
- **Muted text:** `hsl(220 10% 52%)`
- **Destructive:** standard red `hsl(0 84% 60%)`

### Typography
- **Display / Headings:** `Sora` (Google Fonts) — weights 700/800, letter-spacing `-0.02em`
- **Body:** `Inter` (Google Fonts) — weights 300–900, `-webkit-font-smoothing: antialiased`
- **Heading sizes:** 7xl (hero) → 5xl → 4xl → 3xl → 2xl → xl on desktop; scale down ~1 step on mobile
- **Body:** 15–16px on mobile, leading-relaxed (`1.625`)
- **No monospace font** used in the UI

### Spacing & Layout
- **Max container:** `max-w-6xl` (1152px) / `max-w-7xl` (1280px) for header
- **Card padding:** `p-5` / `p-6`
- **Section vertical rhythm:** `py-12` → `py-16` → `py-20`
- **Mobile container padding:** `px-3` → `px-4` → `px-6`

### Border Radius
- **Cards:** `rounded-2xl` (1rem)
- **Pills / buttons:** `rounded-full`
- **Small UI elements:** `rounded-xl` (0.75rem)
- **CSS var:** `--radius: 0.875rem` → Tailwind `lg/md/sm` map to it

### Shadows
- **Card default:** none / very light border
- **Card hover:** `box-shadow: 0 8px 30px rgba(0,0,0,0.10)` + `translateY(-2px)` 0.2s ease
- **Action button:** `shadow-xl shadow-red-500/30`
- **Dropdown / modal:** `shadow-xl`

### Backgrounds & Imagery
- **Hero:** Full-width gradient with subtle background photo at `opacity-10`, then gradient overlay at 97%
- **Decorative blobs:** Large blurred circles (`blur-3xl`) in white/5 or orange/20 — used in hero background
- **Wave divider SVG:** At bottom of hero section transitioning into gray-50
- **Cards:** White on gray-50 background; no background images on cards
- **No hand-drawn illustrations** evident; no textures or patterns

### Animation
- **Library:** Framer Motion
- **Page entrance:** `opacity: 0 → 1, y: 30 → 0`, duration `0.6–0.7s`
- **Scroll reveal:** `whileInView={{ opacity: 1, y: 0 }}`, `viewport={{ once: true }}`
- **Hover lift:** `whileHover={{ y: -1 }}`, buttons `whileHover={{ scale: 1.05 }}`
- **Tap feedback:** `whileTap={{ scale: 0.95–0.97 }}`
- **Nav indicator:** `layoutId="activeNav"` shared layout animation
- **Splash:** `splashPop` keyframe — scale 0.6→1, opacity 0→1, cubic-bezier(0.34,1.56,0.64,1) — bouncy
- **Accordion:** 0.2s ease-out
- **No looping animations** in main UI (only loading spinners)

### Hover & Press States
- **Nav links:** `hover:bg-gray-100` on desktop; active = gradient pill
- **Buttons:** `hover:scale-105` on primary CTAs; `hover:bg-primary/90` on standard
- **Cards:** translateY(-2px) + deeper shadow
- **Links:** `hover:text-red-600` for footer/inline links
- **Destructive:** `hover:bg-red-50` background tint

### Mobile / PWA
- **Mobile-first** with `xs: 375px` breakpoint below `sm`
- **Bottom nav:** Fixed, 4 items (Accueil / Services / **+** floating action / Profil)
- **FAB:** Floating `+` button raised `-top-3`, `rounded-full`, gradient with `shadow-xl shadow-red-500/40`
- **Touch targets:** `min-height: 48px` on mobile interactive elements
- **Safe areas:** `env(safe-area-inset-*)` used throughout
- **Pull-to-refresh:** Custom touch gesture implementation

### Dark Mode
- Triggered by `prefers-color-scheme: dark`
- Backgrounds flip to `gray-900`, cards to same
- Borders: `gray-800`; text: `gray-100/200`
- Colors remain the same; primary red unchanged

### Color of Imagery
- Background photos (unsplash) used at very low opacity (10%) in hero — desaturated by overlay
- No specific color grade on imagery

---

## ICONOGRAPHY

**Library:** `lucide-react` **exclusively** — no Heroicons, no FontAwesome, no emoji as icons in chrome.  
**Style:** Thin stroke (1.5px default), 16×16 or 20×20 in nav, 24×24 in feature tiles.  
**Usage pattern:** Icons always paired with text labels in nav and buttons. Stand-alone icons only in icon-buttons with aria-labels.  
**Tile emoji:** The `/Creer` creation mosaic uses emoji (📜 📅 💰 etc.) in tile labels — the only sanctioned emoji-as-icon use.  
**CDN:** `lucide-react` npm package; for HTML prototypes use `https://unpkg.com/lucide@latest` or inline SVGs.

### Key icons used
`Home`, `Calendar`, `Heart`, `Coins`, `LayoutGrid`, `Bell`, `Plus`, `User`, `Search`, `TrendingUp`, `Sparkles`, `ArrowRight`, `Users`, `RefreshCw`, `Menu`, `X`, `Settings`, `LogOut`, `ChevronDown`, `Mail`

---

## FILES IN THIS DESIGN SYSTEM

```
README.md                    ← this file
SKILL.md                     ← agent skill descriptor
colors_and_type.css          ← CSS custom properties (colors, type, spacing, radii)
assets/
  logo.jpg                   ← THE99COINPROJECT / Maintenant! logo
preview/
  colors-primary.html        ← primary + accent color swatches
  colors-neutral.html        ← neutral / semantic color swatches
  type-scale.html            ← heading scale (Sora)
  type-body.html             ← body scale (Inter)
  spacing-radius.html        ← border radius tokens
  spacing-shadows.html       ← shadow system
  components-buttons.html    ← button variants
  components-badges.html     ← badge variants
  components-cards.html      ← card patterns
  components-inputs.html     ← form inputs
  components-nav.html        ← nav header + bottom bar
  brand-logo.html            ← logo + splash screen
  brand-hero.html            ← hero section pattern
ui_kits/
  app/
    README.md
    index.html               ← Maintenant! app UI kit
    Layout.jsx               ← Header + BottomNav components
    HomePage.jsx             ← Home / petition feed
    PetitionCard.jsx         ← Petition card component
    ServicesPage.jsx         ← Services hub
    CreerPage.jsx            ← Creation mosaic
```
