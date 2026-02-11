import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TodoListV2 } from "@/components/todo-list-v2";

export const dynamic = "force-dynamic";

export default async function TodosPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const todos = await prisma.todo.findMany({
    orderBy: [{ completed: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Todos</h1>
        <p className="text-muted-foreground mt-2">Manage your tasks with drag-and-drop prioritization</p>
      </div>
      <TodoListV2 initialTodos={JSON.parse(JSON.stringify(todos))} />
    </div>
  );
}
