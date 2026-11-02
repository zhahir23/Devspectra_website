# Implementation Plan — Cascading "Jasa" & "Anggota Tim" dropdowns on the Contact form

Goal (from the request): add two cascading dropdowns to the contact form — Dropdown 1 "Jasa" (service) and Dropdown 2 "Anggota Tim" (team member), where the member list is filtered by the service's category (developer vs media) and is disabled until a service is chosen. Both are optional and informational; their values ride along when the form is submitted.

## Context & decisions (grounded in code read during exploration)

- **No existing Select/Dropdown to reuse.** `components/ui/` contains only `button.tsx`, `globe.tsx`, `typing-animation.tsx`; `app/components/ui/` contains only `typing-animation-demo-3.tsx`. Although `radix-ui`/`shadcn` are installed, there is no Select primitive. Decision: use a native `<select>` styled with Tailwind to match the existing input look — no new dependency (satisfies the constraint).
- **Existing input style** (`public/dummyStyles.ts`, `contactPageStyles.formInput`): `peer w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-4 text-zinc-900 dark:text-zinc-100 outline-none transition-all placeholder:text-transparent focus:border-zinc-400 dark:focus:border-zinc-600 focus:bg-zinc-50 dark:focus:bg-zinc-900 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600`. The select must reuse the same border / bg / radius / padding / focus ring, but **drop** `peer` and `placeholder:text-transparent` (a `<select>` has no `:placeholder-shown`, so the floating-label trick cannot apply), and **add** `appearance-none`, a custom chevron, `pr-10` (room for the chevron), `disabled:opacity-50 disabled:cursor-not-allowed`, and `[color-scheme:light] dark:[color-scheme:dark]` (so the native option menu renders in the matching theme — same technique the existing date field uses).
- **Label approach.** The main form fields use floating labels via `peer` + `placeholder:text-transparent`; that does not work for `<select>`. Decision: use a **label-above-the-control** pattern, matching the rating/review section already in the same file (`<label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">`). Keeps the component internally consistent.
- **Placement.** Insert the two dropdowns **between the Subject field and the "Jadwal Pertemuan" (date) field**. Decision: stack them **full-width** (not in a 2-col grid) so the cascade — member disabled until service chosen, member resets when service changes — reads obviously top-to-bottom.
- **Contact API route** (`app/api/contact/route.ts`): read fully. It destructures `{ name, email, subject, message, date, whatsapp }` and ignores any extra keys; validation only requires `name`/`email`/`message`; it accepts a `message` string and renders it in the email "Pesan" box. Per the task's explicit guidance ("if it … accepts … a message string, just format the selected values into the existing message … rather than changing the API schema"), Decision: **do NOT modify the route**. Instead, on the client, append the chosen service + member to `message` before sending to **both** `createInquiry` (Spring Boot) and `/api/contact` (email). That puts the info in both payloads with zero schema changes and keeps `app/lib/api.ts` (out of the listed scope) untouched.
- **`createInquiry`** (`app/lib/api.ts`) is typed `{ name; email; phone?; subject?; message }`. Folding service/member into `message` needs no change there. Out of scope — untouched.
- **`TeamMember` type** is consumed only by `data/team.ts` (the source array), `TeamMemberModal.tsx` (defines it, only reads fields), and `TeamSection.tsx` (`useState<TeamMember | null>`). No other file constructs `TeamMember` literals, so adding a **required** `category` field only forces `data/team.ts` to supply it — which item 1 does. `tsconfig.json` has `"strict": true` and no `noUncheckedIndexedAccess`, so indexing the service→category map returns the union type cleanly (no `undefined` to handle).

## Exact category assignment (each member → `category: "developer" | "media"`)

Rationale: the two categories map to the service groups. "Developer" services (Mobile, Web, Deploy Website, Technical Writer) → members whose role is dev/dev-adjacent. "Media" services (Pilot Drone, Editing, Desain, Fotografer, Videografer) → members explicitly in the media division.

| id | name | role | category | reason |
|----|------|------|----------|--------|
| `karol-purba` | Karol Efrido Sanggam Purba | Founder of Devspectra & Head Devspectra Bandung | `developer` | Founder/branch head on the company (dev-first) side; no media signal. |
| `zhahir-furqon` | Zhahir Furqon | Manajer & Head Devspectra Jakarta | `developer` | Branch manager/head; only two categories exist and he is on the company side, not the media division. (Judgment call — see note.) |
| `cintya-silvana` | Cintya Silvana | Secretary Devspectra & Developer | `developer` | Role explicitly includes "Developer". |
| `bagus-wibowo` | Bagus Wibowo | Developer of Devspectra | `developer` | Explicitly "Developer". |
| `alfin-wadani` | Alfin Dwi Wadani | Developer of Devspectra | `developer` | Explicitly "Developer". |
| `ahmad-afriadi` | Ahmad Afriadi Rahman | DevOps of Devspectra | `developer` | DevOps (deploys websites) — dev-adjacent; maps to the "Deploy Website" service. |
| `adrian-ferdiansyah` | Adrian Ferdiansyah | Pilot Drone & Head of Media Division | `media` | Explicitly "Head of Media Division" + Pilot Drone. |
| `rafi-arrusy` | Rafi Ar-Rusy | Media Member & Editor Section of Devspectra | `media` | Explicitly "Media Member". |
| `rasya` | Rasya | Media Member & Design Section of Devspectra | `media` | Explicitly "Media Member". |

