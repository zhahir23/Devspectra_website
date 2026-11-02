import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "reviews.json");

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
};

function readReviews(): Review[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Review[];
  } catch {
    return [];
  }
}

function writeReviews(reviews: Review[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(reviews, null, 2), "utf-8");
}

// GET — ambil semua review
export async function GET() {
  const reviews = readReviews();
  return NextResponse.json(reviews);
}

// POST — simpan review baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { name?: string; rating: number; comment?: string };

    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: "Rating harus antara 1–5." }, { status: 400 });
    }

    const review: Review = {
      id: `rv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: body.name?.trim() || "Anonim",
      rating: body.rating,
      comment: body.comment?.trim() || "",
      createdAt: new Date().toISOString(),
    };

    const reviews = readReviews();
    reviews.unshift(review); // terbaru di atas
    writeReviews(reviews);

    return NextResponse.json({ success: true, review });
  } catch (err) {
    console.error("Review POST error:", err);
    return NextResponse.json({ error: "Gagal menyimpan review." }, { status: 500 });
  }
}
