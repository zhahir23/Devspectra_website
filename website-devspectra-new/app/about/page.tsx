import Link from "next/link";
import { aboutPageStyles as a } from "@/public/dummyStyles";
import Reveal from "@/app/components/Reveal";
import TeamSection from "@/app/components/TeamSection";
import { getTeamMembers } from "@/app/lib/api";
import { toWebsiteTeam } from "@/app/lib/website-content";

// Dirender setiap ada pengunjung, sama seperti beranda. Data dari dashboard tetap
// disimpan 60 detik (app/lib/api.ts), jadi backend tidak ditanya setiap kali.
export const revalidate = 0;

const interests = [
  "FULL-STACK DEV",
  "AI ENGINEERING",
  "UI/UX",
  "DEVOPS",
  "DIGITAL MARKETING",
];

const techStack = ["React", "Next.js", "Node.js", "TypeScript", "PostgreSQL", "Redis"];

const MailIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18v12H3zM3 7l9 7 9-7" />
  </svg>
);

export default async function About() {
  // Anggota tim dari dashboard (Konten website > Divisi). undefined = daftar bawaan di data/team.ts
  const teamRows = await getTeamMembers();
  const team = teamRows ? toWebsiteTeam(teamRows) : undefined;

  return (
    <div className={a.pageContainer}>
      <div className={a.contentContainer}>
        <div className={a.backgroundContainer}>
          <div className={a.contentWrapper}>

            {/* Heading */}
            <Reveal as="h1" className={a.mainHeading}>Devspectra</Reveal>

            {/* Interests */}
            <Reveal as="div" delay={100} variant="fade" className={a.interestsContainer}>
              {interests.map((item, i) => (
                <span key={item} className={a.interestItem}>
                  {item}
                  {i < interests.length - 1 && (
                    <span className={a.interestSeparator}>→</span>
                  )}
                </span>
              ))}
            </Reveal>

            {/* Tech stack pills */}
            <Reveal as="div" delay={180} className={a.techStackContainer}>
              {techStack.map((tech) => (
                <span key={tech} className={a.techPill}>{tech}</span>
              ))}
            </Reveal>

            {/* Sections */}
            <div className={a.sectionsContainer}>
              <Reveal as="section">
                <h2 className={a.sectionHeading}>Siapa Kami</h2>
                <p className={a.paragraph}>
                  Halo! Kami Devspectra Digital Kreasi, agensi digital asal
                  Indonesia yang fokus membangun tools untuk menyederhanakan
                  pekerjaan orang. Kami aktif sejak 2018, menulis tentang AI,
                  LLM, frontend, backend, dan database.
                </p>
              </Reveal>

              <Reveal as="section">
                <h2 className={a.sectionHeading}>Apa yang Kami Lakukan</h2>
                <p className={a.paragraph}>
                  Kami membangun web development, UI/UX, DevOps, dan digital
                  marketing untuk klien. Fokus kami pada produk praktis yang
                  berorientasi pengguna — lebih sedikit demo, lebih banyak hal
                  yang benar-benar dipakai sehari-hari.
                </p>
              </Reveal>

              <Reveal as="section">
                <h2 className={a.sectionHeading}>Perjalanan Kami</h2>
                <p className={a.paragraph}>
                  Dari startup kecil hingga platform yang melayani jutaan
                  pengguna, tim kami telah memimpin desain dan pengembangan
                  produk lintas industri. Kami baru saja merilis beberapa
                  micro-build, menjaga momentum terus berjalan.
                </p>
              </Reveal>

              <Reveal as="section">
                <h2 className={a.sectionHeading}>Visi</h2>
                <p className={a.paragraph}>
                  LLM dan AI akan mengotomasi hal-hal rutin dan mengubah cara
                  kita bekerja. Kami berusaha tetap berada di garis depan
                  transformasi ini.
                </p>
              </Reveal>

              <Reveal as="section">
                <h2 className={a.sectionHeading}>Di Luar Kode</h2>
                <p className={a.paragraph}>
                  Kami menyukai eksplorasi teknologi baru, berbagi lewat tulisan,
                  dan membangun komunitas developer di Indonesia.{" "}
                  <Link href="/projects" className={a.contentLink}>
                    Lihat karya kami
                  </Link>
                  .
                </p>
              </Reveal>

              {/* Tim Kami */}
              <TeamSection team={team} />
            </div>

            {/* CTA */}
            <Reveal as="div" variant="fade" delay={100} className={a.ctaContainer}>
              <Link href="/contact" className={a.primaryButton}>
                Hubungi Kami
              </Link>
              <a
                href="https://mail.google.com/mail/?view=cm&to=devspectraa@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className={a.secondaryButton}
              >
                <MailIcon className={a.emailIcon} />
                E-Mail
              </a>
            </Reveal>

          </div>
        </div>
      </div>
    </div>
  );
}
