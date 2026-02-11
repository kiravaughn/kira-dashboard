import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

const NOTIFICATIONS_DIR = "/home/kira/.openclaw/workspace/notifications";

function extractTitle(filePath: string): string {
  try {
    // Get just the filename, remove .md extension
    const filename = path.basename(filePath, '.md');
    // Replace hyphens and underscores with spaces
    const withSpaces = filename.replace(/[-_]/g, ' ');
    // Title case each word
    return withSpaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  } catch {
    return filePath;
  }
}

async function notifyOpenClaw(review: { filePath: string; status: string; notes: string | null }) {
  try {
    const token = process.env.OPENCLAW_GATEWAY_TOKEN;
    if (!token) {
      console.warn("OPENCLAW_GATEWAY_TOKEN not set, skipping webhook");
      return;
    }

    const title = extractTitle(review.filePath);
    const notes = review.notes?.trim() || 'none';
    const message = `Dashboard review update: Graham marked "${title}" as ${review.status}. Notes: ${notes}`;

    await fetch('http://localhost:18789/api/sessions/agent:main:main/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });
  } catch (err) {
    console.error("Failed to send OpenClaw webhook:", err);
  }
}

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

  const audit = req.nextUrl.searchParams.get("audit");
  const contentId = req.nextUrl.searchParams.get("contentId");
  
  // Audit logs endpoint
  if (audit === "true" && contentId) {
    const logs = await prisma.contentAuditLog.findMany({
      where: { contentId: parseInt(contentId) },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(logs);
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
  const { filePath, status, notes, category, subcategory } = body;

  if (!filePath || !status) {
    return NextResponse.json({ error: "filePath and status required" }, { status: 400 });
  }

  const existing = await prisma.contentReview.findFirst({
    where: { filePath },
  });

  const statusChanged = !existing || existing.status !== status;
  const notesChanged = existing && existing.notes !== (notes ?? "");

  const review = await prisma.contentReview.upsert({
    where: { filePath },
    create: {
      filePath,
      status,
      notes: notes ?? "",
      category: category ?? "general",
      subcategory: subcategory ?? "general",
      reviewedAt: new Date(),
    },
    update: {
      status,
      notes: notes ?? "",
      category: category ?? "general",
      subcategory: subcategory ?? "general",
      ...(statusChanged ? { reviewedAt: new Date() } : {}),
    },
  });

  // Create audit log entries
  const actor = "graham"; // Dashboard actions are by graham
  
  if (statusChanged) {
    await prisma.contentAuditLog.create({
      data: {
        contentId: review.id,
        action: "status_change",
        actor,
        fromStatus: existing?.status || null,
        toStatus: status,
        notes: null,
      },
    });
  }
  
  if (notesChanged && notes && notes.trim()) {
    await prisma.contentAuditLog.create({
      data: {
        contentId: review.id,
        action: "notes_updated",
        actor,
        fromStatus: null,
        toStatus: null,
        notes: notes,
      },
    });
  }

  writeNotification(review);
  
  // Send webhook to OpenClaw (async, don't await to avoid blocking response)
  notifyOpenClaw(review).catch(err => console.error("OpenClaw webhook error:", err));

  revalidatePath('/review');
  revalidatePath('/blog');

  return NextResponse.json(review);
}
