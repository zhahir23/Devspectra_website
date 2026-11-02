import { Suspense } from "react";
import DivisiContent from "./DivisiContent";
import { team as defaultTeam } from "@/data/team";
import { getTeamMembers } from "@/app/lib/api";
import { toWebsiteTeam } from "@/app/lib/website-content";

// Dirender setiap ada pengunjung, sama seperti beranda. Data dari dashboard tetap
// disimpan 60 detik (app/lib/api.ts), jadi backend tidak ditanya setiap kali.
export const revalidate = 0;

export default async function Divisi() {
  // Anggota tim dari dashboard admin (Konten website > Divisi), disimpan 60 detik.
  // Kalau backend tidak bisa dihubungi, daftar bawaan di data/team.ts yang tampil.
  const fromDashboard = await getTeamMembers();
  const team = fromDashboard ? toWebsiteTeam(fromDashboard) : defaultTeam;

  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full justify-center bg-white/40 dark:bg-transparent px-5 pt-20 pb-28 sm:px-6 md:px-12 md:py-20 lg:px-16">
        <div className="w-full max-w-6xl">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    }>
      <DivisiContent team={team} />
    </Suspense>
  );
}
