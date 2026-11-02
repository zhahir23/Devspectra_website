# Implementation Plan — Halaman Divisi

## Context Summary

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styles**: All Tailwind class strings live in `public/dummyStyles.ts` as exported object
  literals. Pages import a named export (e.g. `projectStyles as p`) and reference keys via
  `p.someKey`. New pages follow this exact pattern.
- **Team data**: Single source of truth at `data/team.ts`, typed by `TeamMember` from
  `app/components/TeamMemberModal.tsx`.
- **Sidebar wiring**: `Sidebar.tsx` holds both desktop and mobile nav. Special filter components
  (e.g. `ProjectFilter`) replace the plain `<Link>` render for their specific `href` inside the
  single `navItems.map` loop — same pattern needed for `/divisi`.
- **Category → Division mapping**: `'developer'` → `'IT'`, `'media'` → `'Media'`,
  `'marketing'` → `'Marketing'`.
- **Build / verify command**: `npm run build` (no test suite — build is the verification gate).
  Hot-check during dev: `npm run dev`.

---

## Steps

- [ ] 1. **Add `'marketing'` to the `TeamMember.category` union in `TeamMemberModal.tsx`**

  The current union is `"developer" | "media"`. Expanding it to `"developer" | "media" |
  "marketing"` is required before any data or page file can reference the new category without
  a TypeScript error. All other code in the file stays unchanged.

  Files: `app/components/TeamMemberModal.tsx`

  Verify: `npm run build` — no TypeScript errors on this file.

---

- [ ] 2. **Fix Cahya Nabil's `category` in `data/team.ts`**

  Change `category: "developer"` → `category: "marketing"` on the `cahya-nabil` entry. Also
  update the header comment to document the `"marketing"` category value alongside `"developer"`
  and `"media"`. No other entries change.

  Files: `data/team.ts`

  Verify: `npm run build` — no TypeScript errors on this file; Cahya Nabil will appear under
  the Marketing division tab once the page exists.

---

- [ ] 3. **Add `divisiStyles` export to `public/dummyStyles.ts`**

  Append a new `export const divisiStyles = { ... }` object at the end of the file (before the
  closing of the module), containing Tailwind class strings for the Divisi page layout. Mirror
  the token names already used in `projectStyles` (`pageContainer`, `innerContainer`, `header`,
  `pageTitle`, `pageSubtitle`, `projectsGrid`, `projectCard`, `imageContainer`, etc.) so the
  Divisi page can use the same visual language. Add a `divisionBadge` token for the coloured
  badge shown on each card when viewing all divisions at once (e.g. `"IT"`, `"Media"`,
  `"Marketing"`).

  Decision: reusing `projectStyles` tokens verbatim would mean the Divisi page looks identical
  to Projects. Instead, copy the same values and name the export `divisiStyles` so each page
  can diverge independently later without touching the shared object.

  Files: `public/dummyStyles.ts`

  Verify: `npm run build` — TypeScript resolves the new export without errors.

---

