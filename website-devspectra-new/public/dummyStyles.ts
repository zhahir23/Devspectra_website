import type { CSSProperties } from "react";

export const homePageStyles = {
  container: "relative z-10 p-6 pt-20 md:pt-16 md:p-20 bg-white/40 dark:bg-transparent",

  backgroundGrid: {
    wrapper: "pointer-events-none -z-20 absolute inset-0 [background-size:40px_40px] select-none",
    pattern: "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]"
  },

  gradientOverlay: "absolute inset-0 bg-linear-to-b from-white/40 via-transparent to-white/60 dark:from-black/40 dark:via-transparent dark:to-black/60 pointer-events-none",

  heroSection: "w-full max-w-[880px] mx-auto",

  h1: "text-[32px] sm:text-[44px] md:text-[55px] lg:text-[72px] xl:text-[72px] leading-[1.05] font-extrabold tracking-tight mb-3 text-zinc-900 dark:text-zinc-100 [overflow-wrap:anywhere]",
  h2: "text-xl sm:text-2xl md:text-3xl text-zinc-600 dark:text-zinc-300 font-medium mb-6",

  calloutCard: {
    wrapper: "w-full sm:w-auto sm:max-w-md md:max-w-lg lg:max-w-xl rounded-2xl p-3 bg-zinc-100/80 border border-zinc-200 dark:bg-white/5 dark:border-white/20 backdrop-blur-sm transition-all hover:bg-zinc-200/80 dark:hover:bg-white/10 hover:border-zinc-300 dark:hover:border-white/30",
    innerContainer: "flex flex-col sm:flex-row items-center sm:justify-between gap-3 sm:gap-4",
    textContainer: "flex items-center gap-3 min-w-0",
    icon: "w-5 h-5 text-zinc-600 dark:text-zinc-300 flex-shrink-0",
    text: "truncate text-sm font-medium text-zinc-700 dark:text-zinc-200",
    button: "mt-2 sm:mt-0 px-4 py-1 rounded-full border border-zinc-300 dark:border-zinc-600 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-sm shrink-0"
  },

  paragraph: "text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-7 mb-8 max-w-[720px]",
  link: "underline text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors",

  article: {
    wrapper: "rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shadow-lg overflow-hidden max-w-[720px]",
    videoContainer: "relative w-full h-auto overflow-hidden",
    video: "w-full h-auto max-h-[400px] object-cover",
    videoStyles: {
      WebkitUserSelect: 'none',
      userSelect: 'none',
      pointerEvents: 'none'
    } satisfies CSSProperties,
    content: "p-4",
    header: "flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 uppercase mb-2",
    headerIcon: "w-4 h-4",
    title: "font-semibold text-xl md:text-2xl text-zinc-900 dark:text-zinc-100 mb-2",
    description: "text-sm text-zinc-600 dark:text-zinc-300",
    linkContainer: "mt-4",
    link: "inline-flex items-center text-sm text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors",
    linkIcon: "w-4 h-4 ml-1"
  },

  spanInline: "inline-block align-middle",
  spanWithMargin: "inline-block mt-3 md:mt-0 sm:mt-0 lg:mt-0 xl:mt-0 align-middle z-20"
};

export const spotlightStyles = {
  position: "-top-40 -z-20 left-0 md:-top-20 md:left-60"
};

