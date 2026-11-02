# Implementation Plan — Consistent Hover Style Across All Cards

Goal: make every hoverable card / list-item tile across the site use the exact
same hover style as the "Tim Kami" member card in `TeamSection.tsx`.

Project root: `d:\CODINGAN\PORTOFOLIO\devsepctra-company`
Build: Next.js 16 / Tailwind v4 / TypeScript 5 (`package.json` has no `test` script).

---

## 1. Reference (gold standard) — `app/components/TeamSection.tsx`

The member card `<Reveal className="...">` verbatim:

```
group flex items-center gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg
```

### Target hover set (the 5 classes every card must end with)

```
transition-all duration-300
hover:-translate-y-1
hover:border-blue-300 dark:hover:border-blue-700/60
hover:bg-zinc-100 dark:hover:bg-zinc-900/70
hover:shadow-lg
```

### Required base (so hover contrast works)

```
border border-zinc-200 dark:border-zinc-800
bg-zinc-50 dark:bg-zinc-900/40   (or equivalent, e.g. bg-zinc-50/80, bg-white, bg-zinc-50/...)
```

If a card already has a different base bg/border, KEEP that base and just apply
the target hover set. If a card has NO base border/bg (only `toolCardLink`),
ADD `border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40`.

---

## 2. CRITICAL: remove `card-hover` from the 3 dummyStyles card strings

`app/globals.css` defines a global `.card-hover` helper as **unlayered** CSS:

```
.card-hover { transition: transform .25s ..., box-shadow .25s ..., border-color .25s ease; }
.card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 32px -4px rgba(0,0,0,.18), 0 4px 8px -2px rgba(0,0,0,.1); }
```

Tailwind v4 puts its `hover:*` utilities inside the `utilities` cascade layer.
Unlayered CSS **beats** layered CSS regardless of specificity, so while a card
still carries `card-hover`, the target `hover:-translate-y-1` and `hover:shadow-lg`
utilities are overridden and never take effect. The gold-standard card does NOT
use `card-hover`. Therefore: **delete the trailing `card-hover` token from every
card string that has it**, and let the explicit Tailwind hover utilities drive
the hover. (`btn-hover`, `nav-hover`, `link-hover`, `icon-hover` are untouched —
they only apply to buttons/nav/links, which are out of scope.)

`card-hover` appears only in 3 strings in `public/dummyStyles.ts` (confirmed by
grep: no page/component applies `card-hover` directly via className).

---

## 3. Edits — file by file (9 card/tile definitions)

For each: base status, exact CURRENT string, exact TARGET string.

### 3.1 `public/dummyStyles.ts` — `projectStyles.projectCard`
Base: already has `border border-zinc-200 dark:border-zinc-800` + `bg-zinc-50 dark:bg-zinc-900/50` (equivalent). OK.

CURRENT:
```
"group relative h-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:shadow-2xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-950/50 card-hover"
```
TARGET:
```
"group relative h-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg"
```
Changes: add `hover:-translate-y-1`; `hover:border-zinc-300 dark:hover:border-zinc-700` → blue pair; `hover:bg-zinc-100 dark:hover:bg-zinc-900` → add `/70`; `hover:shadow-2xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-950/50` → `hover:shadow-lg`; drop `card-hover`.
Consumed by: `app/projects/page.tsx` `<Reveal as="article" className={p.projectCard}>`.

### 3.2 `public/dummyStyles.ts` — `contactPageStyles.contactCard`
Base: already has `border border-zinc-200 dark:border-zinc-800` + `bg-zinc-50 dark:bg-zinc-900/30` (equivalent). OK.

CURRENT:
```
"group flex items-center gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 p-4 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 card-hover"
```
TARGET:
```
"group flex items-center gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg"
```
Changes: `transition-all` → `transition-all duration-300`; add `hover:-translate-y-1`; border hover → blue; `hover:bg-zinc-100 dark:hover:bg-zinc-900/50` → `/70`; add `hover:shadow-lg`; drop `card-hover`.
Consumed by: `app/contact/page.tsx` — the 3 contact method `<a className={c.contactCard}>` (TikTok, Instagram, Phone). These ARE the "contact method cards" the brief names.

### 3.3 `public/dummyStyles.ts` — `toolsPageStyles.toolCardLink`
Base: MISSING border/bg — ADD them (per brief, base must have border+bg so hover contrast works). NOTE: this gives the tool tiles a permanent light bg + 1px border they did not have before (visible but intended for consistency).

