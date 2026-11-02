# Hover-Style Verification Note

Workdir: `d:\CODINGAN\PORTOFOLIO\devsepctra-company`
Task: Apply the "Tim Kami" member-card hover style to every interactive card/tile
across the site. Reference (gold standard): `app/components/TeamSection.tsx`.

Target hover set (every card ends with these):
```
transition-all duration-300
hover:-translate-y-1
hover:border-blue-300 dark:hover:border-blue-700/60
hover:bg-zinc-100 dark:hover:bg-zinc-900/70
hover:shadow-lg
```

---

## 1. Commands run (PowerShell) and results

| Command | Result |
| --- | --- |
| `npx tsc --noEmit` | PASS — exit 0, no errors |
| `npm run build` | PASS — exit 0; Next.js 16.4.0 (Turbopack) "Compiled successfully", TypeScript finished, 12 routes generated (static + dynamic) |

Both required gates pass.

## 2. Files changed (9 card/tile definitions across 6 files)

1. `public/dummyStyles.ts` — `projectStyles.projectCard` (3.1)
2. `public/dummyStyles.ts` — `contactPageStyles.contactCard` (3.2)
3. `public/dummyStyles.ts` — `toolsPageStyles.toolCardLink` (3.3; gained base `border`/`bg`)
4. `app/page.tsx` — Sejarah history `<Reveal as="article">` (3.4)
5. `app/experience/page.tsx` — `AwardCard` return `<div>` (3.5; kept dynamic border/bg)
6. `app/tools/page.tsx` — `SkillCard` return `<div>` (3.6)
7. `app/tools/page.tsx` — mediaTools card `<div>` (3.7)
8. `app/components/ClientsCarousel.tsx` — client logo tile `<div>` (3.8)
9. `app/components/TestimonialsCarousel.tsx` — testimonial card `<div>` (3.9; gained hover it lacked)

## 3. Per-card hover-class confirmation

Each of the 9 cards now ends with the full target set. Presence check across the
edited files (`Select-String`):

- `hover:-translate-y-1` → 10 hits = 9 cards + the excluded `Lokasi Kami` map
  (which already had this class and was intentionally left unchanged).
- `hover:border-blue-300` → 10 hits = 9 cards + the excluded `Lokasi Kami` map.
- `hover:shadow-lg` → 14 hits = 9 cards + out-of-scope buttons/links left
  unchanged (`submitButton`, `projectStyles.visitButton`,
  `projectDetailStyles.visitButton`, the "Berbadan Hukum" emerald CTA badge, and
  the "Buka di Google Maps" link).

All 9 cards carry `hover:-translate-y-1`, `hover:border-blue-300`, and
`hover:shadow-lg` (plus the blue dark pair, the zinc-100/900-70 bg pair, and
`transition-all duration-300`).

## 4. `card-hover` token removal

`card-hover` (the unlayered global helper in `globals.css` that overrode Tailwind
layered `hover:*` utilities) was removed from the 3 rendered card strings that
used it: `projectCard`, `contactCard`, `toolCardLink`.

`card-hover` still appears on 3 other `dummyStyles.ts` strings —
`timelineStyles.achievementCard`, `timelineStyles.techCard`, and
`projectDetailStyles.featureCard`. These are dead/unused: a grep across the whole
project confirms they are defined in `dummyStyles.ts` but never referenced or
rendered anywhere, so the `.card-hover` CSS rule matches no element on any page.
They are out of scope (never rendered) and were intentionally left untouched to
keep the change minimal — no user-visible effect either way.

## 5. Out-of-scope items left unchanged (per brief rules)

- Nav links, sidebar items, footer links, `ProjectFilter` rows, `LogoLink`
  avatar — nav/links.
- Carousel Prev/Next buttons (`ClientsCarousel`, `TestimonialsCarousel`),
  `ScrollButtons`, project `bookmarkButton`, all submit/close/"Kirim pesan
  lain"/"Beri penilaian lain" buttons, WhatsApp CTA — buttons / icon buttons.
- `techPill`, `interestItem`, tag spans, experience stats-strip items —
  pills / tags / plain tiles.
- `app/admin/page.tsx`, `app/login/page.tsx` — auth/admin pages.
- `globals.css` `.card-hover` / `.btn-hover` / `.nav-hover` / `.link-hover` /
  `.icon-hover` definitions — CSS untouched.
- `app/about/page.tsx` — no inline cards (uses `TeamSection` gold standard plus
  pills/links/buttons only); no edits.
- `app/page.tsx` "Berbadan Hukum" emerald CTA badge and "Lokasi Kami" map —
  deliberately themed CTA link / map embed, not content cards.

## 6. Notes / deviations

- The plan stated "`card-hover` appears only in 3 strings" — in reality it
  appears on 6 `dummyStyles.ts` strings, but only 3 are actually rendered. The 3
  unrendered strings were left as-is (dead code, no user-visible effect), per the
  plan's explicit section-4 limit and the minimal-change principle.
- `toolCardLink` received a NEW permanent base (`border border-zinc-200
  dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40`) it did not have before, so
  the hover bg/border contrast works — as the plan specified (section 3.3).
- All other cards kept their existing base bg/border; only hover utilities were
  swapped to the blue/zinc/lg target set.
