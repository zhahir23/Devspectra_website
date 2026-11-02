"use client";

import { useRef, useState } from "react";
import Reveal from "@/app/components/Reveal";
import MemberAvatar from "@/app/components/MemberAvatar";
import TeamMemberModal, { type TeamMember } from "@/app/components/TeamMemberModal";
import { team as defaultTeam } from "@/data/team";

/**
 * Bagian "Tim Kami" (beranda dan About).
 * `team`: anggota tim dari dashboard (Konten website > Divisi), diambil halaman di server.
 * Kalau tidak diisi, memakai daftar bawaan di data/team.ts.
 */
export default function TeamSection({ className = "", team = defaultTeam }: { className?: string; team?: TeamMember[] }) {
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const members = team.filter((m) => m.homeVisible !== false);

  return (
    <section className={className}>
      <Reveal as="h2" className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl md:text-3xl">Tim Kami</Reveal>
      <Reveal as="p" delay={80} className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
        Orang-orang di balik Devspectra Digital Kreasi.
      </Reveal>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member, i) => (
          <Reveal
            key={member.id}
            variant="scale"
            delay={i * 90}
            className="group flex items-center gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg"
          >
            <MemberAvatar
              member={member}
              sizes="48px"
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-semibold text-white shadow-md transition-transform duration-300 group-hover:scale-110"
            />
            <div className="min-w-0">
              <button
                type="button"
                onClick={(e) => {
                  triggerRef.current = e.currentTarget;
                  setSelected(member);
                }}
                className="block w-full truncate text-left font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:underline underline-offset-4"
              >
                {member.name}
              </button>
              <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {member.role}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <TeamMemberModal member={selected} onClose={() => setSelected(null)} triggerRef={triggerRef} />
    </section>
  );
}