export const pageStyles = {
  container: "flex min-h-screen w-full items-start justify-center bg-white/40 dark:bg-transparent px-5 pt-20 pb-28 sm:px-6 md:px-12 md:py-20 md:pb-20 lg:px-16",
  wrapper: "w-full max-w-3xl",
  backgroundContainer: "relative",
  backgroundEffect: "absolute inset-0 rounded-xl overflow-hidden",
  content: "relative z-10",
  heading: "text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl md:text-6xl lg:text-7xl",
  interestsContainer: "mt-6 flex flex-wrap gap-x-3 gap-y-2 text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-400",
  interestItem: "flex items-center",
  dotSeparator: "ml-3 text-zinc-400 dark:text-zinc-600",
  techStackContainer: "mt-8 flex flex-wrap gap-3",
  techPill: "rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 px-4 py-1.5 text-sm text-zinc-700 dark:text-zinc-300 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100",
  sectionsContainer: "mt-16 space-y-12",
  section: "",
  sectionHeading: "text-2xl font-bold text-zinc-900 dark:text-zinc-100",
  sectionParagraph: "mt-4 leading-relaxed text-zinc-600 dark:text-zinc-400",
  link: "text-zinc-700 dark:text-zinc-200 underline decoration-zinc-400 dark:decoration-zinc-700 underline-offset-4 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100",
  ctaContainer: "mt-16 flex flex-wrap gap-4",
  ctaButtonPrimary: "rounded-lg bg-zinc-900 dark:bg-zinc-100 px-6 py-3 text-sm font-semibold text-zinc-100 dark:text-zinc-950 transition-all hover:bg-zinc-700 dark:hover:bg-zinc-200 hover:scale-105 active:scale-95 btn-hover",
  ctaButtonSecondary: "flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-6 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-100 transition-all hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 btn-hover",
  emailIcon: "h-4 w-4"
};

export const timelineStyles = {
  container: "min-h-screen bg-white/40 dark:bg-transparent px-5 pt-20 pb-28 sm:p-6 sm:pt-20 sm:pb-28 md:p-8 md:pt-20 md:pb-16 lg:pt-20 xl:pt-30",
  innerContainer: "mx-auto max-w-5xl",
  mainTitle: "mt-4 text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl md:text-5xl",
  mainParagraph: "mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400",

  timelineBadge: "inline-block rounded-full bg-blue-100 dark:bg-blue-900/20 px-4 py-1.5",
  timelineBadgeText: "text-sm font-medium text-blue-600 dark:text-blue-400",

  legendContainer: "mt-6 flex flex-wrap gap-4",
  legendItem: "flex items-center gap-2",
  legendDot: "h-2 w-2 rounded-full",
  legendText: "text-sm text-zinc-600 dark:text-zinc-400",

  itemContainer: "space-y-4",
  itemFlexContainer: "flex items-start gap-3",

  iconContainer: "mt-1 rounded-lg p-2",
  iconContainerBlue: "mt-1 rounded-lg bg-blue-100 dark:bg-blue-900/20 p-2",
  iconContainerPurple: "mt-1 rounded-lg bg-purple-100 dark:bg-purple-900/20 p-2",
  iconContainerGreen: "mt-1 rounded-lg bg-green-100 dark:bg-green-900/20 p-2",
  iconContainerAmber: "mt-1 rounded-lg bg-amber-100 dark:bg-amber-900/20 p-2",
  iconContainerRose: "mt-1 rounded-lg bg-rose-100 dark:bg-rose-900/20 p-2",
  iconContainerEmerald: "mt-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 p-2",

  iconSize: "h-5 w-5",
  iconBlue: "h-5 w-5 text-blue-500 dark:text-blue-400",
  iconPurple: "h-5 w-5 text-purple-500 dark:text-purple-400",
  iconGreen: "h-5 w-5 text-green-500 dark:text-green-400",
  iconAmber: "h-5 w-5 text-amber-500 dark:text-amber-400",
  iconRose: "h-5 w-5 text-rose-500 dark:text-rose-400",
  iconEmerald: "h-5 w-5 text-emerald-500 dark:text-emerald-400",

  contentTitle: "text-lg font-semibold text-zinc-900 dark:text-white",
  contentSubtitle: "mt-1 text-sm text-zinc-500 dark:text-zinc-400",
  contentText: "mt-2 text-sm text-zinc-600 dark:text-zinc-300",

  list: "space-y-2",
  listItem: "flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300",

  bullet: "mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full",
  bulletBlue: "mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500",
  bulletPurple: "mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-500",
  bulletGreen: "mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500",
  bulletAmber: "mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500",
  bulletRose: "mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-500",

  techBadgesContainer: "flex flex-wrap gap-2 pt-2",
  techBadge: "rounded-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-transparent px-3 py-1 text-xs text-zinc-700 dark:text-zinc-300",

  achievementGrid: "grid gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2",
  achievementCard: "rounded-lg bg-zinc-100 dark:bg-zinc-800/30 p-4 card-hover",
  achievementCardTitle: "text-sm font-semibold text-emerald-600 dark:text-emerald-400",
  achievementCardValue: "mt-1 text-2xl font-bold text-zinc-900 dark:text-white",
  achievementCardSub: "mt-1 text-xs text-zinc-500 dark:text-zinc-400",

  specializationContainer: "rounded-lg bg-zinc-100 dark:bg-zinc-800/30 p-4",
  specializationTitle: "text-sm font-semibold text-emerald-600 dark:text-emerald-400",
  specializationBadgesContainer: "mt-2 flex flex-wrap gap-2",
  specializationBadge: "rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-xs text-emerald-700 dark:text-emerald-300",

  techSectionContainer: "mt-12 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8",
  techSectionHeader: "flex items-center gap-3",
  techSectionIconContainer: "rounded-lg bg-zinc-200 dark:bg-zinc-800 p-3",
  techSectionIcon: "h-6 w-6 text-zinc-600 dark:text-zinc-300",
  techSectionTitle: "text-xl font-semibold text-zinc-900 dark:text-white",
  techSectionSubtitle: "text-sm text-zinc-500 dark:text-zinc-400",
  techGrid: "mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
  techCard: "rounded-lg bg-zinc-100 dark:bg-zinc-800/30 p-4 text-center card-hover",
  techCardTitle: "text-sm font-semibold",
  techCardContent: "mt-2 text-xs text-zinc-600 dark:text-zinc-300",

  textBlue: "text-blue-600 dark:text-blue-400",
  textPurple: "text-purple-600 dark:text-purple-400",
  textGreen: "text-green-600 dark:text-green-400",
  textAmber: "text-amber-600 dark:text-amber-400",
  textRose: "text-rose-600 dark:text-rose-400",
  textEmerald: "text-emerald-600 dark:text-emerald-400",
  textCyan: "text-cyan-600 dark:text-cyan-400",
};

