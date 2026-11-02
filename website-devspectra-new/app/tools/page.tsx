import Image from "next/image";
import { toolsPageStyles as tl } from "@/public/dummyStyles";
import Reveal from "@/app/components/Reveal";

// ── IT Tools (tetap seperti sebelumnya) ─────────────────
type Tool = {
  name: string;
  category: string;
  image?: string;
  initials?: string;
};

const tools: Tool[] = [
  { name: "VS Code",        category: "IDE",        image: "/vscode.webp" },
  { name: "DBeaver",        category: "Database",   image: "/dbeaver.svg" },
  { name: "Neon",           category: "Database",   initials: "N" },
  { name: "PostgreSQL",     category: "Database",   image: "/postgres.svg" },
  { name: "Java (JDK)",     category: "Language",   image: "/java.svg" },
  { name: "Python",         category: "Language",   image: "/python.svg" },
  { name: "Android Studio", category: "IDE",        image: "/android.webp" },
  { name: "Ubuntu",         category: "OS",         image: "/ubuntu.svg" },
  { name: "Figma",          category: "Design",     image: "/figma.svg" },
  { name: "Antigravity",    category: "IDE",        initials: "AG" },
  { name: "Kiro",           category: "IDE",        initials: "K" },
];

// ── Skill SVG icons (inline, tidak butuh file gambar) ───
type Skill = {
  name: string;
  description: string;
  gradient: string;       // Tailwind gradient classes untuk latar icon
  icon: React.ReactNode;
};

// Icon components
const CodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-7 w-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-4 3 4 3M16 9l4 3-4 3M13 5l-2 14" />
  </svg>
);
const PenToolIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-7 w-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-7 w-7">
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
  </svg>
);
const ServerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-7 w-7">
    <rect x="2" y="3" width="20" height="5" rx="2" />
    <rect x="2" y="10" width="20" height="5" rx="2" />
    <rect x="2" y="17" width="20" height="5" rx="2" />
    <circle cx="6" cy="5.5" r="0.8" fill="currentColor" />
    <circle cx="6" cy="12.5" r="0.8" fill="currentColor" />
    <circle cx="6" cy="19.5" r="0.8" fill="currentColor" />
  </svg>
);
const FileTextIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-7 w-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6M8 13h8M8 17h5" />
  </svg>
);
const PaletteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-7 w-7">
    <circle cx="12" cy="12" r="9" />
    <circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="15" cy="9" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="9"  cy="15" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="15" cy="15" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="7"  r="1.5" fill="currentColor" stroke="none" />
  </svg>
);
const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-7 w-7">
    <rect x="2" y="5" width="15" height="14" rx="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9l5-3v12l-5-3V9z" />
  </svg>
);
const DroneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-7 w-7">
    <circle cx="12" cy="12" r="2" />
    <path strokeLinecap="round" d="M4 4h4v4H4zM16 4h4v4h-4zM4 16h4v4H4zM16 16h4v4h-4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7l3.5 3.5M17 7l-3.5 3.5M7 17l3.5-3.5M17 17l-3.5-3.5" />
  </svg>
);
const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-7 w-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const itSkills: Skill[] = [
  {
    name: "UI/UX Design",
    description: "Merancang antarmuka yang intuitif dan pengalaman pengguna yang menyenangkan",
    gradient: "from-violet-500 to-purple-600",
    icon: <PenToolIcon />,
  },
  {
    name: "Web Development",
    description: "Membangun website modern, responsif, dan berperforma tinggi",
    gradient: "from-blue-500 to-cyan-500",
    icon: <GlobeIcon />,
  },
  {
    name: "Deploy & DevOps",
    description: "Setup infrastruktur, CI/CD pipeline, dan deployment aplikasi ke cloud",
    gradient: "from-emerald-500 to-teal-600",
    icon: <ServerIcon />,
  },
  {
    name: "Technical Writer",
    description: "Dokumentasi teknis, panduan API, dan konten edukatif seputar teknologi",
    gradient: "from-amber-500 to-orange-500",
    icon: <FileTextIcon />,
  },
  {
    name: "Joki Per-kodingan",
    description: "Bantuan coding untuk tugas, skripsi, proyek kampus, dan freelance",
    gradient: "from-rose-500 to-pink-500",
    icon: <CodeIcon />,
  },
];

