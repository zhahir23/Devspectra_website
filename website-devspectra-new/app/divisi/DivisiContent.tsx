"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { divisiStyles as d } from "@/public/dummyStyles";
import Reveal from "@/app/components/Reveal";
import MemberAvatar from "@/app/components/MemberAvatar";
import TeamMemberModal, { type TeamMember } from "@/app/components/TeamMemberModal";

/** Maps URL ?division= values to one or more category values in team data */
const divisionMap: Record<string, TeamMember["category"][]> = {
  IT:        ["developer"],
  Media:     ["media"],
  Marketing: ["marketing"],
};

/** Maps a category back to its display label for the badge */
const categoryLabel: Record<TeamMember["category"], string> = {
  developer: "IT",
  media:     "Media",
  marketing: "Marketing",
};

/** Isi halaman Divisi. `team` diambil app/divisi/page.tsx (dari dashboard, atau daftar bawaan). */
export default function DivisiContent({ team }: { team: TeamMember[] }) {
  const searchParams = useSearchParams();
  const active       = searchParams.get("division") ?? "";

  const [selected, setSelected]   = useState<TeamMember | null>(null);
  const triggerRef                 = useRef<HTMLElement | null>(null);

  const visible = active
    ? team.filter((m) => divisionMap[active]?.includes(m.category) && m.divisiVisible !== false)
    : team.filter((m) => m.divisiVisible !== false);

  return (
    <div className={d.pageContainer}>
      <div className={d.innerContainer}>
        <header className={d.header}>
          <Reveal as="h1" className={d.pageTitle}>Divisi</Reveal>
          <Reveal as="p" delay={100} className={d.pageSubtitle}>
            Tim Devspectra berdasarkan divisi.
            {active && (
              <span className="ml-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {active}
              </span>
            )}
          </Reveal>
        </header>

        <div className={d.membersGrid}>
          {visible.map((member, i) => (
            <Reveal
              key={member.id}
              variant="scale"
              delay={i * 80}
              className={d.memberCard}
            >
              {/* Avatar: foto dari dashboard, atau inisial */}
              <MemberAvatar member={member} sizes="48px" className={d.memberAvatar} />

              {/* Name + role */}
              <div className={d.memberInfo}>
                <button
                  type="button"
                  onClick={(e) => {
                    triggerRef.current = e.currentTarget;
                    setSelected(member);
                  }}
                  className={d.memberName}
                >
                  {member.name}
                </button>
                <div className={d.memberRole}>
                  {member.role}
                </div>
              </div>

              {/* Division badge — shown only when viewing all */}
              {!active && (
                <span className={d.divisionBadge}>
                  {categoryLabel[member.category]}
                </span>
              )}
            </Reveal>
          ))}
        </div>

        {visible.length === 0 && (
          <p className="mt-12 text-center text-zinc-500">
            Belum ada anggota pada divisi ini.
          </p>
        )}
      </div>

      <TeamMemberModal
        member={selected}
        onClose={() => setSelected(null)}
        triggerRef={triggerRef}
      />
    </div>
  );
}
