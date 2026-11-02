import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Generate random order ID: DSP-XXXXXXXX
function generateOrderId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "DSP-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message, date, whatsapp, orderId: clientOrderId } = body as {
      name: string;
      email: string;
      subject: string;
      message: string;
      date?: string;
      whatsapp?: string;
      orderId?: string;
    };

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, dan message wajib diisi." },
        { status: 400 }
      );
    }

    // Pakai ID dari halaman Contact (ID yang sama juga tersimpan di dashboard)
    const orderId =
      typeof clientOrderId === "string" && /^DSP-[A-Z0-9]{8}$/.test(clientOrderId)
        ? clientOrderId
        : generateOrderId();
    const sentAt = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "full",
      timeStyle: "short",
    });

    // Create transporter using Gmail App Password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Email HTML template
    const html = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #09090b; color: #f4f4f5; margin: 0; padding: 0; }
          .wrapper { max-width: 600px; margin: 0 auto; background: #18181b; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #1d4ed8, #0f172a); padding: 32px 40px; }
          .header h1 { margin: 0; font-size: 22px; color: #fff; letter-spacing: -0.5px; }
          .header p { margin: 4px 0 0; font-size: 13px; color: #93c5fd; }
          .order-badge { display: inline-block; background: #1e3a5f; color: #60a5fa; border: 1px solid #2563eb; border-radius: 20px; padding: 6px 16px; font-size: 13px; font-weight: 700; letter-spacing: 1px; margin: 24px 40px 0; }
          .body { padding: 24px 40px 32px; }
          .field { margin-bottom: 20px; }
          .field label { display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #71717a; margin-bottom: 4px; }
          .field p { margin: 0; font-size: 15px; color: #f4f4f5; line-height: 1.6; }
          .message-box { background: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; }
          .divider { border: none; border-top: 1px solid #27272a; margin: 8px 0 24px; }
          .footer { background: #09090b; padding: 16px 40px; font-size: 12px; color: #52525b; border-top: 1px solid #27272a; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>📬 Pesan Baru Masuk</h1>
            <p>Devspectra Digital Kreasi — Contact Form</p>
          </div>
          <div class="order-badge">${orderId}</div>
          <div class="body">
            <hr class="divider" />
            <div class="field">
              <label>Nama</label>
              <p>${escapeHtml(name)}</p>
            </div>
            <div class="field">
              <label>Email</label>
              <p>${escapeHtml(email)}</p>
            </div>
            ${whatsapp ? `
            <div class="field">
              <label>No. WhatsApp</label>
              <p style="font-size:15px;font-weight:600;color:#4ade80;">+62${escapeHtml(whatsapp)}</p>
            </div>` : ""}
            <div class="field">
              <label>Subject</label>
              <p>${escapeHtml(subject || "(tidak diisi)")}</p>
            </div>
            <div class="field">
              <label>Pesan</label>
              <div class="message-box">
                <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
              </div>
            </div>
            <hr class="divider" />
            <div class="field">
              <label>Dikirim pada</label>
              <p>${sentAt} WIB</p>
            </div>
            <div class="field">
              <label>No. Telepon Admin</label>
              <p>+62 819-0304-2005</p>
            </div>
            ${date ? `
            <div class="field">
              <label>📅 Jadwal Pertemuan</label>
              <p style="font-size:16px;font-weight:700;color:#60a5fa;">${new Date(date).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Jakarta" })}</p>
            </div>
            ` : ""}
          </div>
          <div class="footer">
            ID Pesanan: <strong>${orderId}</strong> · Dikirim melalui form devspectra.id
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Devspectra Contact Form" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_TO,
      replyTo: email,
      subject: `[${orderId}] ${subject || "Pesan baru"} — dari ${name}${date ? ` 📅 ${date}` : ""}`,
      html,
    });

    return NextResponse.json({ success: true, orderId });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Contact form error:", message);
    return NextResponse.json(
      { error: `Gagal mengirim pesan: ${message}` },
      { status: 500 }
    );
  }
}

// Prevent XSS in email HTML
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
