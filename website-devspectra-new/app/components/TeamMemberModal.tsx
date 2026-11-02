"use client";

import { useEffect, useRef, type RefObject } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import MemberAvatar from "@/app/components/MemberAvatar";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  initials: string;
  email: string;
  category: "developer" | "media" | "marketing";
  /** false = sembunyikan dari bagian "Tim Kami" (beranda dan About) */
  homeVisible?: boolean;
  /** false = sembunyikan dari dropdown Anggota Tim di form Contact (misal: Owner) */
  contactVisible?: boolean;
  /** false = sembunyikan dari halaman Divisi */
  divisiVisible?: boolean;
  /** Foto dari dashboard (Konten website > Divisi). Kosong = inisial */
  photo?: string | null;
};

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18v12H3zM3 7l9 7 9-7" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path strokeLinecap="round" d="M4 20a8 8 0 0 1 16 0" />
  </svg>
);

const BadgeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" />
  </svg>
);

type Props = {
  member: TeamMember | null;
  onClose: () => void;
  triggerRef?: RefObject<HTMLElement | null>;
};

export default function TeamMemberModal({ member, onClose, triggerRef }: Props) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Open/close lifecycle: focus the card, trap Tab/Shift+Tab, close on Escape,
  // lock body scroll while open, and restore focus to the trigger on close.
  useEffect(() => {
    if (!member) return;

    // Remember what had focus before we stole it (the clicked name button).
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Capture the trigger now so the cleanup uses a stable reference.
    const trigger = triggerRef?.current ?? null;

    // Move focus into the dialog so screen readers announce the title.
    const card = cardRef.current;
    if (card) card.focus();

    const handleKeydown = (e: KeyboardEvent) => {
      // Escape closes the dialog.
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const cardEl = cardRef.current;
      if (!cardEl) return;

      const focusable = Array.from(
        cardEl.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);

      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || active === cardEl || !cardEl.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !cardEl.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeydown, true);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeydown, true);
      document.body.style.overflow = "";
      // Restore focus to the trigger that opened the modal.
      const toFocus = trigger ?? previouslyFocused;
      if (toFocus && typeof toFocus.focus === "function") {
        toFocus.focus();
      }
    };
  }, [member, onClose, triggerRef]);

  return (
    <MotionConfig reducedMotion="user">
    <AnimatePresence>
      {member && (
        <motion.div
          key="team-member-modal"
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="team-member-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Card */}
          <motion.div
            ref={cardRef}
            tabIndex={-1}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl shadow-black/30 outline-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400" />

            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <MemberAvatar
                  member={member}
                  sizes="56px"
                  className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-lg font-black text-white shadow-md"
                />
                <div>
                  <h2 id="team-member-modal-title" className="font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                    {member.name}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Divider */}
            <div className="mx-6 h-px bg-zinc-200 dark:bg-zinc-800" />

            {/* Details */}
            <div className="p-6 space-y-4">
              {/* Nama lengkap */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  <UserIcon />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-0.5">Nama Lengkap</p>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 break-words">{member.name}</p>
                </div>
              </div>

              {/* Posisi */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
                  <BadgeIcon />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-0.5">Posisi</p>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 break-words">{member.role}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                  <MailIcon />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-0.5">Email</p>
                  <a
                    href={`mailto:${member.email}`}
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline break-all"
                  >
                    {member.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <a
                href={`mailto:${member.email}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
              >
                <MailIcon />
                Kirim Email
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </MotionConfig>
  );
}