const mediaSkills: Skill[] = [
  {
    name: "Desain Grafis",
    description: "Logo, brand identity, poster, lanyard, PDH, dan materi visual lainnya",
    gradient: "from-fuchsia-500 to-pink-500",
    icon: <PaletteIcon />,
  },
  {
    name: "Video Editor",
    description: "Editing video acara, reels, dokumentasi, dan konten sosial media",
    gradient: "from-red-500 to-rose-600",
    icon: <VideoIcon />,
  },
  {
    name: "Drone Pilot",
    description: "Aerial photography & videography untuk acara, properti, dan event outdoor",
    gradient: "from-sky-500 to-blue-600",
    icon: <DroneIcon />,
  },
  {
    name: "Fotografer",
    description: "Foto acara, produk, portrait, dan dokumentasi profesional",
    gradient: "from-zinc-600 to-zinc-800",
    icon: <CameraIcon />,
  },
];

// ── Media Tools data ─────────────────────────────────────
type MediaTool = {
  name: string;
  category: string;
  gradient: string;
  icon: React.ReactNode;
};

const mediaTools: MediaTool[] = [
  {
    name: "Adobe Premiere Pro",
    category: "Video Editing",
    gradient: "from-[#9999FF] to-[#2B2B8F]",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6" aria-hidden="true">
        <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm2.5 5v10h1.8v-4h2c1.8 0 3-1.1 3-3s-1.2-3-3-3H6.5zm1.8 1.6h1.9c.9 0 1.4.5 1.4 1.4s-.5 1.4-1.4 1.4H8.3V8.6zm7.2-1.6v10h2.2c2.4 0 3.8-1.6 3.8-5s-1.4-5-3.8-5h-2.2zm1.8 1.6h.3c1.3 0 2.1.9 2.1 3.4s-.8 3.4-2.1 3.4h-.3V8.6z"/>
      </svg>
    ),
  },
  {
    name: "Adobe After Effects",
    category: "Motion Graphics",
    gradient: "from-[#9999FF] to-[#00005B]",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6" aria-hidden="true">
        <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm4.5 5L5 17h2l.8-2.2h3.4L12 17h2L10.5 7H8.5zm1 2 1.2 3.5H8.3L9.5 9zm7.2-2v10H18V7h-1.3z"/>
      </svg>
    ),
  },
  {
    name: "Canva",
    category: "Design",
    gradient: "from-[#00C4CC] to-[#7D2AE8]",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2c4.418 0 8 3.582 8 8 0 1.48-.403 2.865-1.106 4.053C18.21 13.68 16.944 13 15.5 13c-1.38 0-2.5 1.12-2.5 2.5 0 .828.403 1.562 1.022 2.022A7.964 7.964 0 0 1 12 18c-1.48 0-2.865-.403-4.053-1.106C8.32 16.21 9 14.944 9 13.5 9 12.12 7.88 11 6.5 11c-.828 0-1.562.403-2.022 1.022A7.964 7.964 0 0 1 4 12c0-4.418 3.582-8 8-8z"/>
      </svg>
    ),
  },
  {
    name: "DaVinci Resolve",
    category: "Color Grading",
    gradient: "from-[#ff6b35] to-[#b71c1c]",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6" aria-hidden="true">
        <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 2a8 8 0 0 1 8 8 8 8 0 0 1-8 8 8 8 0 0 1-8-8 8 8 0 0 1 8-8zm0 2a6 6 0 1 0 0 12A6 6 0 0 0 12 6zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
      </svg>
    ),
  },
  {
    name: "Adobe Lightroom",
    category: "Photo Editing",
    gradient: "from-[#31A8FF] to-[#0B3B6B]",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6" aria-hidden="true">
        <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm2 5v10h7v-1.6H7.8V7H6zm8.5 0v10h2c2.2 0 3.5-1.5 3.5-5s-1.3-5-3.5-5h-2zm1.8 1.6h.1c1.2 0 1.8.9 1.8 3.4s-.6 3.4-1.8 3.4h-.1V8.6z"/>
      </svg>
    ),
  },
  {
    name: "Adobe Photoshop",
    category: "Photo Editing",
    gradient: "from-[#31A8FF] to-[#001D34]",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6" aria-hidden="true">
        <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm2.5 5v10h1.8v-3.5h1.7c2 0 3.2-1.1 3.2-3.2C13.2 8.1 12 7 10 7H6.5zm1.8 1.5h1.6c1 0 1.5.5 1.5 1.8 0 1.2-.5 1.7-1.5 1.7H8.3V8.5zm7.6-.5c-1.4 0-2.1.6-2.1 1.6 0 .9.5 1.5 1.8 2 1 .4 1.2.7 1.2 1.1 0 .5-.4.8-1.1.8-.6 0-1.1-.2-1.6-.5v1.6c.4.2 1 .4 1.7.4 1.6 0 2.4-.8 2.4-2 0-1-.5-1.6-1.9-2.1-.9-.4-1.1-.6-1.1-1 0-.4.3-.7.9-.7.5 0 1 .2 1.4.4V8.5c-.4-.2-.9-.5-1.6-.5z"/>
      </svg>
    ),
  },
  {
    name: "Adobe Illustrator",
    category: "Vector Design",
    gradient: "from-[#FF9A00] to-[#FF3000]",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6" aria-hidden="true">
        <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm4.8 5L5.3 17h2l.8-2.2h3.5L12.4 17h2L10.8 7H8.8zm1 2.2 1.2 3.5H8.5l1.3-3.5zM16 7v10h1.8V7H16z"/>
      </svg>
    ),
  },
];