CURRENT:
```
"group flex w-full cursor-pointer items-center gap-4 rounded-xl p-4 transition-all duration-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/30 card-hover"
```
TARGET:
```
"group flex w-full cursor-pointer items-center gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg"
```
Changes: ADD base `border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40`; keep `transition-all duration-300`; add `hover:-translate-y-1`; add blue border hover; `hover:bg-zinc-100 dark:hover:bg-zinc-900/30` → `/70`; add `hover:shadow-lg`; drop `card-hover`.
Consumed by: `app/tools/page.tsx` `<Reveal className={tl.toolCardLink}>` (the IT tools grid).

### 3.4 `app/page.tsx` — Sejarah history card (the `<Reveal as="article">` inside `history.map(...)`)
Base: has `border border-zinc-200 dark:border-zinc-800` + `bg-zinc-50/80 dark:bg-zinc-900/40` (equivalent). OK.

CURRENT:
```
"group overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/40 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl hover:shadow-zinc-200/40 dark:hover:shadow-black/40"
```
TARGET:
```
"group overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/40 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg"
```
Changes: keep `hover:-translate-y-1`; border hover → blue; add `hover:bg-zinc-100 dark:hover:bg-zinc-900/70`; `hover:shadow-xl hover:shadow-zinc-200/40 dark:hover:shadow-black/40` → `hover:shadow-lg`.

### 3.5 `app/experience/page.tsx` — `AwardCard` return `<div>`
Base: different/dynamic — `border ${award.ringColor} ring-1 ${award.bgColor}`. KEEP this base (per brief: different base → keep, add hover). Do NOT replace the dynamic border/bg.

CURRENT (template literal):
```
`group relative flex flex-col gap-3 rounded-2xl border ${award.ringColor} ring-1 ${award.bgColor} p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-black/30`
```
TARGET:
```
`group relative flex flex-col gap-3 rounded-2xl border ${award.ringColor} ring-1 ${award.bgColor} p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg`
```
Changes: keep `transition-all duration-300` + `hover:-translate-y-1`; ADD blue border hover; ADD `hover:bg-zinc-100 dark:hover:bg-zinc-900/70`; `hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-black/30` → `hover:shadow-lg` (drop the colored tint). Keep the inner `<a>` (Xayara link) and trophy icon unchanged.

### 3.6 `app/tools/page.tsx` — `SkillCard` return `<div>` (used for itSkills + mediaSkills)
Base: has `border border-zinc-200 dark:border-zinc-800` + `bg-white dark:bg-zinc-900/40` (equivalent). OK.

CURRENT:
```
"group flex gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-black/30"
```
TARGET:
```
"group flex gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg"
```
Changes: border hover → blue; add `hover:bg-zinc-100 dark:hover:bg-zinc-900/70`; drop colored shadow tint, keep `hover:shadow-lg`.

### 3.7 `app/tools/page.tsx` — mediaTools card `<div>` (inside `mediaTools.map(...)`)
Base: has `border border-zinc-200 dark:border-zinc-800` + `bg-white dark:bg-zinc-900/40` (equivalent). OK.

CURRENT:
```
"group flex items-center gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-200/40 dark:hover:shadow-black/30"
```
TARGET:
```
"group flex items-center gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg"
```
Changes: same pattern as 3.6.

### 3.8 `app/components/ClientsCarousel.tsx` — client logo tile `<div>` (inside the doubled `clients.map`)
Base: has `border border-zinc-200 dark:border-zinc-800` + `bg-white dark:bg-zinc-900/60` (equivalent); keep base `shadow-sm`. OK.

CURRENT:
```
"group flex h-24 w-36 flex-shrink-0 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-black/40"
```
TARGET:
```
"group flex h-24 w-36 flex-shrink-0 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg"
```
Changes: `hover:border-zinc-300 dark:hover:border-zinc-600` → blue; add `hover:bg-zinc-100 dark:hover:bg-zinc-900/70`; drop colored shadow tint, keep `hover:shadow-lg`. Do NOT touch the Prev/Next carousel `<button>`s (icon buttons, out of scope).

### 3.9 `app/components/TestimonialsCarousel.tsx` — testimonial card `<div>` (inside the doubled `all.map`)
Base: has `border border-zinc-200 dark:border-zinc-800` + `bg-white dark:bg-zinc-900/60` (equivalent); keep base `shadow-sm`. Currently NO hover at all — add the full target set.

CURRENT:
```
"flex w-72 flex-shrink-0 flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 shadow-sm transition-colors"
```
TARGET:
```
"flex w-72 flex-shrink-0 flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg"
```
Changes: `transition-colors` → `transition-all duration-300` (needed so translate/shadow/border animate); add all 5 hover utilities. The card lives inside the `animate-marquee` track which pauses on hover, so the lift is safe. Do NOT touch the Prev/Next `<button>`s.

---

## 4. EXCLUDED (do NOT change) — with rationale

