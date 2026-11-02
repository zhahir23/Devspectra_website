# Cascading Jasa & Anggota Tim dropdowns on the contact form

This change adds two optional cascading dropdowns to the contact form: Jasa (service) and Anggota Tim (team member). Choosing a Jasa filters the Anggota list to the matching team category — the four Developer services (Mobile, Web, Deploy Website, Technical Writer) surface the six developer members, and the five Media services (Pilot Drone, Editing, Desain, Fotografer, Videografer) surface the three media members — and the Anggota dropdown stays disabled until a Jasa is chosen and resets whenever the Jasa changes. The selected service and member name are appended to the submitted message rather than extending the API contract, so both the Spring Boot inquiry and the email notification carry them with no schema change on `app/api/contact/route.ts` or `app/lib/api.ts`. The change also folds in the prior review's one non-blocking fix: wrapping the Tim Kami modal's motion animation in `MotionConfig reducedMotion="user"` so it honors `prefers-reduced-motion` like the rest of the site. Watch for: the `SERVICE_CATEGORY` map is typed `Record<string, "developer" | "media">` rather than keyed to the service list, so a service added to `SERVICE_OPTIONS` without a matching category entry would silently render an empty Anggota dropdown with no type error; and the optional selects use a `disabled` placeholder option, so once a Jasa or member is chosen it can't be cleared back to "none".

**Verdict**: APPROVED

## High-level view

The cascade is driven by a single derived value: `availableMembers` filters `team` to members whose `category` equals `SERVICE_CATEGORY[form.jasa]`, and is empty until a Jasa is selected. The Anggota `<select>` is `disabled={!form.jasa || status === "loading"}`, and `handleSelectChange` clears `anggota` whenever `jasa` changes, so a member picked under one service never lingers into another service's list.

The service→category split matches the request exactly: four developer services map to the six developer members (Karol, Zhahir, Cintya, Bagus, Alfin, Ahmad) and five media services map to the three media members (Adrian, Rafi, Rasya). The mapping is correct today, but `SERVICE_CATEGORY` is typed `Record<string, "developer" | "media">` rather than keyed to `SERVICE_OPTIONS`, so the compiler won't catch a service added to the dropdown without a category entry — that would silently filter to zero members at runtime.

Submission folds the selections into the existing `message` string (`\n\nJasa: …\nAnggota Tim: …`) before both network calls, so neither `app/api/contact/route.ts` nor `app/lib/api.ts` needed to change and no new fields cross the trust boundary.

The `category` field is required on the `TeamMember` type and supplied on all nine members in `data/team.ts`, the only file that constructs member literals — so the required field can't orphan a construction site elsewhere. The same commit wraps the modal's `AnimatePresence` in `MotionConfig reducedMotion="user"`, resolving the prior review's reduced-motion finding without altering the popup's open/close, focus trap, or email links.

The two `<select>`s are native elements styled with Tailwind to match the existing dark-themed inputs (same `border`/`bg`/`radius`/`padding`/focus ring, plus `appearance-none`, a custom chevron, `pr-10`, `disabled:` states, and `[color-scheme]` for themed option menus). No new dependency was added — `package.json` is untouched and `motion` (^14.0.0) was already present.

<details>
<summary>Issues (2)</summary>

1. **SERVICE_CATEGORY not keyed to SERVICE_OPTIONS** — the map is typed `Record<string, "developer" | "media">` independently of the service list, so a service added to the dropdown without a category entry compiles but silently yields an empty Anggota dropdown at runtime. Key the map as `Record<(typeof SERVICE_OPTIONS)[number], "developer" | "media">` (or derive `SERVICE_OPTIONS` from `Object.keys(SERVICE_CATEGORY)`) so a missing mapping is a compile error.
2. **Optional selects can't be cleared** — both selects use a `disabled` placeholder option, so once a Jasa or member is chosen the user can only switch to another value, never back to "none," even though both fields are labeled optional. Drop `disabled` on the placeholder (or add an explicit "— Tidak ada —" option) if clearing should be possible.

</details>

<details>
<summary>Details</summary>

### Cascade: filter, disable, reset

The whole mechanism hangs off one derived array and one handler:

```tsx
const availableMembers = form.jasa
  ? team.filter((m) => m.category === SERVICE_CATEGORY[form.jasa])
  : [];

const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const { name, value } = e.target;
  setForm((prev) => name === "jasa"
    ? { ...prev, jasa: value, anggota: "" }
    : { ...prev, [name]: value });
};
```