export const aboutPageStyles = {
  pageContainer: "flex min-h-screen w-full items-start justify-center bg-white/40 dark:bg-transparent px-5 pt-20 pb-28 sm:px-6 md:px-12 md:py-20 md:pb-20 lg:px-16",
  contentContainer: "w-full max-w-3xl",

  backgroundContainer: "relative",
  backgroundEffect: "absolute inset-0 rounded-xl overflow-hidden",
  contentWrapper: "relative z-10",

  mainHeading: "text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl md:text-6xl lg:text-7xl",
  sectionHeading: "text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100",

  interestsContainer: "mt-6 flex flex-wrap gap-x-3 gap-y-2 text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-400",
  interestItem: "flex items-center",
  interestSeparator: "ml-3 text-zinc-400 dark:text-zinc-600",

  techStackContainer: "mt-8 flex flex-wrap gap-3",
  techPill: "rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 px-4 py-1.5 text-sm text-zinc-700 dark:text-zinc-300 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100",

  sectionsContainer: "mt-16 space-y-12",
  paragraph: "mt-4 leading-relaxed text-zinc-600 dark:text-zinc-400",

  contentLink: "text-zinc-700 dark:text-zinc-200 underline decoration-zinc-400 dark:decoration-zinc-700 underline-offset-4 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100",

  ctaContainer: "mt-16 flex flex-wrap gap-4",
  primaryButton: "rounded-lg bg-zinc-900 dark:bg-zinc-100 px-6 py-3 text-sm font-semibold text-zinc-100 dark:text-zinc-950 transition-all hover:bg-zinc-700 dark:hover:bg-zinc-200 hover:scale-105 active:scale-95 btn-hover",
  secondaryButton: "flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-6 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-100 transition-all hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 btn-hover",
  emailIcon: "h-4 w-4"
};

