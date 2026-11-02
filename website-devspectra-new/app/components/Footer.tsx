import Link from "next/link";
import LiveClock from "./LiveClock";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md px-6 py-6 md:px-12 transition-colors duration-300">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-sm text-zinc-500 sm:flex-row">
        <span>Made by Devspectra · © 2026</span>
        <LiveClock className="text-zinc-500 dark:text-zinc-400" />
        <div className="flex items-center gap-4">
          <Link href="/projects" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-200">
            Projects
          </Link>
          <Link href="/about" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-200">
            About
          </Link>
          <Link href="/contact" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-200">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