Result: Developer = 6 members (Karol, Zhahir, Cintya, Bagus, Alfin, Ahmad); Media = 3 members (Adrian, Rafi, Rasya).
Note on the one judgment call: Karol and Zhahir are leadership/management, not hands-on dev or media. Since the schema only exposes `developer` | `media` and Devspectra is a dev-first company whose leadership runs the company (dev) side — while Adrian is explicitly "Head of Media Division" and so is media — both are assigned `developer`. If the user prefers leadership excluded or shown in both, that needs a schema change (out of scope here).

## Service → category map (drives which members appear)

- `developer` services: `Mobile`, `Web`, `Deploy Website`, `Technical Writer`
- `media` services: `Pilot Drone`, `Editing`, `Desain`, `Fotografer`, `Videografer`

## Ordered plan

- [ ] 1. Extend the `TeamMember` type with a required `category` field, and add the category to every member in the team data.
      - In `app/components/TeamMemberModal.tsx`, add `category: "developer" | "media";` to the `export type TeamMember` block (keep `id, name, role, initials, email` unchanged). The modal UI does **not** render `category` — do not touch the popup behavior.
      - In `data/team.ts`, add the `category` value to each of the 9 members exactly per the assignment table above. The file already imports `type { TeamMember }` from `@/app/components/TeamMemberModal`, so the array will type-check against the extended type.
      - Files: `d:\CODINGAN\PORTOFOLIO\devsepctra-company\app\components\TeamMemberModal.tsx`; `d:\CODINGAN\PORTOFOLIO\devsepctra-company\data\team.ts`
      - Verify: `npx tsc --noEmit` exits 0 (the new required field is supplied on all 9 members, so no type error); `npx eslint data/team.ts app/components/TeamMemberModal.tsx` exits 0.

- [ ] 2. Add the two cascading `<select>` dropdowns, their state, the service→category constants, and the submission wiring to the contact page (no API route change).
      - **Imports:** add `import { team } from "@/data/team";` at the top of `app/contact/page.tsx` (the team array is the member source; no need to import the `TeamMember` type — let it infer).
      - **Constants** (define near the other module-level consts, above the component): a `SERVICE_OPTIONS` array of the 11 service strings in the order listed in the request, and a `SERVICE_CATEGORY` map of type `Record<string, "developer" | "media">` mapping each service string to its category per the map above. Keep these plain string keys so the existing `handleChange`-style computed-key pattern stays lint-clean.
      - **State:** add `jasa: ""` and `anggota: ""` to the initial `useState` object (so the form state shape gains the two string fields). Add the same two empty strings to the reset call inside `handleSubmit` (`setForm({ name: "", email: "", whatsapp: "", subject: "", message: "", date: "", jasa: "", anggota: "" })`).
      - **Handler:** add `handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>)` that, when `e.target.name === "jasa"`, sets `jasa` to the new value **and resets `anggota` to ""** (the cascade reset); otherwise sets `[name]: value` (the member select). Mirror the existing `handleChange` computed-key style so it passes lint.
      - **Derived members:** compute `const availableMembers = form.jasa ? team.filter((m) => m.category === SERVICE_CATEGORY[form.jasa]) : [];` in the render body (9 items — no memoization needed).
      - **Chevron icon:** add a small `ChevronDownIcon` component next to the other inline icons at the top of the file (an SVG `<path d="M19 9l-7 7-7-7" />`, `strokeWidth={2}`, accepting `className`), matching the existing icon-component style and the chevron already used in `app/components/ProjectFilter.tsx`.
      - **Markup — Jasa dropdown** (insert as a new `c.formFieldContainer` block, between the Subject field block and the "Jadwal Pertemuan" date block): a label-above (`mb-1.5 block text-sm font-medium text-zinc-500 dark:text-zinc-400`, text `Jasa` with an `(opsional)` muted span), then a `relative` wrapper holding the `<select id="jasa" name="jasa" value={form.jasa} onChange={handleSelectChange} disabled={status === "loading"}>` plus the absolutely-positioned `ChevronDownIcon` (`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500`). The select's first option is `<option value="" disabled>Pilih Jasa</option>` (the unselectable, greyed-out placeholder), followed by `SERVICE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)`.
      - **Markup — Anggota Tim dropdown** (the next `c.formFieldContainer` block, immediately after the Jasa block): same label pattern (`Anggota Tim` + `(opsional)`), a `relative` wrapper with the `<select id="anggota" name="anggota" value={form.anggota} onChange={handleSelectChange} disabled={!form.jasa || status === "loading"}>` and the same chevron. First option `<option value="" disabled>Pilih Anggota Tim</option>`, then `availableMembers.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)`. The member value submitted is the member's **name** (the request wants the member name in the payload).
      - **Exact `<select>` className** (use for both selects): `w-full appearance-none rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-4 pr-10 text-zinc-900 dark:text-zinc-100 outline-none transition-all focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed [color-scheme:light] dark:[color-scheme:dark]` — i.e. `formInput` minus `peer`/`placeholder:text-transparent`/`focus:bg-*`, plus `appearance-none pr-10 disabled:… [color-scheme]`.
      - **Submission wiring (no API/schema change):** in `handleSubmit`, before the two network calls, build an enriched message that appends the chosen values only when present, e.g. `const enrichedMessage = form.message + (form.jasa ? \`\n\nJasa: ${form.jasa}\` : "") + (form.anggota ? \`\nAnggota Tim: ${form.anggota}\` : "");`. Pass `message: enrichedMessage` to `createInquiry(...)`, and send `JSON.stringify({ ...form, message: enrichedMessage })` (instead of `JSON.stringify(form)`) to the `/api/contact` fetch — so the email's "Pesan" box and the Spring Boot inquiry both carry the service + member. Leave `app/api/contact/route.ts` and `app/lib/api.ts` unchanged.
      - Do **not** touch the success state, the WhatsApp confirmation, the review/rating section, or any other field.
      - Files: `d:\CODINGAN\PORTOFOLIO\devsepctra-company\app\contact\page.tsx`
      - Verify: `npx tsc --noEmit` exits 0; `npx eslint app/contact/page.tsx` exits 0; `npm run build` exits 0 and all pages generate.

