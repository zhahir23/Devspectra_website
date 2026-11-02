"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type Props = {
  imgSrc: string;
  name: string;
  typingClassName: string;
  children: React.ReactNode; // TypingAnimation
};

// Klik logo: pindah ke Home di dalam situs, seperti mengeklik menu Home (halaman tidak dimuat ulang).
// Tulisan "Welcome" / "Welcome Back" tidak muncul di sini, hanya saat situs dibuka (app/lib/welcome-intro.ts).
export default function LogoLink({ imgSrc, name, typingClassName, children }: Props) {
  const pathname = usePathname();
  // Perpindahan ke Home yang masih berjalan. Klik berikutnya diabaikan supaya permintaan tidak menumpuk.
  const pending = useRef(false);

  useEffect(() => {
    pending.current = false;
  }, [pathname]);

  // Hanya dipanggil untuk perpindahan di dalam situs. Ctrl/Cmd-klik tetap membuka tab baru seperti biasa.
  const handleNavigate = (e: { preventDefault: () => void }) => {
    if (pathname === "/") {
      // Sudah di Home: cukup kembali ke atas, tanpa memuat apa pun
      e.preventDefault();
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      return;
    }
    if (pending.current) {
      e.preventDefault();
      return;
    }
    pending.current = true;
    // Berjaga kalau perpindahan gagal: logo bisa dipakai lagi setelah beberapa detik
    window.setTimeout(() => {
      pending.current = false;
    }, 5000);
  };

  return (
    <Link href="/" onNavigate={handleNavigate} className="flex items-center gap-3 group" aria-label="Kembali ke Home">
      {/* shrink-0: tetap bulat 48x48 walaupun nama di sebelahnya panjang */}
      <div className="w-12 h-12 shrink-0 rounded-full overflow-hidden ring-1 ring-zinc-200 dark:ring-white/10 shadow-sm transition-transform duration-300 group-hover:scale-105">
        <Image src={imgSrc} alt="Devspectra Avatar" width={48} height={48} className="h-full w-full object-cover" priority />
      </div>
      <div>
        <div className="font-semibold text-zinc-900 dark:text-zinc-100">{name}</div>
        <div className={typingClassName}>{children}</div>
      </div>
    </Link>
  );
}
