import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TodoList } from "@/components/todo-list";

export const dynamic = "force-dynamic";

export default async function TodosPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const todos = await prisma.todo.findMany({
    orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Todos</h1>
        <p className="text-muted-foreground">Track tasks and action items</p>
      </div>
      <TodoList initialTodos={JSON.parse(JSON.stringify(todos))} />
    </div>
  );
}