- `app/components/TeamSection.tsx` member card — it IS the gold standard; already correct.
- `app/about/page.tsx` — no inline cards. Uses `<TeamSection />` (gold standard) plus `interestItem`, `techPill`, `contentLink`, `primaryButton`, `secondaryButton` — all pills / text links / buttons, not cards. No edits.
- `app/admin/page.tsx` — EXCLUDED (admin page, per brief).
- `app/login/page.tsx` — EXCLUDED (auth/login, per brief).
- `app/page.tsx` "Berbadan Hukum" `<a>` badge — emerald-themed CTA link to a PDF (arrow icon, `hover:-translate-y-0.5`, emerald border/bg/shadow). It is a call-to-action link, not a content card; recoloring it to blue/zinc would break its deliberate "verified" theme. Leave as is.
- `app/page.tsx` "Lokasi Kami" map container (`group/map` Reveal wrapping the iframe) — a map embed, not a content card/tile; it already uses `hover:-translate-y-1 hover:border-blue-300 ...` with a deliberately stronger `hover:shadow-2xl` and inner shimmer/iframe-scale. Leave as is.
- Nav links, sidebar items, footer links, `ProjectFilter` nav rows/chevron, `LogoLink` avatar — nav/links, excluded.
- Carousel Prev/Next buttons (`ClientsCarousel`, `TestimonialsCarousel`), `ScrollButtons` floating buttons, project `bookmarkButton`, all submit/close/"Kirim pesan lain"/"Beri penilaian lain" buttons — buttons / icon buttons, excluded.
- `techPill`, `interestItem`, tag spans, experience stat-strip items — pills/tags/plain tiles, not cards, excluded.
- `globals.css` `.card-hover` / `.btn-hover` / `.nav-hover` / `.link-hover` / `.icon-hover` definitions — do NOT edit the CSS. Only remove the `card-hover` *token* from the 3 card class strings in `dummyStyles.ts` (section 2 + 3.1–3.3). The CSS rule can stay; it simply no longer matches those cards. (It still matches nothing in pages/components, confirmed by grep.)
- `Reveal.tsx` — do not modify; it forwards `className` and adds entrance-animation classes only.

---

## 5. Global rules to follow while editing

- Do NOT change layout, spacing, font sizes, or any non-hover class.
- Keep all existing base bg/border (even if different from zinc-50/zinc-200) — only `toolCardLink` gets a NEW base (section 3.3).
- Replace conflicting `hover:border-*` (zinc) with the blue pair; replace `hover:shadow-xl`/colored shadow tints with plain `hover:shadow-lg`; drop `card-hover`.
- `transition-colors` → `transition-all duration-300` only where the card needs to animate transform/shadow (testimonial card 3.9). `transition-all` (no duration) → `transition-all duration-300` (contactCard 3.2).
- TypeScript must stay clean.

---

## 6. Verification (PowerShell-compatible; use `;` not `&&`)

1. Type check:
   ```
   npx tsc --noEmit
   ```
   Expected: exit 0, no errors.

2. Production build:
   ```
   npm run build
   ```
   Expected: exit 0, Next.js build succeeds (route compilation, no type/lint failures).

3. Confirm every updated card/tile carries the key hover classes (presence check across the edited files):
   ```
   Select-String -Path "public\dummyStyles.ts","app\page.tsx","app\experience\page.tsx","app\tools\page.tsx","app\components\ClientsCarousel.tsx","app\components\TestimonialsCarousel.tsx" -Pattern "hover:-translate-y-1","hover:border-blue-300","hover:shadow-lg"
   ```
   Expected: each of the 9 card/tile definitions matches all three patterns.

4. Confirm `card-hover` is gone from the 3 dummyStyles card strings:
   ```
   Select-String -Path "public\dummyStyles.ts" -Pattern "card-hover"
   ```
   Expected: no matches in `projectCard`, `contactCard`, or `toolCardLink` (the only prior occurrences).

5. (Optional) `npm run dev` and visually hover one card on each page (Home history, Projects, Experience awards, Tools, Contact, client/testimonial carousels) — all should lift 4px, gain a blue border, a zinc-100 bg, and a shadow-lg, identical to the Tim Kami cards.

---

## 7. Summary of work

9 card/tile class definitions to update, in 6 files:
- `public/dummyStyles.ts` — 3 strings (projectCard, contactCard, toolCardLink; also drop `card-hover`).
- `app/page.tsx` — 1 (Sejarah article).
- `app/experience/page.tsx` — 1 (AwardCard).
- `app/tools/page.tsx` — 2 (SkillCard, mediaTools card).
- `app/components/ClientsCarousel.tsx` — 1 (client logo tile).
- `app/components/TestimonialsCarousel.tsx` — 1 (testimonial card; gains hover it currently lacks).
