import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const activeTodoCount = await prisma.todo.count({ where: { completed: false } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user?.name || session.user?.email}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/todos">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>Todos</CardTitle>
              <CardDescription>
                {activeTodoCount} active {activeTodoCount === 1 ? "task" : "tasks"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">✅</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/review">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>Content Review</CardTitle>
              <CardDescription>
                Review and approve draft content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">📝</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/blog">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>Blog</CardTitle>
              <CardDescription>
                View published blog posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">📚</p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your profile settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{session.user?.email}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