export const contactPageStyles = {
  pageContainer: "flex min-h-screen w-full items-start justify-center bg-white/40 dark:bg-transparent px-5 pt-20 pb-28 sm:px-6 md:px-12 md:py-20 md:pb-20 lg:px-16",
  contentContainer: "w-full max-w-2xl",

  formOuterContainer: "relative w-full overflow-hidden bg-white/40 dark:bg-transparent flex flex-col items-center justify-center rounded-lg",
  backgroundOverlay: "absolute inset-0 w-full h-full bg-white/30 dark:bg-zinc-950/30 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none",

  headerContainer: "mb-10 sm:mb-12 z-10 w-full",
  headerTitle: "text-4xl z-30 font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl md:text-6xl lg:text-7xl",
  headerSubtitle: "mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400",

  contactMethodsGrid: "mb-12 grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 z-10",

  contactCard: "group flex items-center gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg",
  contactIconContainer: "flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700 group-hover:text-zinc-900 dark:group-hover:text-zinc-100",
  contactIcon: "h-5 w-5",
  contactLabel: "text-sm font-medium text-zinc-500",
  contactValue: "text-zinc-700 dark:text-zinc-200 transition-colors group-hover:text-zinc-900 dark:group-hover:text-zinc-100",

  formContainer: "relative z-10 space-y-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 p-6 md:p-8",
  formGrid: "grid grid-cols-1 gap-6 md:grid-cols-2",

  formFieldContainer: "relative",
  formInput: "peer w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-4 text-zinc-900 dark:text-zinc-100 outline-none transition-all placeholder:text-transparent focus:border-zinc-400 dark:focus:border-zinc-600 focus:bg-zinc-50 dark:focus:bg-zinc-900 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600",
  formTextarea: "peer w-full resize-none rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-4 text-zinc-900 dark:text-zinc-100 outline-none transition-all placeholder:text-transparent focus:border-zinc-400 dark:focus:border-zinc-600 focus:bg-zinc-50 dark:focus:bg-zinc-900 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600",

  formLabelBase: "absolute left-4 transition-all",
  formLabelFocused: "-top-2.5 bg-zinc-100 dark:bg-zinc-800 px-2 rounded-2xl text-xs text-zinc-500 dark:text-zinc-400",
  formLabelUnfocused: "top-4 text-zinc-400 dark:text-zinc-500",

  submitButtonContainer: "pt-4",
  submitButton: "group relative w-full overflow-hidden rounded-xl bg-zinc-900 dark:bg-zinc-100 px-8 py-4 text-sm font-semibold text-zinc-100 dark:text-zinc-950 transition-all hover:bg-zinc-700 dark:hover:bg-zinc-200 hover:shadow-lg active:scale-[0.98] md:w-auto btn-hover",
  submitButtonText: "relative z-10 flex items-center justify-center gap-2",
  submitButtonIcon: "h-4 w-4 transition-transform group-hover:translate-x-1",

  alternativeText: "mt-8 text-center text-sm text-zinc-500",
  alternativeLink: "text-zinc-700 dark:text-zinc-300 underline decoration-zinc-400 dark:decoration-zinc-700 underline-offset-4 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
};