## Verification (run after both items; PowerShell — use `;` between commands, not `&&`)

1. `npx tsc --noEmit` — must exit 0 (no type errors; confirms `category` is supplied on all members and the new contact-page code is strict-clean).
2. `npx eslint app/contact/page.tsx data/team.ts app/components/TeamMemberModal.tsx` — must exit 0.
3. `npm run build` — must exit 0; all pages generated.
4. Manual code inspection confirming: (a) selecting "Web" lists only the 6 Developer-category members; (b) selecting "Pilot Drone" lists only the 3 Media-category members; (c) the Anggota Tim `<select>` is `disabled` until a Jasa is chosen; (d) changing the Jasa resets `anggota` back to the "Pilih Anggota Tim" placeholder; (e) the chosen service + member name are appended to the submitted `message` (visible in the email body and the Spring Boot inquiry), with no change to `app/api/contact/route.ts` or `app/lib/api.ts`.

## Out of scope (explicitly left untouched)
`app/api/contact/route.ts`, `app/lib/api.ts`, auth/admin/login, `TeamSection.tsx`, `TeamMemberModal` popup behavior, review API, and all other pages.

## Verification results (run by the implementing agent)

Review gate: `review.json` existed (verdict APPROVED) with one non-blocking finding — the modal's `motion/react` animation did not honor `prefers-reduced-motion`, unlike the page's CSS scroll reveals. Fix applied (already present in the working tree): wrapped `AnimatePresence` in `<MotionConfig reducedMotion="user">` in `app/components/TeamMemberModal.tsx`, matching the rest of the site's reduced-motion handling in `globals.css`. The popup's behavior (open/close, focus trap, email links) is unchanged.

Implementation: added `category: "developer" | "media"` to the `TeamMember` type and to all 9 members in `data/team.ts`; added two cascading native `<select>` dropdowns (Jasa + Anggota Tim) to `app/contact/page.tsx` between Subject and Jadwal Pertemuan, styled with Tailwind to match the existing inputs (dark bg, same border/radius/padding/focus ring, custom chevron, `[color-scheme]` for themed option menus). The Anggota dropdown is disabled until a Jasa is chosen and resets when the Jasa changes. Both fields are optional; the selected service + member name are appended to the submitted `message` (sent to both `createInquiry` and `/api/contact`), so `app/api/contact/route.ts` and `app/lib/api.ts` were NOT changed.

Commands run (PowerShell, `;` separators):
- `npx tsc --noEmit` → exit 0
- `npx eslint app/contact/page.tsx data/team.ts app/components/TeamMemberModal.tsx` → exit 0
- `npm run build` → exit 0; all 12 routes generated (`/`, `/_not-found`, `/about`, `/admin`, `/api/contact` ƒ, `/api/review` ƒ, `/contact`, `/experience`, `/login`, `/projects`, `/tools`).

Manual code inspection:
- (a) "Web" → `SERVICE_CATEGORY["Web"] === "developer"` → 6 developer members (Karol, Zhahir, Cintya, Bagus, Alfin, Ahmad). ✓
- (b) "Pilot Drone" → `SERVICE_CATEGORY["Pilot Drone"] === "media"` → 3 media members (Adrian, Rafi, Rasya). ✓
- (c) Anggota `<select>` is `disabled={!form.jasa || status === "loading"}` → disabled before a Jasa is chosen. ✓
- (d) `handleSelectChange` resets `anggota` to `""` when `name === "jasa"` → changing service clears the member selection. ✓
