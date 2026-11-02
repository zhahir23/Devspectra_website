import { Suspense } from "react";
import { projectStyles as p } from "@/public/dummyStyles";
import ProjectsContent from "./ProjectsContent";
import { projects as defaultProjects } from "@/data/projects";
import { getProjects } from "@/app/lib/api";
import { toWebsiteProjects } from "@/app/lib/website-content";

// Dirender setiap ada pengunjung, sama seperti beranda. Data dari dashboard tetap
// disimpan 60 detik (app/lib/api.ts), jadi backend tidak ditanya setiap kali.
export const revalidate = 0;

export default async function Projects() {
  // Project dari dashboard admin (Konten website > Projects), disimpan 60 detik.
  // Kalau backend tidak bisa dihubungi, daftar bawaan di data/projects.ts yang tampil.
  const fromDashboard = await getProjects();
  const projects = fromDashboard ? toWebsiteProjects(fromDashboard) : defaultProjects;

  return (
    <Suspense fallback={
      <div className={p.pageContainer}>
        <div className={p.innerContainer}>
          <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    }>
      <ProjectsContent projects={projects} />
    </Suspense>
  );
}
