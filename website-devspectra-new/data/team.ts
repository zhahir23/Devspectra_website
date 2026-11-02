import type { TeamMember } from "@/app/components/TeamMemberModal";

// Daftar bawaan anggota tim. Sumber utamanya dashboard admin (Konten website > Divisi);
// daftar ini hanya dipakai kalau backend tidak bisa dihubungi. Isinya sama dengan data awal
// yang dimasukkan backend (WebsiteContentSeeder.java).
// Every email uses the @devspectra.com domain.
// `category` groups members for the contact form's cascading dropdowns:
//   - "developer"  → Mobile, Web, Deploy Website, Technical Writer
//   - "media"      → Pilot Drone, Editing, Desain, Fotografer, Videografer
//   - "marketing"  → Marketing / promosi
export const team: TeamMember[] = [
  { id: "karol-purba",      name: "Karol Efrido Sanggam Purba", role: "Founder of Devspectra & Head Devspectra Bandung", initials: "KE", email: "karol@devspectra.com",  category: "developer",  contactVisible: false, divisiVisible: false },
  { id: "zhahir-furqon",    name: "Zhahir Furqon",              role: "Manajer & Head Devspectra Jakarta",              initials: "ZF", email: "zhahir@devspectra.com", category: "developer",  divisiVisible: false },
  { id: "cintya-silvana",   name: "Cintya Silvana",             role: "Secretary Devspectra & Developer",               initials: "CS", email: "cintya@devspectra.com", category: "developer",  divisiVisible: false },
  { id: "bagus-wibowo", name: "Bagus Wibowo", role: "Developer of Devspectra", initials: "BW", email: "bagus@devspectra.com", category: "developer" },
  { id: "adrian-ferdiansyah", name: "Adrian Ferdiansyah", role: "Pilot Drone & Head of Media Division", initials: "AF", email: "adrian@devspectra.com", category: "media" },
  { id: "rafi-arrusy", name: "Rafi Ar-Rusy", role: "Media Member & Editor Section of Devspectra", initials: "RA", email: "rafi@devspectra.com", category: "media" },
  { id: "rasya", name: "Rasya", role: "Media Member & Design Section of Devspectra", initials: "RS", email: "rasya@devspectra.com", category: "media" },
  { id: "alfin-wadani", name: "Alfin Dwi Wadani", role: "Developer of Devspectra", initials: "AD", email: "alfin@devspectra.com", category: "developer" },
  { id: "ahmad-afriadi", name: "Ahmad Afriadi Rahman", role: "DevOps of Devspectra", initials: "AA", email: "ahmad@devspectra.com", category: "developer" },
  { id: "cahya-nabil", name: "Cahya Nabil", role: "Head of Marketing at Devspectra", initials: "CN", email: "cahya@devspectra.com", category: "marketing" },
];
