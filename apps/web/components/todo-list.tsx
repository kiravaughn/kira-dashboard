"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface Todo {
  id: number;
  title: string;
  description: string | null;
  assignedTo: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  async function addTodo() {
    if (!newTitle.trim()) return;
    setLoading(true);
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, description: newDescription || null }),
    });
    const todo = await res.json();
    setTodos([todo, ...todos]);
    setNewTitle("");
    setNewDescription("");
    setShowForm(false);
    setLoading(false);
  }

  async function toggleComplete(id: number, completed: boolean) {
    const res = await fetch("/api/todos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed }),
    });
    const updated = await res.json();
    setTodos(todos.map((t) => (t.id === id ? updated : t)));
  }

  async function deleteTodo(id: number) {
    await fetch("/api/todos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setTodos(todos.filter((t) => t.id !== id));
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <div className="space-y-6">
      {/* Add Todo */}
      <div>
        {showForm ? (
          <Card>
            <CardContent className="pt-6 space-y-3">
              <input
                type="text"
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-transparent border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && addTodo()}
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full bg-transparent border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={(e) => e.key === "Enter" && addTodo()}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={addTodo} disabled={loading || !newTitle.trim()}>
                  Add
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button onClick={() => setShowForm(true)}>+ Add Todo</Button>
        )}
      </div>

      {/* Active */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Active ({activeTodos.length})</h2>
        {activeTodos.length === 0 && (
          <p className="text-muted-foreground text-sm">No active todos 🎉</p>
        )}
        {activeTodos.map((todo) => (
          <Card key={todo.id}>
            <CardContent className="py-4 flex items-start gap-3">
              <input
                type="checkbox"
                checked={false}
                onChange={() => toggleComplete(todo.id, true)}
                className="mt-1 h-4 w-4 rounded border-gray-300 cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{todo.title}</p>
                {todo.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">{todo.description}</p>
                )}
                <div className="flex gap-2 mt-1.5">
                  <Badge variant="secondary" className="text-xs">{todo.assignedTo}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(todo.createdAt)}</span>
                </div>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-muted-foreground hover:text-destructive text-sm opacity-50 hover:opacity-100 transition-opacity"
                title="Delete"
              >
                ✕
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completed */}
      {completedTodos.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-muted-foreground">Completed ({completedTodos.length})</h2>
          {completedTodos.map((todo) => (
            <Card key={todo.id} className="opacity-60">
              <CardContent className="py-4 flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => toggleComplete(todo.id, false)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-through">{todo.title}</p>
                  {todo.description && (
                    <p className="text-sm text-muted-foreground mt-0.5 line-through">{todo.description}</p>
                  )}
                  <div className="flex gap-2 mt-1.5">
                    <Badge variant="secondary" className="text-xs">{todo.assignedTo}</Badge>
                    {todo.completedAt && (
                      <span className="text-xs text-muted-foreground">Done {formatDate(todo.completedAt)}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-muted-foreground hover:text-destructive text-sm opacity-50 hover:opacity-100 transition-opacity"
                  title="Delete"
                >
                  ✕
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