export const projectStyles = {
  pageContainer: "flex min-h-screen w-full justify-center bg-white/40 dark:bg-transparent px-5 pt-20 pb-28 sm:px-6 md:px-12 md:py-20 md:pb-20 lg:px-16",
  innerContainer: "w-full max-w-6xl",

  header: "mb-8 sm:mb-12",
  pageTitle: "text-3xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-4xl md:text-5xl",
  pageSubtitle: "mt-2 text-zinc-500 dark:text-zinc-400",

  projectsGrid: "grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 xl:grid-cols-3",

  projectCard: "group relative h-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg",

  imageContainer: "relative aspect-[16/10] w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800",
  projectImage: "h-full w-full transform object-cover transition-transform duration-500 group-hover:scale-105",

  statusBadgeContainer: "absolute right-3 top-3",
  statusBadge: "rounded-full px-3 py-1 text-xs font-medium backdrop-blur-md",
  statusActive: "bg-green-500/10 text-green-600 dark:text-green-400 ring-1 ring-green-500/20",
  statusInactive: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 ring-1 ring-zinc-500/20",

  bookmarkButton: "absolute right-3 top-12 rounded-full bg-white/80 dark:bg-zinc-950/80 p-2 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-900",
  bookmarkIcon: "h-4 w-4 text-zinc-500 dark:text-zinc-400",

  contentSection: "p-6",
  projectTitle: "text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-zinc-50",
  projectDescription: "mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400",

  tagsContainer: "mt-4 flex flex-wrap gap-2",
  tag: "rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-transparent px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100",

  actionsContainer: "mt-6 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4",
  actionsLinksContainer: "flex gap-2",

  visitButton: "rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-100 dark:text-zinc-900 transition-all hover:bg-zinc-700 dark:hover:bg-zinc-200 hover:shadow-lg btn-hover",
  otherButton: "rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-all hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 btn-hover",

  archivedText: "text-xs text-zinc-400 dark:text-zinc-500",

  titleComponentContainer: "flex items-center space-x-2 rounded-full bg-white/90 dark:bg-zinc-900/90 px-3 py-1.5 shadow-lg backdrop-blur-md border border-zinc-200 dark:border-zinc-800",
  titleComponentAvatar: "rounded-full border border-zinc-300 dark:border-zinc-700",
  titleComponentText: "text-sm font-medium text-zinc-700 dark:text-zinc-200",
};

export const styles = {
  timeline: timelineStyles,
  projects: projectStyles,
};

export const toolsPageStyles = {
  pageContainer: "flex min-h-screen w-full justify-center bg-white/40 dark:bg-transparent px-5 pt-20 pb-28 sm:px-6 md:px-12 md:py-20 md:pb-20 lg:px-16 xl:pt-16",
  contentContainer: "w-full max-w-6xl",

  headerContainer: "mb-8 sm:mb-12",
  headerTitle: "text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight mb-2",
  headerSubtitle: "text-sm sm:text-base text-zinc-500 dark:text-zinc-400",

  toolsGrid: "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4",

  toolCardLink: "group flex w-full cursor-pointer items-center gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg",
  toolIconContainer: "relative h-12 w-12 flex-shrink-0",
  toolIcon: "h-full w-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-110",
  toolTextContainer: "flex-1 min-w-0",
  toolName: "text-base font-medium text-zinc-800 dark:text-zinc-100 truncate group-hover:text-zinc-900 dark:group-hover:text-zinc-50",
  toolCategory: "text-xs text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-400"
};

