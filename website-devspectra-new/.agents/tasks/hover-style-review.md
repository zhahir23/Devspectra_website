# Unified Tim-Kami hover style across all site cards

This change applies the `TeamSection` member-card hover treatment — translate-up, blue border, zinc-100 background, shadow-lg — to every interactive content card on the site: the Sejarah history tiles, project cards, contact-method tiles, tool cards, award cards, skill and media cards, and the client/testimonial carousel tiles. The shared Tailwind utility set replaces the old per-card hover colors (zinc borders, `shadow-xl`) and the global `.card-hover` helper that was overriding Tailwind's layered hover utilities. Existing base borders and backgrounds are preserved with the hover classes layered on top; the lone exception is `toolCardLink`, which gained a base border/background it previously lacked so the hover contrast reads correctly. TypeScript and the production build both pass per the coder's verification note.

Watch for: an unrelated `image: "/logo-devspectra.jpeg"` field was added to one Sejarah history entry inside this same diff. It's a benign content change (shows the logo in that card's pre-existing logo slot) and traces to the earlier "Sejarah pakai foto logo" request, not a hover change — it does not affect the hover consistency goal.

**Verdict**: APPROVED

## High-level view

The hover unification is done with a single shared Tailwind utility chain rather than a shared CSS class. Every content card now ends with `transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg`. The `.card-hover` global helper was stripped from the three rendered card strings (`projectCard`, `contactCard`, `toolCardLink`) so the Tailwind `hover:*` utilities take effect — as an unlayered rule it was winning specificity over them.

The base-border/background strategy follows the brief's exception clause rather than forcing one base everywhere: most cards kept their existing base with only the hover utilities swapped. Two exceptions — `toolCardLink` gained a base border/background it previously lacked, and `AwardCard` keeps its per-award colored ring/background and layers the blue/zinc hover on top, so awards stay color-coded at rest and unify on hover.

Exclusions were respected across the board: nav, sidebar, footer and ProjectFilter rows; every button (carousel prev/next, scroll, bookmark, submit/close, WhatsApp CTA, "Buka di Google Maps", Canva visit, login submit, modal email); icon buttons (theme toggle, Instagram); pills/tags/badges; and the `admin` and `login` pages all keep their own hover styles and are absent from the diff. The `TeamMemberModal` cue-card popup and the "Lokasi Kami" map embed are non-hoverable or functional elements and were correctly left alone — the map's pre-existing themed blue-glow hover is unchanged code, so it is out of scope.

One out-of-scope content change rode along: the `image` field on the "Devspectra" Sejarah entry. It is not a hover change and does not touch layout, spacing, fonts, or non-hover classes, so it does not violate the hover rules; it is noted for awareness only.

<details>
<summary>Issues (0)</summary>

No actionable issues. The hover consistency goal is met and the stated rules were respected. The bundled `image` field noted above is informational context (a prior content request), not a hover defect, so it is not listed as an actionable item.

</details>

<details>
<summary>Details</summary>

### Hover style unification via a shared utility chain

All nine updated cards plus the `TeamSection` reference now carry the identical hover tail:

```
transition-all duration-300
hover:-translate-y-1
hover:border-blue-300 dark:hover:border-blue-700/60
hover:bg-zinc-100 dark:hover:bg-zinc-900/70
hover:shadow-lg
```

Confirmed present on: Sejarah `Reveal as="article"` (`app/page.tsx`), `projectStyles.projectCard` / `contactPageStyles.contactCard` / `toolsPageStyles.toolCardLink` (`public/dummyStyles.ts`, referenced as `p.projectCard` / `c.contactCard` in the page files), `AwardCard` (`app/experience/page.tsx`), `SkillCard` and the mediaTools tile (`app/tools/page.tsx`), the client logo tile (`ClientsCarousel.tsx`), and the testimonial card (`TestimonialsCarousel.tsx`). An app-wide grep for `hover:shadow-(lg|xl|2xl|md)`, `hover:border-blue-300`, `hover:-translate-y-1`, and `border border-zinc-200 dark:border-zinc-800` cross-confirms that no content card was missed: every hover-shadow element is either one of these cards with the full set, or an excluded button/link/admin/map.

