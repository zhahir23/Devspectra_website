"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { sidebarStyles as s } from "@/public/dummyStyles"
import { TypingAnimation } from "@/app/components/ui/typing-animation-demo-3"
import ThemeToggle from "@/app/components/ThemeToggle"
import LogoLink from "@/app/components/LogoLink"
import ProjectFilter from "@/app/components/ProjectFilter"
import DivisiFilter from "@/app/components/DivisiFilter"
import { clearOldBrowserData } from "@/app/lib/old-browser-data"


type IconProps = React.SVGProps<SVGSVGElement> & {
    className?: string;
};

const HomeIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" aria-hidden="true" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 11L12 4l9 7v9a1 1 0 0 1-1 1h-5v-5H9v5H4a1 1 0 0 1-1-1v-9z" />
  </svg>
);

const ProjectsIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" aria-hidden="true" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h10v8H4zM10 14h10v6H10zM14 4h6v6h-6z" />
  </svg>
);

const UserIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" aria-hidden="true" className={className} {...props}>
    <circle cx="12" cy="8" r="4" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 20a8 8 0 0 1 16 0" />
  </svg>
);

const MailIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" aria-hidden="true" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18v12H3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 7 9-7" />
  </svg>
);

const MenuIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" aria-hidden="true" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

const CloseIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" aria-hidden="true" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 8l8 8m0-8l-8 8" />
  </svg>
);

const ExperienceIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" aria-hidden="true" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h10l3 4v14H4V7z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v4h4M8 13h8M8 17h8" />
  </svg>
);

const ToolsIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" aria-hidden="true" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 7a4 4 0 0 1 0 8l6 6-2 2-6-6a4 4 0 1 1 2-10z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 8l3 3" />
  </svg>
);

const DivisiIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" aria-hidden="true" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.272-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.272.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
  </svg>
);