// ── Skill Card ───────────────────────────────────────────
function SkillCard({ skill }: { skill: Skill }) {
  return (
    <div className="group flex gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg">
      {/* Icon container */}
      <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${skill.gradient} text-white shadow-md transition-transform duration-300 group-hover:scale-105`}>
        {skill.icon}
      </div>
      {/* Text */}
      <div className="min-w-0">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{skill.name}</h3>
        <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {skill.description}
        </p>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────
export default function Tools() {
  return (
    <div className={tl.pageContainer}>
      <div className={tl.contentContainer}>

        {/* ── Tools Section ── */}
        <header className={tl.headerContainer}>
          <Reveal as="h1" className={tl.headerTitle}>Tools</Reveal>
          <Reveal as="p" delay={100} className={tl.headerSubtitle}>
            Tools yang sering kami pakai untuk membuat hidup lebih mudah.
          </Reveal>
        </header>

        <div className={tl.toolsGrid}>
          {tools.map((tool, i) => (
            <Reveal key={tool.name} variant="scale" delay={i * 60} className={tl.toolCardLink}>
              <div className={tl.toolIconContainer}>
                {tool.image ? (
                  <Image
                    src={tool.image}
                    alt={tool.name}
                    fill
                    sizes="48px"
                    className={tl.toolIcon}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-800 text-sm font-semibold text-zinc-700 dark:text-zinc-200 transition-transform duration-300 group-hover:scale-110">
                    {tool.initials}
                  </div>
                )}
              </div>
              <div className={tl.toolTextContainer}>
                <div className={tl.toolName}>{tool.name}</div>
                <div className={tl.toolCategory}>{tool.category}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ── IT Skills Section ── */}
        <div className="mt-16 md:mt-20">
          <Reveal>
            <div className="flex items-center gap-3 mb-2">
              <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                IT
              </span>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                Skills Teknologi
              </h2>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
              Keahlian tim kami di bidang teknologi informasi.
            </p>
          </Reveal>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {itSkills.map((skill, i) => (
              <Reveal key={skill.name} variant="scale" delay={i * 80}>
                <SkillCard skill={skill} />
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── Media Skills Section ── */}
        <div className="mt-14 md:mt-20">
          <Reveal>
            <div className="flex items-center gap-3 mb-2">
              <span className="rounded-full bg-pink-100 dark:bg-pink-900/30 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-pink-600 dark:text-pink-400">
                Media
              </span>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                Skills Media
              </h2>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
              Keahlian tim kami di bidang media kreatif.
            </p>
          </Reveal>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            {mediaSkills.map((skill, i) => (
              <Reveal key={skill.name} variant="scale" delay={i * 80}>
                <SkillCard skill={skill} />
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── Media Tools Section ── */}
        <div className="mt-14 md:mt-20">
          <Reveal>
            <div className="flex items-center gap-3 mb-2">
              <span className="rounded-full bg-orange-100 dark:bg-orange-900/30 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-orange-600 dark:text-orange-400">
                Media Tools
              </span>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                Software Media
              </h2>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
              Software yang kami gunakan untuk produksi media kreatif.
            </p>
          </Reveal>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {mediaTools.map((tool, i) => (
              <Reveal key={tool.name} variant="scale" delay={i * 60}>
                <div className="group flex items-center gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg">
                  {/* Logo icon */}
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tool.gradient} shadow-md transition-transform duration-300 group-hover:scale-110`}>
                    {tool.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{tool.name}</p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{tool.category}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
