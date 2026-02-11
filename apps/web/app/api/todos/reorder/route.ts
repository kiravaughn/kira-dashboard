import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { updates } = await req.json();
  
  if (!Array.isArray(updates)) {
    return NextResponse.json({ error: "Invalid updates format" }, { status: 400 });
  }

  // Batch update priorities
  await Promise.all(
    updates.map(({ id, priority }: { id: number; priority: number }) =>
      prisma.todo.update({
        where: { id },
        data: { priority },
      })
    )
  );

  revalidatePath("/todos");
  return NextResponse.json({ success: true });
}