export const projectDetailStyles = {
  pageContainer: "min-h-screen relative bg-white/40 dark:bg-transparent pt-20 px-4 sm:px-6 lg:px-8 pb-20 antialiased",
  innerContainer: "max-w-6xl mx-auto relative z-10",
  backButton: "inline-flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors",
  backIcon: "h-4 w-4",
  projectHeader: "mb-12",
  headerFlex: "flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6",
  headerLeft: "flex-1",
  titleContainer: "flex items-center gap-4 mb-4",
  projectTitle: "text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-zinc-100",
  statusBadge: "rounded-full px-3 py-1 text-sm font-medium",
  statusActive: "bg-green-500/10 text-green-600 dark:text-green-400 ring-1 ring-green-500/20",
  statusInactive: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 ring-1 ring-zinc-500/20",
  projectDescription: "text-lg text-zinc-600 dark:text-zinc-400 mb-6 max-w-3xl",
  tagsContainer: "flex flex-wrap gap-2 mb-8",
  tag: "rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-sm font-medium text-zinc-700 dark:text-zinc-300",
  actionButtonsContainer: "flex flex-wrap gap-3",
  visitButton: "inline-flex items-center gap-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-100 dark:text-zinc-900 transition-all hover:bg-zinc-700 dark:hover:bg-zinc-200 hover:shadow-lg hover:scale-105 btn-hover",
  secondaryButton: "inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition-all hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 btn-hover",
  buttonIcon: "h-4 w-4",
  imageContainer: "mb-12 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800",
  projectImage: "w-full h-auto aspect-video object-cover",
  gridContainer: "grid grid-cols-1 lg:grid-cols-3 gap-8",
  mainContent: "lg:col-span-2 space-y-12",
  sidebar: "space-y-8",
  sectionTitle: "text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6",
  sidebarSectionTitle: "text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4",
  prose: "prose prose-invert max-w-none",
  proseText: "text-zinc-600 dark:text-zinc-400 leading-relaxed",
  featuresGrid: "grid grid-cols-1 md:grid-cols-2 gap-4",
  featureCard: "rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors card-hover",
  featureCardInner: "flex items-start gap-3",
  featureIconContainer: "rounded-full bg-blue-500/10 p-1.5 mt-0.5",
  featureIcon: "h-2 w-2 rounded-full bg-blue-500",
  featureText: "text-zinc-600 dark:text-zinc-300",
  learningOutcomesGrid: "grid grid-cols-1 sm:grid-cols-2 gap-3",
  learningOutcomeCard: "flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 p-3",
  learningOutcomeNumber: "flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10",
  learningOutcomeNumberText: "text-xs font-medium text-green-600 dark:text-green-400",
  learningOutcomeText: "text-sm text-zinc-600 dark:text-zinc-400",
  sidebarSection: "rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-6",
  techStackContainer: "flex flex-wrap gap-2",
  techStackItem: "rounded-md bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300",
  linksContainer: "space-y-3",
  linkCard: "flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800",
  linkIcon: "h-5 w-5 text-zinc-500 dark:text-zinc-400",
  linkText: "text-zinc-700 dark:text-zinc-300",
  projectInfoContainer: "space-y-4",
  projectInfoLabel: "text-sm text-zinc-500 mb-1",
  authorContainer: "flex items-center gap-3",
  authorAvatar: "h-8 w-8 rounded-full border border-zinc-300 dark:border-zinc-700",
  authorName: "text-zinc-700 dark:text-zinc-300",
  projectInfoText: "text-zinc-700 dark:text-zinc-300 capitalize",
};

