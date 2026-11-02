import Link from "next/link";
import {
  BriefcaseBusiness,
  Camera,
  Clapperboard,
  Cloud,
  CodeXml,
  Cpu,
  Drone,
  FileText,
  Globe,
  Mic,
  PenTool,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Reveal from "@/app/components/Reveal";
import type { BackendService } from "@/app/lib/api";
import { SERVICE_ICON_GRADIENT, serviceAnchor, serviceIconKey, type ServiceIconKey } from "@/app/lib/service-icons";

const ICONS: Record<ServiceIconKey, LucideIcon> = {
  web: Globe,
  mobile: Smartphone,
  desain: PenTool,
  video: Clapperboard,
  foto: Camera,
  drone: Drone,
  cloud: Cloud,
  tulisan: FileText,
  kode: CodeXml,
  animasi: Sparkles,
  iot: Cpu,
  pembicara: Mic,
  umum: BriefcaseBusiness,
};

export type ShownService = {
  id: number;
  name: string;
  description: string;
  anchor: string;
  icon: ServiceIconKey;
};

/** Layanan yang dicentang "Tampilkan di website" di dashboard, dengan urutan yang sama seperti di dashboard. */
export function toShownServices(rows: BackendService[]): ShownService[] {
  return rows
    .filter((s) => s.isActive !== false && (s.title || s.name || "").trim())
    .map((s) => {
      const name = (s.title || s.name || "").trim();
      return {
        id: s.id,
        name,
        description: (s.description ?? "").trim(),
        anchor: serviceAnchor(s.slug),
        icon: serviceIconKey(s.icon, name),
      };
    });
}

/**
 * Bagian "Layanan" di beranda, tepat di bawah perkenalan.
 * Isinya dari dashboard (Konten website > Layanan). Kalau belum ada yang tampil, bagian ini tidak muncul.
 */
export default function ServicesSection({ services }: { services: ShownService[] }) {
  if (services.length === 0) return null;

  return (
    <div id="layanan" className="mt-14 scroll-mt-24 md:mt-20">
      <Reveal as="h2" className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl md:text-3xl">
        Layanan
      </Reveal>
      <Reveal as="p" delay={100} className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
        Jasa yang bisa kami kerjakan untuk kamu.
      </Reveal>

      <ul className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2">
        {services.map((service, i) => {
          const Icon = ICONS[service.icon];
          return (
            <Reveal key={service.id} as="li" variant="scale" delay={(i % 2) * 120}>
              {/* id: tautan langsung ke layanan ini, misalnya /#web-development (ditampilkan juga di dashboard) */}
              <div
                id={service.anchor || undefined}
                className="group flex h-full scroll-mt-24 gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg"
              >
                <div
                  className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${SERVICE_ICON_GRADIENT[service.icon]} text-white shadow-md transition-transform duration-300 group-hover:scale-105`}
                >
                  <Icon className="h-7 w-7" strokeWidth={1.8} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 [overflow-wrap:anywhere]">{service.name}</h3>
                  {service.description && (
                    <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 [overflow-wrap:anywhere]">
                      {service.description}
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
          );
        })}
      </ul>

      <Reveal
        delay={150}
        className="mt-5 flex flex-col items-start gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Ada kebutuhan yang belum tercantum? Ceritakan saja ke kami.</p>
        <Link
          href="/contact"
          className="inline-flex flex-shrink-0 items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500"
        >
          Hubungi kami
        </Link>
      </Reveal>
    </div>
  );
}
