"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { contactPageStyles as c } from "@/public/dummyStyles";
import Reveal from "@/app/components/Reveal";
import StarRating from "@/app/components/StarRating";
import {
  ORDER_ID_PATTERN,
  createInquiry,
  createReview,
  fetchOrderStatus,
  fetchTeamMembersInBrowser,
  type OrderStatus,
} from "@/app/lib/api";
import { toWebsiteTeam } from "@/app/lib/website-content";
import type { TeamMember } from "@/app/components/TeamMemberModal";
import { team } from "@/data/team";

// ID pesanan: DSP-XXXXXXXX. Dibuat di sini supaya ID yang sama tersimpan di
// dashboard (Klien masuk), tercantum di email notifikasi, dan di pesan WhatsApp.
// Klien memakai ID ini untuk mengecek pembayaran QRIS di bagian bawah halaman ini.
function generateOrderId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const random = new Uint32Array(8);
  crypto.getRandomValues(random);
  return `DSP-${Array.from(random, (n) => chars[n % chars.length]).join("")}`;
}

// "0812..." atau "62812..." → "812..." (tanda +62 sudah ditampilkan di depan kolom)
function normalizeWhatsapp(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("62")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

// "2026-10-26" → "Senin, 26 Oktober 2026" (sama seperti di email)
function formatMeetingDate(value: string): string {
  return new Date(value).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

// 2500000 → "Rp 2.500.000"
function formatRupiah(value: number): string {
  return `Rp ${new Intl.NumberFormat("id-ID").format(Math.round(value))}`;
}

// Tanggal dari backend ("2026-10-31T14:05:00", waktu Jakarta) → "31 Oktober 2026"
function formatBackendDate(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

// Kirim email notifikasi lewat API Next.js (app/api/contact)
async function sendEmailNotification(payload: Record<string, string>) {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
  if (!res.ok || !data.success) throw new Error(data.error ?? "Gagal mengirim email notifikasi.");
}

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const SendIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

type Status = "idle" | "loading" | "success" | "error";
type ReviewStatus = "idle" | "loading" | "done";
// Hasil "Cek Status" pembayaran QRIS. Statusnya diambil dari backend (GET /api/orders/{id}).
type QrisCheck =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "invalid" }
  | { state: "notfound"; orderId: string }
  | { state: "error"; message: string }
  | { state: "found"; order: OrderStatus };

// Service options for the "Jasa" dropdown on the contact form.
const SERVICE_OPTIONS = [
  "Mobile",
  "Web",
  "Deploy Website",
  "Technical Writer",
  "Pilot Drone",
  "Editing",
  "Desain",
  "Fotografer",
  "Videografer",
] as const;

type ServiceOption = (typeof SERVICE_OPTIONS)[number];

// Maps each service to its team category, driving which members appear in the
// "Anggota Tim" dropdown. Developer services → dev members; media services →
// media/creative members. Typed as Record<ServiceOption,...> so any new entry
// in SERVICE_OPTIONS that is not mapped here will produce a compile-time error.
const SERVICE_CATEGORY: Record<ServiceOption, "developer" | "media"> = {
  Mobile: "developer",
  Web: "developer",
  "Deploy Website": "developer",
  "Technical Writer": "developer",
  "Pilot Drone": "media",
  Editing: "media",
  Desain: "media",
  Fotografer: "media",
  Videografer: "media",
};

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "", subject: "", message: "", date: "", jasa: "", anggota: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [orderId, setOrderId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [savedName, setSavedName] = useState("");
  const [savedSubject, setSavedSubject] = useState("");
  const [savedWhatsapp, setSavedWhatsapp] = useState("");
  const [savedEmail, setSavedEmail] = useState("");
  const [savedJasa, setSavedJasa] = useState("");
  const [savedAnggota, setSavedAnggota] = useState("");

  // Review / rating state
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 0, comment: "" });
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>("idle");
  const [reviewError, setReviewError] = useState("");
  // true kalau penilaian langsung tampil di beranda (bintang 3-5 yang berisi ulasan)
  const [reviewShown, setReviewShown] = useState(false);

  // Pilihan "Anggota Tim": dari dashboard (Konten website > Divisi). Selama dimuat,
  // atau kalau backend tidak bisa dihubungi, daftar bawaan di data/team.ts yang dipakai.
  const [teamList, setTeamList] = useState<TeamMember[]>(team);
  useEffect(() => {
    let active = true;
    fetchTeamMembersInBrowser().then((rows) => {
      if (active && rows) setTeamList(toWebsiteTeam(rows));
    });
    return () => {
      active = false;
    };
  }, []);

  // QRIS payment check state
  const [qrisOpen, setQrisOpen] = useState(false);
  const [qrisOrderId, setQrisOrderId] = useState("");
  const [qrisCheck, setQrisCheck] = useState<QrisCheck>({ state: "idle" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      // Changing the service resets the team member selection so the member
      // list always matches the currently selected service.
      if (name === "jasa") {
        return { ...prev, jasa: value, anggota: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const newOrderId = generateOrderId();
      const whatsapp = normalizeWhatsapp(form.whatsapp);

      // Append the optional Jasa + Anggota Tim selections to the message so
      // they ride along to both backends without changing the API schema.
      const extraLines = [
        form.jasa ? `Jasa: ${form.jasa}` : "",
        form.anggota ? `Anggota Tim: ${form.anggota}` : "",
      ].filter(Boolean);
      const enrichedMessage = form.message + (extraLines.length ? `\n\n${extraLines.join("\n")}` : "");

      // Untuk dashboard: ditambah ID pesanan dan jadwal supaya tim bisa mencarinya
      const details = [`ID Pesanan: ${newOrderId}`, ...extraLines];
      if (form.date) details.push(`Jadwal Pertemuan: ${formatMeetingDate(form.date)}`);
      const dashboardMessage = `${form.message.trim()}\n\n---\n${details.join("\n")}`;

      // 1. Simpan ke backend Spring Boot → muncul di dashboard (Klien masuk)
      // 2. Kirim email notifikasi via Next.js API
      // Keduanya dikirim bersamaan. Pesan dianggap terkirim kalau salah satunya berhasil,
      // supaya pengunjung tidak mengirim ulang (pesan dobel) dan pesan tidak hilang.
      const [saved, emailed] = await Promise.allSettled([
        createInquiry({
          name: form.name,
          email: form.email,
          phone: whatsapp ? `+62${whatsapp}` : undefined,
          subject: form.subject.trim() || (form.jasa ? `Permintaan jasa ${form.jasa}` : "Pesan dari website"),
          message: dashboardMessage,
          orderId: newOrderId,
        }),
        sendEmailNotification({ ...form, whatsapp, message: enrichedMessage, orderId: newOrderId }),
      ]);

      if (saved.status === "rejected") console.warn("Pesan belum tersimpan di dashboard:", saved.reason);
      if (emailed.status === "rejected") console.warn("Email notifikasi gagal dikirim:", emailed.reason);
      if (saved.status === "rejected" && emailed.status === "rejected") {
        throw new Error(
          "Pesan belum terkirim. Coba lagi sebentar lagi, atau hubungi kami langsung lewat WhatsApp di +62 819-0304-2005."
        );
      }

      setOrderId(newOrderId);
      setStatus("success");
      setSavedName(form.name);
      setSavedSubject(form.subject);
      setSavedWhatsapp(whatsapp);
      setSavedEmail(form.email);
      setSavedJasa(form.jasa);
      setSavedAnggota(form.anggota);
      setForm({ name: "", email: "", whatsapp: "", subject: "", message: "", date: "", jasa: "", anggota: "" });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan.");
      setStatus("error");
    }
  };

  // Penilaian masuk ke dashboard (Konten website > Testimoni). Backend yang menentukan tampil
  // atau tidaknya: bintang 3-5 berisi ulasan langsung tampil di "Apa Kata Mereka", sisanya disembunyikan.
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewForm.rating === 0) return;
    setReviewStatus("loading");
    setReviewError("");
    try {
      const saved = await createReview({
        clientName: reviewForm.name.trim() || "Anonim",
        content: reviewForm.comment.trim(),
        rating: reviewForm.rating,
      });
      setReviewShown(saved?.isActive === true);
      setReviewStatus("done");
      setReviewForm({ name: "", rating: 0, comment: "" });
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Penilaian belum terkirim. Coba lagi sebentar lagi.");
      setReviewStatus("idle");
    }
  };

  const handleCheckQris = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = qrisOrderId.trim().toUpperCase();
    if (!ORDER_ID_PATTERN.test(id)) {
      setQrisCheck({ state: "invalid" });
      return;
    }
    setQrisOrderId(id); // tampilkan ID yang sudah dirapikan, misalnya "dsp-blm5xpqo " → "DSP-BLM5XPQO"
    setQrisCheck({ state: "loading" });
    try {
      const order = await fetchOrderStatus(id);
      setQrisCheck(order ? { state: "found", order } : { state: "notfound", orderId: id });
    } catch (err) {
      setQrisCheck({
        state: "error",
        message: err instanceof Error ? err.message : "Status pesanan belum bisa dicek. Coba lagi sebentar lagi.",
      });
    }
  };

  /* ── Success state ─────────────────────────────────────── */
  if (status === "success") {
    // Nomor WhatsApp admin Devspectra (format internasional tanpa +)
    const WA_NUMBER = "6281903042005";

    const waMessage = encodeURIComponent(
      `Halo Devspectra!\n\nSaya baru saja mengirim pesan melalui website.\n\n` +
      `ID Pesanan: ${orderId}\n` +
      `Nama: ${savedName || "-"}\n` +
      `Subject: ${savedSubject || "-"}\n` +
      (savedEmail ? `E-Mail: ${savedEmail}\n` : "") +
      (savedWhatsapp ? `No. WA Saya: +62${savedWhatsapp}\n` : "") +
      (savedJasa ? `Jasa: ${savedJasa}\n` : "") +
      (savedAnggota ? `Anggota Tim: ${savedAnggota}\n` : "") +
      `\nMohon konfirmasinya. Terima kasih!`
    );
    const waUrl = `https://wa.me/${WA_NUMBER}?text=${waMessage}`;

    return (
      <div className={c.pageContainer}>
        <div className={c.contentContainer}>
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            {/* Check icon */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 ring-1 ring-green-500/30">
              <CheckIcon className="h-9 w-9 text-green-400" />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
              Pesan terkirim!
            </h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">
              Kami akan segera menghubungi Anda kembali.
            </p>

            {/* ID Pesanan */}
            <div className="mt-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-6 py-4">
              <p className="text-xs uppercase tracking-widest text-zinc-500">ID Pesanan</p>
              <p className="mt-1 font-mono text-lg font-semibold text-zinc-900 dark:text-zinc-100">{orderId}</p>
              <p className="mt-1 text-xs text-zinc-500">Simpan ID ini untuk mengecek pembayaran QRIS setelah proyek selesai</p>
            </div>

            {/* Tombol WhatsApp */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center gap-3 rounded-xl bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all duration-200 hover:bg-[#1ebe5d] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-green-500/30 active:scale-95"
            >
              {/* WhatsApp icon */}
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 flex-shrink-0" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              Chat via WhatsApp
            </a>

            <button
              type="button"
              onClick={() => { setStatus("idle"); setOrderId(""); setSavedName(""); setSavedSubject(""); setSavedEmail(""); setSavedJasa(""); setSavedAnggota(""); }}
              className="mt-4 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 px-6 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 transition hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Kirim pesan lain
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Team members shown in the "Anggota Tim" dropdown, filtered by the selected
  // service's category. Empty until a Jasa is chosen.
  const isValidService = (s: string): s is ServiceOption =>
    SERVICE_OPTIONS.includes(s as ServiceOption);
  const availableMembers =
    form.jasa && isValidService(form.jasa)
      ? teamList.filter((m) => m.category === SERVICE_CATEGORY[form.jasa as ServiceOption] && m.contactVisible !== false)
      : [];

  /* ── Form state ────────────────────────────────────────── */
  return (
    <div className={c.pageContainer}>
      <div className={c.contentContainer}>
        <div className={c.formOuterContainer}>
          <div className={c.backgroundOverlay} />

          <header className={c.headerContainer}>
            <Reveal as="h1" className={c.headerTitle}>Get in Touch</Reveal>
            <Reveal as="p" delay={100} className={c.headerSubtitle}>
              Punya proyek atau sekadar ingin menyapa? Kami senang mendengar dari Anda.
            </Reveal>
          </header>

          {/* Contact method cards */}
          <Reveal as="div" delay={150} variant="fade" className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3 z-10">
            <a
              href="https://www.tiktok.com/@devspectra_id?_r=1&_t=ZS-9AMcVY79K8i"
              target="_blank"
              rel="noopener noreferrer"
              className={c.contactCard}
            >
              <div className={c.contactIconContainer}>
                <TikTokIcon className={c.contactIcon} />
              </div>
              <div>
                <div className={c.contactLabel}>TikTok</div>
                <div className={c.contactValue}>@devspectra_id</div>
              </div>
            </a>
            <a
              href="https://www.instagram.com/devspectra?stkn=MnFoZHNtdWZ1Zmtj"
              target="_blank"
              rel="noopener noreferrer"
              className={c.contactCard}
            >
              <div className={c.contactIconContainer}>
                <InstagramIcon className={c.contactIcon} />
              </div>
              <div>
                <div className={c.contactLabel}>Instagram</div>
                <div className={c.contactValue}>@devspectra</div>
              </div>
            </a>
            <a
              href="tel:+6281903042005"
              className={c.contactCard}
            >
              <div className={c.contactIconContainer}>
                <PhoneIcon className={c.contactIcon} />
              </div>
              <div>
                <div className={c.contactLabel}>Telepon / WhatsApp</div>
                <div className={c.contactValue}>+62 819-0304-2005</div>
              </div>
            </a>
          </Reveal>

          {/* Form */}
          <Reveal variant="scale" delay={200} className="w-full">
            <form className={c.formContainer} onSubmit={handleSubmit}>
              <div className={c.formGrid}>
                <div className={c.formFieldContainer}>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Name"
                    required
                    disabled={status === "loading"}
                    className={`${c.formInput} peer`}
                  />
                  <label htmlFor="name" className={`${c.formLabelBase} ${c.formLabelUnfocused}`}>
                    Name
                  </label>
                </div>

                <div className={c.formFieldContainer}>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                    disabled={status === "loading"}
                    className={`${c.formInput} peer`}
                  />
                  <label htmlFor="email" className={`${c.formLabelBase} ${c.formLabelUnfocused}`}>
                    Email
                  </label>
                </div>
              </div>

              {/* WhatsApp user */}
              <div className={c.formFieldContainer}>
                <div className="flex overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 transition-all focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-400 dark:focus-within:ring-zinc-600">
                  {/* Prefix +62 */}
                  <div className="flex items-center gap-1.5 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 px-3 text-sm text-zinc-500 dark:text-zinc-400 select-none">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-green-500" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                    +62
                  </div>
                  <input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    value={form.whatsapp}
                    onChange={handleChange}
                    placeholder="No. WhatsApp (cth: 8123456789)"
                    disabled={status === "loading"}
                    className="flex-1 bg-transparent px-3 py-4 text-sm text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  />
                </div>
              </div>

              <div className={c.formFieldContainer}>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                  disabled={status === "loading"}
                  className={`${c.formInput} peer`}
                />
                <label htmlFor="subject" className={`${c.formLabelBase} ${c.formLabelUnfocused}`}>
                  Subject
                </label>
              </div>

              {/* Jasa (service) — optional, drives the team member list */}
              <div className={c.formFieldContainer}>
                <label htmlFor="jasa" className="mb-1.5 block text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Jasa <span className="text-zinc-400 dark:text-zinc-500 font-normal">(opsional)</span>
                </label>
                <div className="relative">
                  <select
                    id="jasa"
                    name="jasa"
                    value={form.jasa}
                    onChange={handleSelectChange}
                    disabled={status === "loading"}
                    className="w-full appearance-none rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-4 pr-10 text-zinc-900 dark:text-zinc-100 outline-none transition-all focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed [color-scheme:light] dark:[color-scheme:dark]"
                  >
                    <option value="" disabled>Pilih Jasa</option>
                    {SERVICE_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                </div>
              </div>

              {/* Anggota Tim — optional, filtered by the selected Jasa */}
              <div className={c.formFieldContainer}>
                <label htmlFor="anggota" className="mb-1.5 block text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Anggota Tim <span className="text-zinc-400 dark:text-zinc-500 font-normal">(opsional)</span>
                </label>
                <div className="relative">
                  <select
                    id="anggota"
                    name="anggota"
                    value={form.anggota}
                    onChange={handleSelectChange}
                    disabled={!form.jasa || status === "loading"}
                    className="w-full appearance-none rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-4 pr-10 text-zinc-900 dark:text-zinc-100 outline-none transition-all focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed [color-scheme:light] dark:[color-scheme:dark]"
                  >
                    <option value="" disabled>Pilih Anggota Tim</option>
                    {availableMembers.map((m) => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                </div>
              </div>

              {/* Tanggal Pertemuan / Kalender */}
              <div className={c.formFieldContainer}>
                <div className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-3 transition-all focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-400 dark:focus-within:ring-zinc-600">
                  {/* Kalender icon */}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5 flex-shrink-0 text-zinc-400 dark:text-zinc-500" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path strokeLinecap="round" d="M3 10h18M8 2v4M16 2v4" />
                    <rect x="7" y="14" width="2" height="2" rx="0.5" fill="currentColor" stroke="none" />
                    <rect x="11" y="14" width="2" height="2" rx="0.5" fill="currentColor" stroke="none" />
                    <rect x="15" y="14" width="2" height="2" rx="0.5" fill="currentColor" stroke="none" />
                  </svg>
                  <div className="flex flex-1 flex-col">
                    <label htmlFor="date" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Jadwal Pertemuan <span className="text-zinc-400 dark:text-zinc-500 font-normal">(opsional)</span>
                    </label>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={handleChange}
                      disabled={status === "loading"}
                      min={new Date().toISOString().split("T")[0]}
                      className="mt-0.5 w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 outline-none [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              <div className={c.formFieldContainer}>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Message"
                  required
                  disabled={status === "loading"}
                  className={`${c.formTextarea} peer`}
                />
                <label htmlFor="message" className={`${c.formLabelBase} ${c.formLabelUnfocused}`}>
                  Message
                </label>
              </div>

              {/* Error message */}
              {status === "error" && (
                <p className="rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                  {errorMsg}
                </p>
              )}

              <div className={c.submitButtonContainer}>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className={`${c.submitButton} disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <span className={c.submitButtonText}>
                    {status === "loading" ? "Mengirim..." : "Send Message"}
                    {status !== "loading" && <SendIcon className={c.submitButtonIcon} />}
                  </span>
                </button>
              </div>
            </form>
          </Reveal>

          <Reveal as="p" variant="fade" delay={300} className={c.alternativeText}>
            Lebih suka menjadwalkan panggilan?{" "}
            <a href="tel:+6281903042005" className={c.alternativeLink}>
              +62 819-0304-2005
            </a>
          </Reveal>

          {/* ── Rating & Review Section ── */}
          <Reveal variant="scale" delay={100} className="mt-12 w-full">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-6 md:p-8">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 sm:text-xl">
                Penilaian &amp; Kritik Saran
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Bantu kami berkembang dengan memberikan penilaian jujur Anda.
              </p>

              {reviewStatus === "done" ? (
                <div className="mt-6 flex flex-col items-center gap-3 py-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/10 ring-1 ring-green-300 dark:ring-green-500/30">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-7 w-7 text-green-600 dark:text-green-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">Terima kasih atas penilaian Anda!</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {reviewShown
                      ? "Ulasan Anda akan tampil di beranda, bagian Apa Kata Mereka, paling lama 1 menit lagi."
                      : "Masukan Anda sudah kami terima dan sangat berarti bagi kami."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setReviewStatus("idle")}
                    className="mt-2 rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 transition hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    Beri penilaian lain
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="mt-6 space-y-5">
                  {/* Name */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Nama (opsional)
                    </label>
                    <input
                      type="text"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Nama Anda"
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none transition placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                    />
                  </div>

                  {/* Stars */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Penilaian <span className="text-red-500">*</span>
                    </label>
                    <StarRating
                      value={reviewForm.rating}
                      onChange={(r) => setReviewForm((p) => ({ ...p, rating: r }))}
                    />
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Kritik &amp; Saran (opsional)
                    </label>
                    <textarea
                      rows={4}
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                      placeholder="Tuliskan pengalaman atau saran Anda untuk kami..."
                      className="w-full resize-none rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none transition placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                    />
                  </div>

                  {reviewError && (
                    <p
                      id="review-error"
                      role="alert"
                      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400"
                    >
                      {reviewError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={reviewForm.rating === 0 || reviewStatus === "loading"}
                    className="rounded-xl bg-zinc-900 dark:bg-zinc-100 px-6 py-3 text-sm font-semibold text-zinc-100 dark:text-zinc-900 transition-all hover:bg-zinc-700 dark:hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reviewStatus === "loading" ? "Mengirim..." : "Kirim Penilaian"}
                  </button>
                </form>
              )}
            </div>
          </Reveal>

          {/* ── QRIS Payment Section ── */}
          <Reveal variant="scale" delay={150} className="mt-8 w-full">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 overflow-hidden">
              {/* Collapsible header */}
              <button
                type="button"
                onClick={() => setQrisOpen((prev) => !prev)}
                className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left transition hover:bg-zinc-100 dark:hover:bg-zinc-800/40 sm:px-6"
              >
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">💳 Pembayaran QRIS</h3>
                  <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">Cek status pembayaran setelah proyek selesai.</p>
                </div>
                <ChevronDownIcon
                  className={`mt-0.5 h-5 w-5 flex-shrink-0 text-zinc-400 transition-transform duration-200 ${
                    qrisOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Collapsible body */}
              {qrisOpen && (
                <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-5 space-y-4 sm:px-6 sm:py-6">
                  {/* Input + tombol — stack di mobile, sejajar di sm+ */}
                  <form onSubmit={handleCheckQris} className="flex flex-col gap-3 sm:flex-row">
                    <label htmlFor="qris-order-id" className="sr-only">ID pesanan</label>
                    <input
                      id="qris-order-id"
                      type="text"
                      value={qrisOrderId}
                      onChange={(e) => {
                        setQrisOrderId(e.target.value);
                        setQrisCheck({ state: "idle" });
                      }}
                      placeholder="Contoh: DSP-BLM5XPQO"
                      autoComplete="off"
                      spellCheck={false}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none transition placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 sm:flex-1"
                    />
                    <button
                      type="submit"
                      disabled={qrisCheck.state === "loading"}
                      className="w-full rounded-xl bg-zinc-900 dark:bg-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-100 dark:text-zinc-900 transition-all hover:bg-zinc-700 dark:hover:bg-zinc-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed sm:w-auto sm:flex-shrink-0"
                    >
                      {qrisCheck.state === "loading" ? "Mengecek..." : "Cek Status"}
                    </button>
                  </form>

                  {/* Result: format ID salah, tidak ditemukan, atau gagal terhubung */}
                  {(qrisCheck.state === "invalid" || qrisCheck.state === "notfound" || qrisCheck.state === "error") && (
                    <div
                      id="qris-message"
                      role="alert"
                      className="rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/30 px-4 py-3"
                    >
                      <p className="text-sm text-red-700 dark:text-red-400">
                        {qrisCheck.state === "invalid" &&
                          "Periksa kembali ID pesanan. Formatnya DSP- lalu 8 huruf atau angka, misalnya DSP-BLM5XPQO."}
                        {qrisCheck.state === "notfound" &&
                          `ID pesanan ${qrisCheck.orderId} tidak ditemukan. Periksa kembali penulisannya, atau hubungi kami lewat WhatsApp di +62 819-0304-2005.`}
                        {qrisCheck.state === "error" && qrisCheck.message}
                      </p>
                    </div>
                  )}

                  {/* Result: pending */}
                  {qrisCheck.state === "found" && qrisCheck.order.status === "pending" && (
                    <div id="qris-message" className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        ⏳ Proyek Anda sedang diproses. QRIS akan muncul setelah admin mengkonfirmasi selesai.
                      </p>
                    </div>
                  )}

                  {/* Result: paid — pembayaran sudah dikonfirmasi tim */}
                  {qrisCheck.state === "found" && qrisCheck.order.status === "paid" && (
                    <div id="qris-message" className="rounded-xl border border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-950/30 px-4 py-3">
                      <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                        Pembayaran sudah kami terima. Terima kasih!
                      </p>
                      <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                        Pesanan {qrisCheck.order.orderId}
                        {qrisCheck.order.billAmount ? ` sebesar ${formatRupiah(qrisCheck.order.billAmount)}` : ""} sudah lunas
                        {qrisCheck.order.paidAt && formatBackendDate(qrisCheck.order.paidAt)
                          ? ` sejak ${formatBackendDate(qrisCheck.order.paidAt)}`
                          : ""}
                        . Anda tidak perlu membayar lagi.
                      </p>
                    </div>
                  )}

                  {/* Result: completed — show QRIS image */}
                  {qrisCheck.state === "found" && qrisCheck.order.status === "completed" && (
                    <div className="flex flex-col items-center gap-4 pt-2">
                      {qrisCheck.order.billAmount && (
                        <div id="qris-total" className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-4 py-3 text-center">
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">Total pembayaran</p>
                          <p className="mt-0.5 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                            {formatRupiah(qrisCheck.order.billAmount)}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            Masukkan nominal ini saat membayar. Kami mengonfirmasi pembayaran setelah dananya masuk.
                          </p>
                        </div>
                      )}
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Scan QRIS untuk melakukan pembayaran
                      </p>
                      <Image
                        src="/qris.jpeg"
                        alt="QRIS Devspectra Digital Kreasi"
                        width={320}
                        height={420}
                        className="rounded-2xl shadow-xl"
                      />
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                        DEVSPECTRA DIGITAL KREASI · GoPay, BCA, Mandiri, BNI, BRI dan bank lainnya
                      </p>
                      {qrisCheck.order.completedAt && formatBackendDate(qrisCheck.order.completedAt) && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Selesai: {formatBackendDate(qrisCheck.order.completedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
