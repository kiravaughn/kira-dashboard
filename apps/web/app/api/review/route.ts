import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

const NOTIFICATIONS_DIR = "/home/kira/.openclaw/workspace/notifications";

function writeNotification(review: { filePath: string; status: string; notes: string | null; reviewedAt: Date | null }) {
  try {
    fs.mkdirSync(NOTIFICATIONS_DIR, { recursive: true });
    const now = new Date();
    const timestamp = now.toISOString();
    const notification = {
      type: "review",
      filePath: review.filePath,
      status: review.status,
      notes: review.notes ?? "",
      reviewedAt: review.reviewedAt?.toISOString() ?? "",
      timestamp,
    };
    const filename = `review-${now.getTime()}.json`;
    fs.writeFileSync(path.join(NOTIFICATIONS_DIR, filename), JSON.stringify(notification, null, 2));
    fs.writeFileSync(path.join(NOTIFICATIONS_DIR, "latest-review.json"), JSON.stringify(notification, null, 2));
  } catch (err) {
    console.error("Failed to write notification:", err);
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const filePath = req.nextUrl.searchParams.get("filePath");
  if (!filePath) {
    return NextResponse.json({ error: "filePath required" }, { status: 400 });
  }

  const review = await prisma.contentReview.findFirst({
    where: { filePath },
  });

  return NextResponse.json(review ?? { status: "pending", notes: "", reviewedAt: null });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { filePath, status, notes, category, blog } = body;

  if (!filePath || !status) {
    return NextResponse.json({ error: "filePath and status required" }, { status: 400 });
  }

  const existing = await prisma.contentReview.findFirst({
    where: { filePath },
  });

  const statusChanged = !existing || existing.status !== status;

  const review = await prisma.contentReview.upsert({
    where: { filePath },
    create: {
      filePath,
      status,
      notes: notes ?? "",
      category: category ?? "",
      blog: blog ?? false,
      reviewedAt: new Date(),
    },
    update: {
      status,
      notes: notes ?? "",
      category: category ?? "",
      ...(typeof blog === "boolean" ? { blog } : {}),
      ...(statusChanged ? { reviewedAt: new Date() } : {}),
    },
  });

  writeNotification(review);

  revalidatePath('/review');
  revalidatePath('/blog');

  return NextResponse.json(review);
}