### Base border/background strategy

The brief required a base `border border-zinc-200 dark:border-zinc-800` plus a light `bg-zinc-50`/`bg-white` so the hover has contrast, with an explicit exception to keep a card's existing different base and add the hover classes. That exception is exercised in two places. `toolCardLink` previously had no border/background at all; it now carries `border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40`, which is the one card that gained a base in this diff. `AwardCard` keeps a dynamic per-award base — `border ${award.ringColor} ring-1 ${award.bgColor}` — where `ringColor` values like `ring-amber-400/40` are ring colors layered over a neutral `border`, and `bgColor` values like `bg-amber-50 dark:bg-amber-900/20` carry the category tint. On hover the border turns blue and the background turns zinc, so awards stay color-coded at rest and unify on hover.

### `.card-hover` helper removal

`.card-hover` was a global, unlayered CSS rule in `globals.css` that was winning the cascade over Tailwind's layered `hover:*` utilities, so leaving it on a card would have masked the new hover styles. It was removed from the three strings that actually render cards — `projectCard`, `contactCard`, `toolCardLink`. Three other `dummyStyles.ts` strings (`timelineStyles.achievementCard`, `timelineStyles.techCard`, `projectDetailStyles.featureCard`) still contain `card-hover`, but a project-wide grep finds them referenced nowhere outside their own definitions, so the rule matches no element on any page. They are dead code and were intentionally left untouched to keep the change minimal.

### Exclusions respected

Rule compliance for the off-limits items is confirmed by absence from the diff, not by assumption. `app/admin/page.tsx` and `app/login/page.tsx` are not in the changed-file set, so their stat cards retain their old `hover:shadow-zinc-200/40` / `hover:border-zinc-300` styles. The "Lokasi Kami" map embed's themed `hover:shadow-2xl` hover is likewise absent from the diff — it is pre-existing code, so its partial-blue state is out of scope rather than a half-applied target.

### Bundled, out-of-scope content change

The `app/page.tsx` diff adds `image: "/logo-devspectra.jpeg"` to the "Devspectra" (2025–now) Sejarah entry. The Sejarah card already renders `item.image` in its pre-existing `aspect-[16/9]` logo slot (falling back to an initials gradient when absent), so the field only swaps which child shows there — a content change that does not alter layout, spacing, fonts, or non-hover classes, and that matches the earlier request to put the Devspectra logo on the Sejarah card. Noted for awareness; not a blocker.

### Verification

Per the coder's note at `.agents/tasks/hover-style-verify.md`, `npx tsc --noEmit` exits 0 and `npm run build` exits 0 (Next.js 16.4.0 / Turbopack, 12 routes generated). The build/test suites were not re-run for this review, per instructions.

</details>

<details>
<summary>File map</summary>

- `public/dummyStyles.ts` — `projectCard`, `contactCard`, `toolCardLink` swapped to the target hover set; `.card-hover` token removed from those three rendered strings; `toolCardLink` gained a base border/background. (Three dead `card-hover` strings left as-is.)
- `app/page.tsx` — Sejarah history card hover swapped from zinc-border/`shadow-xl` to the target blue/zinc/`shadow-lg` set; one unrelated `image` field added to the Devspectra history entry.
- `app/experience/page.tsx` — `AwardCard` hover set added, dynamic ring/background base kept.
- `app/tools/page.tsx` — `SkillCard` and mediaTools tile hover set added.
- `app/components/ClientsCarousel.tsx` — client logo tile hover set added.
- `app/components/TestimonialsCarousel.tsx` — testimonial card hover set added (it previously lacked a hover).
- `.agents/tasks/hover-style-verify.md` — coder's verification note (tsc + build results).

Full diff: `git diff 9d8573a..HEAD` (commit `78f7823`, "feat: unify card hover style across all pages").

</details>