`<select name="anggota" disabled={!form.jasa || status === "loading"}>` keeps the member list inert until a service is chosen, and the `name === "jasa"` branch guarantees that switching from Web to Pilot Drone drops a previously-selected developer member before the media list renders — so `form.anggota` can never point at a member who isn't in the current `availableMembers`. The reset also cooperates with the loading guard: both selects go `disabled` while submitting, so the cascade can't be mutated mid-request. The one consequence of the `disabled` placeholder is the deselection limitation flagged above — there's no path from a chosen value back to empty. The project ships no test runner, so these filter/disable/reset paths are exercised only by the recorded manual check plus the tsc/lint/build gate, not by automated tests.

### Service→category mapping and the Record<string> gap

The category split is right and complete: `data/team.ts` marks Karol, Zhahir, Cintya, Bagus, Alfin, Ahmad as `developer` and Adrian, Rafi, Rasya as `media`, lining up with `SERVICE_CATEGORY` — `Web`→developer→6 members, `Pilot Drone`→media→3 members. The gap is structural rather than a current bug:

```tsx
const SERVICE_OPTIONS = ["Mobile", "Web", /* …9 total */];
const SERVICE_CATEGORY: Record<string, "developer" | "media"> = { Mobile: "developer", /* … */ };
```

Because the map's key type is `string` and `tsconfig` has no `noUncheckedIndexedAccess`, TypeScript treats `SERVICE_CATEGORY[anything]` as `"developer" | "media"` and never as `undefined` — so a future `SERVICE_OPTIONS` entry with no map key compiles, then at runtime `team.filter((m) => m.category === undefined)` returns `[]`, and the Anggota dropdown shows only its placeholder. Keying the map to `Record<(typeof SERVICE_OPTIONS)[number], "developer" | "media">` would turn that into a missing-property compile error instead of a silent empty dropdown.

### Submission folds into the existing message

No schema change was needed because the selections ride inside the message:

```tsx
const enrichedMessage =
  form.message +
  (form.jasa ? `\n\nJasa: ${form.jasa}` : "") +
  (form.anggota ? `\nAnggota Tim: ${form.anggota}` : "");
```

`enrichedMessage` is passed to `createInquiry(...)` and substituted into the `/api/contact` `JSON.stringify({ ...form, message: enrichedMessage })`, so the email "Pesan" box and the Spring Boot inquiry both carry the service + member, and the route — which destructures only `name/email/subject/message/date/whatsapp` and ignores extra keys — is untouched. The appended values come from fixed option lists (the service dropdown and the team array), not free text, so they don't widen the input the route has to validate.

### Reduced-motion fix folded in

The `TeamMemberModal` diff is only the `MotionConfig` import, the required `category` field on the `TeamMember` type, and a `<MotionConfig reducedMotion="user">` wrapper around `AnimatePresence` — nothing in the dialog body, focus trap, Escape/backdrop/X close, or `mailto:` links changed, so the popup behavior the task said to leave alone is intact. `reducedMotion="user"` defers to the OS preference, matching the CSS `prefers-reduced-motion` handling the rest of the site uses.

### Visual consistency with the dark-themed inputs

The select className reuses the shared `formInput` tokens but adapts for a native control: it drops `peer`/`placeholder:text-transparent` because a `<select>` has no `:placeholder-shown` for the floating-label trick, and adds `appearance-none` + a `pointer-events-none` chevron + `pr-10` + `[color-scheme:light] dark:[color-scheme:dark]` so the native option menu renders in the active theme — the same technique the existing date field already uses. Labels sit above the control (label-above pattern) since the floating-label trick can't apply.

</details>

<details>
<summary>File map</summary>

- `app/contact/page.tsx` — entirely new in this commit: full contact form (name/email/whatsapp/subject/message/date) plus the two new cascading `<select>`s (Jasa + Anggota Tim), the service→category constants, the cascade/reset handler, the enriched-message submission wiring, the success/WhatsApp state, and the rating/review section.
- `app/components/TeamMemberModal.tsx` — `TeamMember` type gains required `category: "developer" | "media"`; `AnimatePresence` wrapped in `MotionConfig reducedMotion="user"` (reduced-motion fix). Popup behavior unchanged.
- `data/team.ts` — `category` added to all nine members (6 developer, 3 media).

Full diff: `git show 9d8573a`.

</details>