- [ ] 4. **Create `app/components/DivisiFilter.tsx`**

  Model this file exactly after `ProjectFilter.tsx`. Key differences:

  - Route is `/divisi`; URL param is `?division=` (not `?category=`)
  - Sub-items are three entries: `{ label: "IT", value: "IT", icon: "💻" }`,
    `{ label: "Media", value: "Media", icon: "🎬" }`,
    `{ label: "Marketing", value: "Marketing", icon: "📣" }`
  - Dropdown auto-opens when `pathname === "/divisi"` (mirrors ProjectFilter's `isOnPage` logic)
  - The active check reads `params.get("division")` instead of `params.get("category")`
  - All prop names (`href`, `label`, `Icon`, `navItem`, `navItemActive`, `navItemInactive`,
    `navIcon`, `navLabel`) are identical to ProjectFilter so Sidebar.tsx can call it the
    same way

  Wrap the inner component in `<Suspense>` (same pattern as ProjectFilter) so the
  `useSearchParams()` hook doesn't cause a build-time error in Server Component trees.

  Files: `app/components/DivisiFilter.tsx`

  Verify: `npm run build` — file compiles without errors.

---

- [ ] 5. **Create `app/divisi/page.tsx`**

  This is a client component (`"use client"`) that reads `?division=` from `useSearchParams()`,
  filters the `team` array by the category-to-division mapping, renders a member grid, and opens
  `TeamMemberModal` on card click.

  Exact implementation details:

  ```
  Division filter logic:
    const divisionMap: Record<string, TeamMember["category"][]> = {
      IT:        ["developer"],
      Media:     ["media"],
      Marketing: ["marketing"],
    };
    const active = searchParams.get("division") ?? "";
    const visible = active
      ? team.filter(m => divisionMap[active]?.includes(m.category))
      : team;                                 // show all when no param
  ```

  Card markup: copy the card markup from `TeamSection.tsx` verbatim — same gradient avatar,
  same hover classes, same `onClick` → `setSelected(member)` pattern, same
  `<TeamMemberModal>` at the bottom. Use `divisiStyles` tokens from `dummyStyles.ts` for
  layout (container, grid, header).

  Division badge: when `active === ""` (showing all), render a small coloured pill on each
  card that maps the member's `category` to its division label:
  `developer` → `"IT"`, `media` → `"Media"`, `marketing` → `"Marketing"`.
  Use the `divisionBadge` token added in step 3.

  Page structure (mirrors `app/projects/page.tsx`):
  - Inner function `DivisiContent()` contains all the `useSearchParams` logic
  - Default export `Divisi()` wraps `DivisiContent` in `<Suspense>` with a skeleton fallback

  Files: `app/divisi/page.tsx`

  Verify: `npm run build` — page compiles; navigating to `/divisi` in dev server shows all
  members; `/divisi?division=IT` shows only developer-category members.

---

- [ ] 6. **Update `app/components/Sidebar.tsx`**

  Three coordinated changes in one step (all inside the same file, so they must land together
  to keep the file in a buildable state):

  **6a — Add `DivisiIcon` SVG component** (inline, same pattern as `HomeIcon` etc.):

  ```tsx
  const DivisiIcon = ({ className, ...props }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor"
         aria-hidden="true" className={className} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  );
  ```

  **6b — Import `DivisiFilter`** at the top of the file, directly after the existing
  `import ProjectFilter` line:

  ```tsx
  import DivisiFilter from "@/app/components/DivisiFilter"
  ```

  **6c — Insert `Divisi` into `navItems` array** immediately after the `Projects` entry:

  ```tsx
  { href: "/divisi", label: "Divisi", Icon: DivisiIcon },
  ```

  **6d — Render `DivisiFilter` in both nav render loops** (desktop `<ul>` and mobile slide-in
  `<ul>`): wherever the existing conditional `href === "/projects" ? <ProjectFilter ...> : <Link>`
  pattern lives, extend it to also match `/divisi`:

  ```tsx
  href === "/projects" ? (
    <ProjectFilter ... />
  ) : href === "/divisi" ? (
    <DivisiFilter
      href={href}
      label={label}
      Icon={Icon}
      navItem={s.navItem}
      navItemActive={s.navItemActive}
      navItemInactive={s.navItemInactive}
      navIcon={s.navIcon}
      navLabel={s.navLabel}
    />
  ) : (
    <Link ... />
  )
  ```

  For the **desktop nav** use `s.navItem / s.navIcon / s.navLabel`.
  For the **mobile slide-in nav** use `s.mobileNavItem / s.mobileNavIcon / s.mobileNavLabel`
  (matching the existing ProjectFilter call in that section).

  The **bottom mobile nav bar** iterates `navItems` with icon-only `<Link>` elements and needs
  no special handling — adding Divisi to `navItems` is enough; the bottom bar will automatically
  include the icon.

  Files: `app/components/Sidebar.tsx`

  Verify: `npm run build` — full project builds cleanly; sidebar shows Divisi entry between
  Projects and Pencapaian in both desktop and mobile views.

---

## Dependency Order

```
Step 1 (type)
  └─► Step 2 (data — needs 'marketing' in type first)
        └─► Step 5 (page — reads team data with new type)
Step 3 (styles) ──► Step 5 (page imports divisiStyles)
Step 4 (DivisiFilter) ──► Step 6 (Sidebar imports DivisiFilter)
Step 5 (page exists) ──► Step 6 (Sidebar links to /divisi)
```

Steps 1→2→3 can be batched in a single commit. Step 4 depends only on step 1 (for the type).
Step 5 depends on steps 1, 2, and 3. Step 6 depends on steps 4 and 5.
