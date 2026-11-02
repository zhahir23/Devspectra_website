// Mengubah data Projects dan anggota tim dari backend (dikelola di dashboard admin,
// Konten website > Projects dan Divisi) menjadi bentuk yang dipakai halaman website.
import type { TeamMember } from "@/app/components/TeamMemberModal";
import type { Project } from "@/data/projects";
import { mediaUrl, safeLink, type BackendProject, type BackendTeamMember } from "./api";

/** Urutan tampil dari dashboard: angka kecil dulu (yang kosong di akhir), lalu yang dibuat lebih dulu. */
function byOrder(a: { sortOrder: number | null; id: number }, b: { sortOrder: number | null; id: number }) {
  return (a.sortOrder ?? Infinity) - (b.sortOrder ?? Infinity) || a.id - b.id;
}

/** Project yang ditampilkan (status Tampil di dashboard), sudah urut. */
export function toWebsiteProjects(rows: BackendProject[]): Project[] {
  return rows
    .filter((p) => p.isActive !== false && p.title?.trim())
    .sort(byOrder)
    .map((p) => ({
      id: String(p.id),
      title: (p.title ?? "").trim(),
      description: p.description?.trim() ?? "",
      image: mediaUrl(p.imageUrl),
      status: p.status === "archived" ? "archived" : "active",
      category: p.category === "Media" ? "Media" : "IT",
      tags: (p.tags ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      canvaUrl: safeLink(p.canvaUrl),
    }));
}

// Divisi di dashboard -> kelompok yang dipakai halaman Divisi dan formulir Contact
const DIVISION_CATEGORY: Record<string, TeamMember["category"]> = {
  IT: "developer",
  Media: "media",
  Marketing: "marketing",
};

/** "Bagus Wibowo" -> "BW", "Rasya" -> "RA" (sama dengan backend). */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const text = words.length === 1 ? words[0].slice(0, 2) : `${words[0][0]}${words[words.length - 1][0]}`;
  return text.toUpperCase();
}

/** Anggota tim yang tampil di setidaknya satu tempat di website, sudah urut. */
export function toWebsiteTeam(rows: BackendTeamMember[]): TeamMember[] {
  return rows
    .filter((m) => m.name?.trim() && (m.showOnHome !== false || m.showInDivision !== false || m.showInContact !== false))
    .sort(byOrder)
    .map((m) => {
      const name = (m.name ?? "").trim();
      return {
        id: String(m.id),
        name,
        role: m.role?.trim() ?? "",
        initials: m.initials?.trim() || initialsOf(name),
        email: m.email?.trim() ?? "",
        category: DIVISION_CATEGORY[m.division ?? ""] ?? "developer",
        homeVisible: m.showOnHome !== false,
        divisiVisible: m.showInDivision !== false,
        contactVisible: m.showInContact !== false,
        photo: mediaUrl(m.photoUrl),
      };
    });
}
