import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const todos = await prisma.todo.findMany({
    orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(todos);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, assignedTo } = await req.json();
  const todo = await prisma.todo.create({
    data: { title, description, assignedTo: assignedTo || "graham" },
  });
  revalidatePath("/dashboard");
  revalidatePath("/todos");
  return NextResponse.json(todo);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, completed, title, description } = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof completed === "boolean") {
    data.completed = completed;
    data.completedAt = completed ? new Date() : null;
  }
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;

  const todo = await prisma.todo.update({ where: { id }, data });
  revalidatePath("/dashboard");
  revalidatePath("/todos");
  return NextResponse.json(todo);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.todo.delete({ where: { id } });
  revalidatePath("/dashboard");
  revalidatePath("/todos");
  return NextResponse.json({ success: true });
}