export default function Sidebar(): React.ReactElement {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    // Sidebar ada di semua halaman, jadi sisa data dari fitur lama dibersihkan di sini
    useEffect(() => {
        clearOldBrowserData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isMobileMenuOpen && !target.closest(".mobile-sidebar") && !target.closest(".mobile-menu-toggle")) {
                setIsMobileMenuOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsMobileMenuOpen(false);
        }

        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("click", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        }
    }, [isMobileMenuOpen]);

     const navItems: { href: string; label: string; Icon: React.ComponentType<IconProps> }[] = [
    { href: "/", label: "Home", Icon: HomeIcon },
    { href: "/projects", label: "Projects", Icon: ProjectsIcon },
    { href: "/divisi", label: "Divisi", Icon: DivisiIcon },
    { href: "/experience", label: "Pencapaian", Icon: ExperienceIcon },
    { href: "/tools", label: "Tools", Icon: ToolsIcon },
    { href: "/about", label: "About", Icon: UserIcon },
    { href: "/contact", label: "Contact", Icon: MailIcon },
  ];

  const socials = [
    {
      label: "TikTok",
      href: "https://www.tiktok.com/@devspectra_id?_r=1&_t=ZS-9AMcVY79K8i",
      svgPath: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/devspectra?stkn=MnFoZHNtdWZ1Zmtj",
      svgPath: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
    },
  ];

    return (
        <>
        {/* Mobile top navbar */}
        <div className={s.mobileTopNav}>
            <div className={s.mobileTopNavInner}>
                <LogoLink
                  imgSrc="/logo-devspectra-emblem.webp"
                  name="Devspectra Digital Kreasi"
                  typingClassName={s.mobileTyping}
                >
                  <TypingAnimation
                    className={s.mobileTyping}
                    words={["Web Development", "UI/UX", "Technical Writer", "Devops", "Android Developer"]}
                    loop
                  />
                </LogoLink>
                <button
                    type="button"
                    aria-label="Open menu"
                    className={`mobile-menu-toggle ${s.bottomMenuButton}`}
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <MenuIcon className={s.bottomMenuIcon} />
                </button>
                <ThemeToggle />
            </div>
        </div>

        <div className={s.mobileSpacer}></div>

        {/* Desktop sidebar */}
        <aside className={s.desktopSidebar} aria-labelledby="desktop-sidebar">

            <LogoLink
              imgSrc="/logo-devspectra-emblem.webp"
              name="Devspectra Digital Kreasi"
              typingClassName={s.desktopTyping}
            >
              <TypingAnimation
                className={s.desktopTyping}
                words={["Web Development", "UI/UX", "Technical Writer", "Devops", "Android Developer"]}
                loop
              />
            </LogoLink>

        <nav id="desktop-sidebar" className={s.navContainer} aria-label="Primary">
                      <ul className={s.navList}>
                        {navItems.map(({ href, label, Icon}) => (
                          <li key={href}>
                            {href === "/projects" ? (
                              <ProjectFilter
                                href={href}
                                label={label}
                                Icon={Icon}
                                navItem={s.navItem}
                                navItemActive={s.navItemActive}
                                navItemInactive={s.navItemInactive}
                                navIcon={s.navIcon}
                                navLabel={s.navLabel}
                              />
                            ) : href === "/divisi" ? (
                              <DivisiFilter
                                href={href}
                                label={label}
                                Icon={Icon}
                                navItem={s.navItem}
                                navItemActive={s.navItemActive}
                                navItemInactive={s.navItemInactive}
                                navIcon={s.navIcon}
                                navLabel={s.navLabel}
                              />
                            ) : (
                              <Link href={href} className={`${s.navItem} ${pathname === href ?
                                s.navItemActive : s.navItemInactive}`} aria-current={pathname === href ? "page" : undefined}>
                                <Icon className={s.navIcon}/>
                                <span className={s.navLabel}>{label}</span>
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                      <div className={s.connectLabel}>Connect</div>
                      <ul className={s.socialList}>
                        {socials.map((soc) => (
                          <li key={soc.label}>
                            <a href={soc.href} className={s.socialItem} title={soc.label}
                            rel="noopener noreferrer" target="_blank">
                              <svg className={s.socialIcon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d={soc.svgPath}/>
                              </svg>
                              <span className={s.socialLabel}>{soc.label}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>

                      {/* CV & Portofolio — Canva */}
                      <a
                        href="https://canva.link/bn3xmd31bc6rlxe"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-[#7D2AE8]">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.5 5.5c3.038 0 5.5 2.462 5.5 5.5 0 1.326-.469 2.544-1.244 3.494l1.128 1.128a.75.75 0 1 1-1.06 1.06l-1.129-1.127A5.472 5.472 0 0 1 12.5 16.5C9.462 16.5 7 14.038 7 11s2.462-5.5 5.5-5.5zm0 1.5A4 4 0 1 0 12.5 15 4 4 0 0 0 12.5 7zm0 1.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/>
                        </svg>
                        <span>CV &amp; Portofolio</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="ml-auto h-3.5 w-3.5 flex-shrink-0 text-zinc-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6m0 0v6m0-6L10 14"/>
                        </svg>
                      </a>
                      <div className="mt-6 flex items-center justify-between">
                        <span className="text-xs text-zinc-500 dark:text-zinc-500">Tema</span>
                        <ThemeToggle />
                      </div>
                    </nav>
        </aside>

        {/* Mobile slide-in menu overlay */}
        <div className={`${s.mobileOverlay} ${isMobileMenuOpen ? s.mobileOverlayVisible : s.mobileOverlayHidden}`}>
          <div className={`${s.mobileOverlayBg} ${isMobileMenuOpen ? s.mobileOverlayBgVisible : s.mobileOverlayBgHidden}`} onClick={() => setIsMobileMenuOpen(false)}/>
            <div className={`${s.mobileSidebar} ${isMobileMenuOpen ? s.mobileSidebarVisible : s.mobileSidebarHidden}`}>

              <div className={s.mobileSidebarHeader}>
                <div className={s.mobileHeaderInner}>
                  <div className={s.mobileAvatarContainer}>
                    <div className={s.mobileAvatar}>
                      <Image src="/logo-devspectra-emblem.webp" alt="Devspectra Avatar" width={40} height={40} className={s.mobileAvatarImage} priority/>
                    </div>
                    <div>
                      <div className={s.mobileName}>Devspectra</div>
                      <div className={s.mobileTyping}>Digital Kreasi</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Close menu"
                    className={s.mobileCloseButton}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <CloseIcon className={s.mobileCloseIcon} />
                  </button>
                </div>
              </div>

              <div className={s.mobileContent}>
                <div className={s.mobileSectionLabel}>Menu</div>
                <ul className={s.mobileNavList}>
                  {navItems.map(({ href, label, Icon }) => (
                    <li key={href}>
                      {href === "/projects" ? (
                        <ProjectFilter
                          href={href}
                          label={label}
                          Icon={Icon}
                          navItem={s.mobileNavItem}
                          navItemActive={s.navItemActive}
                          navItemInactive={s.navItemInactive}
                          navIcon={s.mobileNavIcon}
                          navLabel={s.mobileNavLabel}
                          onClose={() => setIsMobileMenuOpen(false)}
                        />
                      ) : href === "/divisi" ? (
                        <DivisiFilter
                          href={href}
                          label={label}
                          Icon={Icon}
                          navItem={s.mobileNavItem}
                          navItemActive={s.navItemActive}
                          navItemInactive={s.navItemInactive}
                          navIcon={s.mobileNavIcon}
                          navLabel={s.mobileNavLabel}
                          onClose={() => setIsMobileMenuOpen(false)}
                        />
                      ) : (
                        <Link
                          href={href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`${s.mobileNavItem} ${pathname === href ? s.navItemActive : s.navItemInactive}`}
                          aria-current={pathname === href ? "page" : undefined}
                        >
                          <Icon className={s.mobileNavIcon} />
                          <span className={s.mobileNavLabel}>{label}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>

                <div className={`${s.mobileSectionLabel} mt-8`}>Connect</div>
                <ul className={s.mobileSocialList}>
                  {socials.map((soc) => (
                    <li key={soc.label}>
                      <a href={soc.href} className={s.mobileSocialItem} title={soc.label} rel="noopener noreferrer" target="_blank">
                        <svg className={s.mobileSocialIcon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d={soc.svgPath} />
                        </svg>
                        <span className={s.mobileSocialText}>{soc.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>

                {/* CV & Portofolio — Canva */}
                <a
                  href="https://canva.link/bn3xmd31bc6rlxe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-[#7D2AE8]">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.5 5.5c3.038 0 5.5 2.462 5.5 5.5 0 1.326-.469 2.544-1.244 3.494l1.128 1.128a.75.75 0 1 1-1.06 1.06l-1.129-1.127A5.472 5.472 0 0 1 12.5 16.5C9.462 16.5 7 14.038 7 11s2.462-5.5 5.5-5.5zm0 1.5A4 4 0 1 0 12.5 15 4 4 0 0 0 12.5 7zm0 1.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/>
                  </svg>
                  <span>CV &amp; Portofolio</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="ml-auto h-3.5 w-3.5 flex-shrink-0 text-zinc-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6m0 0v6m0-6L10 14"/>
                  </svg>
                </a>
              </div>
            </div>
        </div>

        </>
    );
}
