import { timelineStyles as t } from "@/public/dummyStyles";
import Reveal from "@/app/components/Reveal";

// ── Award data ────────────────────────────────────────────────────────────────

type Award = {
  title: string;
  event?: string;
  category: "media" | "it";
  rank: string;         // "Juara 1", "Top 3", dst.
  rankColor: string;   // Tailwind text color
  ringColor: string;   // Tailwind ring/border color
  bgColor: string;     // Tailwind bg color
};

const awards: Award[] = [
  // Media
  {
    title: "Juara 3 Sinematografi",
    event: "",
    category: "media",
    rank: "🥉 Juara 3",
    rankColor: "text-amber-600 dark:text-amber-400",
    ringColor: "ring-amber-400/40",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    title: "Juara 3 Poster Terbaik",
    event: "",
    category: "media",
    rank: "🥉 Juara 3",
    rankColor: "text-amber-600 dark:text-amber-400",
    ringColor: "ring-amber-400/40",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    title: "Juara 3 Produser Terbaik",
    event: "",
    category: "media",
    rank: "🥉 Juara 3",
    rankColor: "text-amber-600 dark:text-amber-400",
    ringColor: "ring-amber-400/40",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    title: "Juara 3 Photo Competition",
    event: "Kategori LPSM",
    category: "media",
    rank: "🥉 Juara 3",
    rankColor: "text-amber-600 dark:text-amber-400",
    ringColor: "ring-amber-400/40",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    title: "Top 3 Logo Competition",
    event: "",
    category: "media",
    rank: "🏆 Top 3",
    rankColor: "text-yellow-600 dark:text-yellow-400",
    ringColor: "ring-yellow-400/40",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  {
    title: "Juara 2 Lomba Animasi 2D",
    event: "Indoposco × UBL",
    category: "media",
    rank: "🥈 Juara 2",
    rankColor: "text-zinc-500 dark:text-zinc-300",
    ringColor: "ring-zinc-400/40",
    bgColor: "bg-zinc-100 dark:bg-zinc-800/40",
  },
  // IT
  {
    title: "Tim Pengembangan Website",
    event: "Xayara Indonesia Group",
    category: "it",
    rank: "🤝 Kepercayaan",
    rankColor: "text-blue-600 dark:text-blue-400",
    ringColor: "ring-blue-400/40",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
];

// ── Icons ─────────────────────────────────────────────────────────────────────

const TrophyIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 2a1 1 0 0 1 1 1v1h4a1 1 0 0 1 1 1v3a4 4 0 0 1-3.16 3.912A6.003 6.003 0 0 1 13 13.917V16h1a3 3 0 0 1 3 3v1H7v-1a3 3 0 0 1 3-3h1v-2.083a6.003 6.003 0 0 1-2.84-1.005A4 4 0 0 1 5 8V4a1 1 0 0 1 1-1h4V3a1 1 0 0 1 1-1zm5 3h-3v4a2 2 0 0 0 3.874-.498A3.988 3.988 0 0 0 18 8V5h-1zm-8 0H6v3c0 .171.009.34.026.506A2 2 0 0 0 9 9V5z" />
  </svg>
);

const StarBadgeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 1.5l2.47 5.01 5.53.803-4 3.897.944 5.5L12 14.01l-4.944 2.7.944-5.5-4-3.897 5.53-.803L12 1.5z" />
  </svg>
);

const MediaIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className={className}>
    <rect x="2" y="5" width="15" height="14" rx="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9l5-3v12l-5-3V9z" />
  </svg>
);

const CodeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-4 3 4 3M16 9l4 3-4 3M13 5l-2 14" />
  </svg>
);

// ── Award Card ────────────────────────────────────────────────────────────────

function AwardCard({ award }: { award: Award }) {
  const isXayara = award.event?.includes("Xayara");

  return (
    <div
      className={`group relative flex flex-col gap-3 rounded-2xl border ${award.ringColor} ring-1 ${award.bgColor} p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg`}
    >
      {/* Trophy icon top-right */}
      <div className="absolute right-4 top-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <TrophyIcon className="h-12 w-12 text-zinc-900 dark:text-zinc-100" />
      </div>

      {/* Rank badge */}
      <span className={`w-fit rounded-full border border-current/20 bg-white/60 dark:bg-zinc-900/60 px-3 py-1 text-xs font-bold tracking-wide ${award.rankColor}`}>
        {award.rank}
      </span>

      {/* Title */}
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 leading-snug pr-8">
        {award.title}
      </h3>

      {/* Event / link */}
      {award.event && (
        isXayara ? (
          <a
            href="https://xayaraindonesiagroup.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            {award.event} ↗
          </a>
        ) : (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{award.event}</span>
        )
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Experience() {
  const mediaAwards = awards.filter((a) => a.category === "media");
  const itAwards    = awards.filter((a) => a.category === "it");

  return (
    <div className={t.container}>
      <div className={t.innerContainer}>

        {/* Header */}
        <Reveal as="div" variant="fade" className={t.timelineBadge}>
          <span className={t.timelineBadgeText}>Achievements</span>
        </Reveal>
        <Reveal as="h1" delay={80} className={t.mainTitle}>
          Pencapaian
        </Reveal>
        <Reveal as="p" delay={160} className={t.mainParagraph}>
          Penghargaan dan kepercayaan yang telah diraih Devspectra Digital Kreasi
          di bidang media dan teknologi.
        </Reveal>

        {/* ── Media Awards ─────────────────────────────────────── */}
        <div className="mt-16">
          <Reveal className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
              <MediaIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
                Penghargaan Media
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Prestasi di bidang kreatif dan media
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mediaAwards.map((award, i) => (
              <Reveal key={award.title} variant="scale" delay={i * 80}>
                <AwardCard award={award} />
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── IT Awards ────────────────────────────────────────── */}
        <div className="mt-14">
          <Reveal className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <CodeIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
                Kepercayaan Teknologi
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Proyek dan klien yang mempercayai tim kami
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {itAwards.map((award, i) => (
              <Reveal key={award.title} variant="scale" delay={i * 80}>
                <AwardCard award={award} />
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── Stats strip ─────────────────────────────────────── */}
        <Reveal variant="fade" delay={100} className="mt-16">
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-6 sm:grid-cols-4">
            {[
              { icon: "🏆", value: "6", label: "Penghargaan Media" },
              { icon: "💻", value: "1+", label: "Klien IT Terpercaya" },
              { icon: "🌟", value: "2025", label: "Berdiri Sejak" },
              { icon: "📍", value: "Bandung", label: "Antapani, Jawa Barat" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 text-center">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">{s.value}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{s.label}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ── Trophy decoration strip ─────────────────────────── */}
        <Reveal variant="fade" delay={150} className="mt-10 flex items-center justify-center gap-4 text-zinc-300 dark:text-zinc-700">
          {Array.from({ length: 7 }).map((_, i) => (
            <StarBadgeIcon key={i} className="h-5 w-5" />
          ))}
        </Reveal>

      </div>
    </div>
  );
}