export const sidebarStyles = {
  mobileTopNav: "md:hidden fixed top-0 left-0 right-0 z-80 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md px-4 py-3",
  mobileTopNavInner: "flex items-center justify-between",
  mobileAvatarContainer: "flex items-center gap-3",
  mobileAvatar: "w-10 h-10 shrink-0 rounded-full overflow-hidden ring-1 ring-zinc-200 dark:ring-white/10 shadow-sm",
  mobileAvatarImage: "h-full w-full object-cover",
  mobileName: "font-semibold text-zinc-900 dark:text-zinc-100 text-base",
  mobileTyping: "text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[120px]",

  mobileSpacer: "md:hidden h-16",

  desktopSidebar: "hidden md:flex flex-col w-[260px] h-screen px-6 py-8 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border-r border-zinc-200 dark:border-zinc-800/60 fixed left-0 top-0 overflow-y-auto",
  desktopAvatarContainer: "flex items-center gap-3 mb-6",
  desktopAvatar: "w-12 h-12 rounded-full overflow-hidden ring-1 ring-zinc-200 dark:ring-white/10 shadow-sm",
  desktopAvatarImage: "object-cover",
  desktopName: "font-semibold text-zinc-900 dark:text-zinc-100",
  desktopTyping: "text-xs text-zinc-500 dark:text-zinc-400",

  navContainer: "flex-1",
  navList: "space-y-2",
  navItem: "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-150",
  navItemActive: "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50",
  navItemInactive: "text-zinc-600 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50 nav-hover",
  navIcon: "w-4 h-4 text-zinc-500 dark:text-zinc-300",
  navLabel: "text-sm",

  connectLabel: "mt-8 text-xs text-zinc-400 dark:text-zinc-500",
  socialList: "mt-3 space-y-2 text-sm",
  socialItem: "group flex items-center gap-2 text-zinc-500 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors link-hover",
  socialIcon: "w-4 h-4",
  socialLabel: "truncate",

  footerText: "mt-6 text-sm text-zinc-500 dark:text-zinc-400",

  mobileOverlay: "md:hidden fixed inset-0 z-[60] transition-all duration-300",
  mobileOverlayVisible: "opacity-100",
  mobileOverlayHidden: "opacity-0 pointer-events-none",
  mobileOverlayBg: "absolute inset-0 bg-black/50 dark:bg-black/70 transition-opacity duration-300",
  mobileOverlayBgVisible: "opacity-100",
  mobileOverlayBgHidden: "opacity-0",

  mobileSidebar: "mobile-sidebar absolute right-0 top-0 h-full w-full max-w-[320px] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-l border-zinc-200 dark:border-zinc-800/60 transform transition-transform duration-300 ease-out flex flex-col",
  mobileSidebarVisible: "translate-x-0",
  mobileSidebarHidden: "translate-x-full",
  mobileSidebarHeader: "p-6 border-b border-zinc-200 dark:border-zinc-800",
  mobileHeaderInner: "flex items-center justify-between mb-0",
  mobileHeaderAvatarContainer: "flex items-center gap-3",
  mobileCloseButton: "p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
  mobileCloseIcon: "w-5 h-5 text-zinc-500 dark:text-zinc-400",

  mobileContent: "p-6 overflow-y-auto flex-1 pb-8",
  mobileSectionLabel: "text-xs text-zinc-400 dark:text-zinc-500 mb-3",
  mobileNavList: "space-y-1",
  mobileNavItem: "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-150",
  mobileNavIcon: "w-5 h-5 text-zinc-500 dark:text-zinc-300",
  mobileNavLabel: "text-sm font-medium",

  mobileSocialSection: "mb-8",
  mobileSocialList: "space-y-2",
  mobileSocialItem: "flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors link-hover",
  mobileSocialIcon: "w-4 h-4",
  mobileSocialText: "text-sm",

  mobileFooter: "absolute bottom-0 left-0 right-0 p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-transparent",
  mobileFooterLabel: "text-sm text-zinc-500 dark:text-zinc-400 mb-4",
  mobileFooterText: "text-xs text-zinc-400 dark:text-zinc-400 flex justify-between",

  bottomNav: "md:hidden fixed bottom-0 left-0 right-0 z-50",
  bottomNavContainer: "mx-auto w-full px-4 pb-4",
  bottomNavInner: "max-w-lg mx-auto",
  bottomNavBar: "bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 px-2 py-2 flex items-center gap-2 shadow-2xl shadow-zinc-200/40 dark:shadow-black/40 rounded-xl",
  bottomNavGrid: "grid grid-cols-7 gap-1 flex-1",
  bottomNavLink: "p-2 rounded-lg transition-all duration-200 flex items-center justify-center",
  bottomNavLinkActive: "text-zinc-900 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800",
  bottomNavLinkInactive: "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
  bottomNavIcon: "w-4 h-4",
  bottomNavDivider: "h-6 w-px bg-zinc-200 dark:bg-zinc-800",
  bottomMenuButton: "p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors",
  bottomMenuIcon: "w-4 h-4",
};

export const divisiStyles = {
  pageContainer: "flex min-h-screen w-full justify-center bg-white/40 dark:bg-transparent px-5 pt-20 pb-28 sm:px-6 md:px-12 md:py-20 md:pb-20 lg:px-16",
  innerContainer: "w-full max-w-6xl",

  header: "mb-8 sm:mb-12",
  pageTitle: "text-3xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-4xl md:text-5xl",
  pageSubtitle: "mt-2 text-zinc-500 dark:text-zinc-400",

  membersGrid: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",

  memberCard: "group flex items-center gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg",
  memberAvatar: "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-semibold text-white shadow-md transition-transform duration-300 group-hover:scale-110",
  memberInfo: "min-w-0 flex-1",
  memberName: "block w-full truncate text-left font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:underline underline-offset-4",
  memberRole: "truncate text-xs text-zinc-500 dark:text-zinc-400",

  divisionBadge: "ml-auto flex-shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-300",
};
