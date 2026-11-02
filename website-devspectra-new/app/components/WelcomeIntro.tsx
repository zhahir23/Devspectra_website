"use client";

import { useEffect, useState } from "react";
import { INTRO_SHOWN_KEY, VISITED_KEY } from "@/app/lib/welcome-intro";

// Aturan kapan tampil dan kata yang dipakai ada di app/lib/welcome-intro.ts
const SUBTITLE = "Devspectra Digital Kreasi";
const DURATION_MS = 2900;

const WORD_CLASS =
  "relative flex select-none flex-wrap justify-center gap-x-0 text-5xl font-extrabold tracking-tight text-zinc-100 sm:text-7xl md:text-8xl";

// Animasi per huruf
function letters(word: string) {
  return word.split("").map((letter, i) => (
    <span
      key={`${letter}-${i}`}
      className="animate-welcome-letter inline-block"
      style={{ animationDelay: `${i * 0.07}s` }}
    >
      {letter === " " ? "\u00A0" : letter}
    </span>
  ));
}

export default function WelcomeIntro() {
  // Server dan browser sama-sama mulai dengan tampil. Kalau tidak perlu tampil, skrip di
  // app/layout.tsx sudah menyembunyikannya lewat CSS sebelum halaman terlihat.
  const [show, setShow] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    const visible = root.dataset.intro === "first" || root.dataset.intro === "back";
    if (visible) {
      try {
        localStorage.setItem(VISITED_KEY, "1");
        sessionStorage.setItem(INTRO_SHOWN_KEY, "1");
      } catch {
        // Penyimpanan diblokir: tidak bisa diingat, jadi tampil sebagai "Welcome" setiap kali dibuka
      }
      document.body.style.overflow = "hidden";
    }
    const timer = setTimeout(
      () => {
        setShow(false);
        root.dataset.intro = "none";
        document.body.style.overflow = "";
      },
      visible ? DURATION_MS : 0,
    );
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className="welcome-intro animate-preloader-out fixed inset-0 z-[200] flex flex-col items-center justify-center bg-zinc-950"
      aria-hidden="true"
    >
      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.15),transparent_60%)]" />

      {/* Dua versi tulisan. CSS di app/globals.css memilih satu sesuai data-intro di <html> */}
      <p className={`welcome-intro__first ${WORD_CLASS}`}>{letters("Welcome")}</p>
      <p className={`welcome-intro__back ${WORD_CLASS}`}>{letters("Welcome Back")}</p>

      {/* Subtitle */}
      <p
        className="animate-welcome-pop relative mt-5 text-center text-sm uppercase tracking-[0.3em] text-zinc-500"
        style={{ animationDelay: "0.6s" }}
      >
        {SUBTITLE}
      </p>

      {/* Progress bar */}
      <div className="relative mt-10 h-0.5 w-48 overflow-hidden rounded-full bg-zinc-800">
        <div className="animate-bar-grow h-full rounded-full bg-gradient-to-r from-blue-500 to-zinc-100" />
      </div>
    </div>
  );
}
