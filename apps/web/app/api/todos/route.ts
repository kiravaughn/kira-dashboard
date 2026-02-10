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

  // For recurring todos, check if they need to be reset
  const today = new Date().toISOString().split('T')[0]!; // YYYY-MM-DD
  const processedTodos = todos.map(todo => {
    if (todo.todoType !== 'recurring' || !todo.lastCompletedDate) {
      return todo;
    }
    
    const lastCompletedDateStr = new Date(todo.lastCompletedDate).toISOString().split('T')[0]!;
    
    // Check if we need to reset based on recurrence type
    let shouldReset = false;
    
    if (todo.recurrence === 'daily') {
      shouldReset = lastCompletedDateStr < today;
    } else if (todo.recurrence === 'weekday') {
      // Reset if last completed before today and today is a weekday (Mon-Fri)
      const todayDay = new Date().getDay();
      const isWeekday = todayDay >= 1 && todayDay <= 5;
      shouldReset = lastCompletedDateStr < today && isWeekday;
    } else if (todo.recurrence === 'weekly') {
      // Reset if it's been a week since last completion
      const lastCompleted = new Date(todo.lastCompletedDate);
      const daysSince = Math.floor((new Date().getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
      shouldReset = daysSince >= 7;
    }
    
    if (shouldReset) {
      return { ...todo, completed: false, completedAt: null };
    }
    
    return todo;
  });

  return NextResponse.json(processedTodos);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, body, assignedTo, todoType, dueDate, recurrence } = await req.json();
  const todo = await prisma.todo.create({
    data: { 
      title, 
      description, 
      body,
      assignedTo: assignedTo || "graham",
      todoType: todoType || "persistent",
      dueDate: dueDate ? new Date(dueDate) : null,
      recurrence: recurrence || null,
    },
  });
  revalidatePath("/dashboard");
  revalidatePath("/todos");
  return NextResponse.json(todo);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, completed, title, description, body, todoType, dueDate, recurrence } = await req.json();
  const data: Record<string, unknown> = {};
  
  if (typeof completed === "boolean") {
    data.completed = completed;
    data.completedAt = completed ? new Date() : null;
    
    // For recurring todos, track the completion date
    const todo = await prisma.todo.findUnique({ where: { id } });
    if (todo?.todoType === 'recurring' && completed) {
      data.lastCompletedDate = new Date();
    }
  }
  
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (body !== undefined) data.body = body;
  if (todoType !== undefined) data.todoType = todoType;
  if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
  if (recurrence !== undefined) data.recurrence = recurrence;

  const updatedTodo = await prisma.todo.update({ where: { id }, data });
  revalidatePath("/dashboard");
  revalidatePath("/todos");
  return NextResponse.json(updatedTodo);
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
