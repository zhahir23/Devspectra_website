"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

const categories = [
  { label: "Media", value: "Media", icon: "🎬" },
  { label: "IT",    value: "IT",    icon: "💻" },
] as const;

const ChevronDown = ({ open }: { open: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
    className={`h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

function ProjectNavItem({
  href,
  label,
  Icon,
  navItemActive,
  navItemInactive,
  navIcon,
  navLabel,
  navItem,
  onClose,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  navItem: string;
  navItemActive: string;
  navItemInactive: string;
  navIcon: string;
  navLabel: string;
  onClose?: () => void;
}) {
  const pathname   = usePathname();
  const params     = useSearchParams();
  const active     = params.get("category") ?? "";
  const isOnPage   = pathname === "/projects";

  // Buka dropdown kalau sedang di halaman projects
  const [open, setOpen] = useState(isOnPage);
  useEffect(() => { if (isOnPage) setOpen(true); }, [isOnPage]);

  const isRootActive = isOnPage && active === "";

  return (
    <>
      {/* Projects row: klik → semua, chevron → toggle dropdown */}
      <div className={`${navItem} ${isOnPage ? navItemActive : navItemInactive} pr-2`}
           style={{ padding: 0 }}>
        <Link
          href="/projects"
          aria-current={isRootActive ? "page" : undefined}
          className="flex flex-1 items-center gap-3 px-3 py-3"
          onClick={onClose}
        >
          <Icon className={navIcon} />
          <span className={navLabel}>{label}</span>
        </Link>
        <button
          type="button"
          aria-label={open ? "Tutup kategori" : "Buka kategori"}
          onClick={(e) => { e.preventDefault(); setOpen((o) => !o); }}
          className="flex h-full items-center px-2 py-3 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          <ChevronDown open={open} />
        </button>
      </div>

      {/* Dropdown sub-items */}
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="ml-7 space-y-0.5 border-l border-zinc-200 dark:border-zinc-800 pl-3 pb-1">
          {categories.map((cat) => {
            const isActive = isOnPage && active === cat.value;
            return (
              <li key={cat.value}>
                <Link
                  href={`/projects?category=${cat.value}`}
                  onClick={onClose}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-all duration-150
                    ${isActive
                      ? "bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-900"
                      : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                >
                  <span className="text-sm leading-none">{cat.icon}</span>
                  <span>{cat.label}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

function ProjectFilterInner(props: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  navItem: string;
  navItemActive: string;
  navItemInactive: string;
  navIcon: string;
  navLabel: string;
  onClose?: () => void;
}) {
  return <ProjectNavItem {...props} />;
}

export default function ProjectFilter(props: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  navItem: string;
  navItemActive: string;
  navItemInactive: string;
  navIcon: string;
  navLabel: string;
  onClose?: () => void;
}) {
  return (
    <Suspense fallback={
      <Link
        href="/projects"
        className={`${props.navItem} ${props.navItemInactive}`}
      >
        <props.Icon className={props.navIcon} />
        <span className={props.navLabel}>{props.label}</span>
      </Link>
    }>
      <ProjectFilterInner {...props} />
    </Suspense>
  );
}
