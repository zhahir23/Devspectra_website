"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { projectStyles as p } from "@/public/dummyStyles";
import Reveal from "@/app/components/Reveal";
import { isExternalImage } from "@/app/lib/api";
import type { Project, ProjectCategory } from "@/data/projects";

const BookmarkIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12v16l-6-4-6 4z" />
  </svg>
);

/** Isi halaman Projects. `projects` diambil app/projects/page.tsx (dari dashboard, atau daftar bawaan). */
export default function ProjectsContent({ projects }: { projects: Project[] }) {
  const searchParams = useSearchParams();
  const active = (searchParams.get("category") ?? "") as "" | ProjectCategory;

  const visibleProjects = active
    ? projects.filter((proj) => proj.category === active)
    : projects;

  return (
    <div className={p.pageContainer}>
      <div className={p.innerContainer}>
        <header className={p.header}>
          <Reveal as="h1" className={p.pageTitle}>Projects</Reveal>
          <Reveal as="p" delay={100} className={p.pageSubtitle}>
            Playground — dari MVP kecil sampai aplikasi production.
            {active && (
              <span className="ml-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {active}
              </span>
            )}
          </Reveal>
        </header>

        <div className={p.projectsGrid}>
          {visibleProjects.map((proj, i) => (
            <Reveal key={proj.id} as="article" variant="scale" delay={i * 100} className={p.projectCard}>
              <div className={p.imageContainer}>
                {proj.image ? (
                  <Image
                    src={proj.image}
                    alt={proj.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className={p.projectImage}
                    // Gambar yang diunggah dari dashboard dibuka langsung dari backend (sudah diperkecil saat diunggah)
                    unoptimized={isExternalImage(proj.image)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
                    {proj.title}
                  </div>
                )}
                <div className={p.statusBadgeContainer}>
                  <span
                    className={`${p.statusBadge} ${
                      proj.status === "active" ? p.statusActive : p.statusInactive
                    }`}
                  >
                    {proj.category}
                  </span>
                </div>
                <button type="button" aria-label="Bookmark" className={p.bookmarkButton}>
                  <BookmarkIcon className={p.bookmarkIcon} />
                </button>
              </div>

              <div className={p.contentSection}>
                <h2 className={p.projectTitle}>{proj.title}</h2>
                <p className={p.projectDescription}>{proj.description}</p>

                <div className={p.tagsContainer}>
                  {proj.tags.map((tag) => (
                    <span key={tag} className={p.tag}>
                      {tag}
                    </span>
                  ))}
                </div>

                {proj.canvaUrl && (
                  <div className={p.actionsContainer}>
                    <div className={p.actionsLinksContainer}>
                      <a
                        href={proj.canvaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={p.visitButton}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4 flex-shrink-0">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-.54 18.3c-1.178 0-2.21-.468-2.96-1.22l1.04-1.04c.496.497 1.18.8 1.92.8 1.496 0 2.712-1.215 2.712-2.712 0-.74-.303-1.424-.8-1.92l1.04-1.04c.752.75 1.22 1.782 1.22 2.96 0 2.31-1.872 4.172-4.172 4.172zm4.98-4.98l-1.04 1.04a2.703 2.703 0 00-.8-1.92c-.496-.496-1.18-.8-1.92-.8-1.496 0-2.712 1.216-2.712 2.712 0 .74.304 1.424.8 1.92l-1.04 1.04A4.153 4.153 0 017.54 14.13c0-2.3 1.872-4.172 4.172-4.172 1.154 0 2.2.47 2.96 1.22l-1.04 1.04a2.703 2.703 0 00-1.92-.8c-1.496 0-2.712 1.216-2.712 2.712 0 1.497 1.216 2.712 2.712 2.712.74 0 1.424-.303 1.92-.8l1.04 1.04a4.153 4.153 0 01-2.96 1.22c-2.3 0-4.172-1.872-4.172-4.172s1.872-4.172 4.172-4.172c1.154 0 2.2.47 2.96 1.22z"/>
                        </svg>
                        Lihat di Canva
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        {visibleProjects.length === 0 && (
          <p className="mt-12 text-center text-zinc-500">
            Belum ada proyek pada kategori ini.
          </p>
        )}
      </div>
    </div>
  );
}
