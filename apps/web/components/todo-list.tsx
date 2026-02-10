"use client";

import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import ReactMarkdown from "react-markdown";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Todo {
  id: number;
  title: string;
  description: string | null;
  body: string | null;
  assignedTo: string;
  completed: boolean;
  completedAt: string | null;
  todoType: string;
  dueDate: string | null;
  recurrence: string | null;
  lastCompletedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [showForm, setShowForm] = useState(false);
  const [expandedTodos, setExpandedTodos] = useState<Set<number>>(new Set());
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newType, setNewType] = useState<"persistent" | "recurring" | "scheduled">("persistent");
  const [newRecurrence, setNewRecurrence] = useState<"daily" | "weekday" | "weekly">("daily");
  const [newDueDate, setNewDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  // Group todos
  const recurringTodos = todos.filter((t) => t.todoType === "recurring" && !t.completed);
  const scheduledTodos = todos.filter((t) => t.todoType === "scheduled" && !t.completed);
  const persistentTodos = todos.filter((t) => t.todoType === "persistent" && !t.completed);
  const completedTodos = todos.filter((t) => t.completed && t.todoType !== "recurring");

  async function addTodo() {
    if (!newTitle.trim()) return;
    setLoading(true);
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        description: newDescription || null,
        body: newBody || null,
        todoType: newType,
        recurrence: newType === "recurring" ? newRecurrence : null,
        dueDate: newType === "scheduled" && newDueDate ? newDueDate : null,
      }),
    });
    const todo = await res.json();
    setTodos([todo, ...todos]);
    
    // Reset form
    setNewTitle("");
    setNewDescription("");
    setNewBody("");
    setNewType("persistent");
    setNewRecurrence("daily");
    setNewDueDate("");
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

  function toggleExpand(id: number) {
    const newExpanded = new Set(expandedTodos);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTodos(newExpanded);
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function formatFullDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function isOverdue(dueDate: string | null) {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dueDate) < today;
  }

  function isDueToday(dueDate: string | null) {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return today.getTime() === due.getTime();
  }

  function renderTodo(todo: Todo, isRecurring = false) {
    const isExpanded = expandedTodos.has(todo.id);
    const hasBody = !!todo.body;

    return (
      <Card key={todo.id} className={todo.completed && !isRecurring ? "opacity-60" : ""}>
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleComplete(todo.id, !todo.completed)}
              className="mt-1 h-4 w-4 rounded border-gray-300 cursor-pointer flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div 
                className={`flex items-start gap-2 ${hasBody ? "cursor-pointer" : ""}`}
                onClick={() => hasBody && toggleExpand(todo.id)}
              >
                <p className={`font-medium flex-1 ${todo.completed ? "line-through" : ""}`}>
                  {todo.title}
                </p>
                {hasBody && (
                  <button className="text-muted-foreground opacity-50 hover:opacity-100 mt-0.5">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                )}
              </div>
              
              {todo.description && (
                <p className={`text-sm text-muted-foreground mt-0.5 ${todo.completed ? "line-through" : ""}`}>
                  {todo.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">{todo.assignedTo}</Badge>
                
                {isRecurring && todo.recurrence && (
                  <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/20">
                    {todo.recurrence === "weekday" ? "weekdays" : todo.recurrence}
                  </Badge>
                )}
                
                {todo.todoType === "scheduled" && todo.dueDate && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      isOverdue(todo.dueDate) 
                        ? "bg-red-500/10 text-red-400 border-red-500/20" 
                        : isDueToday(todo.dueDate)
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    }`}
                  >
                    {isOverdue(todo.dueDate) ? "Overdue: " : isDueToday(todo.dueDate) ? "Today: " : ""}
                    {formatFullDate(todo.dueDate)}
                  </Badge>
                )}
                
                {!isRecurring && todo.completedAt && (
                  <span className="text-xs text-muted-foreground">Done {formatDate(todo.completedAt)}</span>
                )}
              </div>

              {isExpanded && hasBody && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{todo.body}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-muted-foreground hover:text-destructive text-sm opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
              title="Delete"
            >
              ✕
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Add Todo Form */}
      <div>
        {showForm ? (
          <Card className="border-primary/20">
            <CardContent className="pt-6 space-y-4">
              <input
                type="text"
                placeholder="Title *"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-transparent border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full bg-transparent border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              
              {/* Type selector */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Type</label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={newType === "persistent" ? "default" : "outline"}
                    onClick={() => setNewType("persistent")}
                    type="button"
                  >
                    Ongoing
                  </Button>
                  <Button
                    size="sm"
                    variant={newType === "recurring" ? "default" : "outline"}
                    onClick={() => setNewType("recurring")}
                    type="button"
                  >
                    Recurring
                  </Button>
                  <Button
                    size="sm"
                    variant={newType === "scheduled" ? "default" : "outline"}
                    onClick={() => setNewType("scheduled")}
                    type="button"
                  >
                    Scheduled
                  </Button>
                </div>
              </div>

              {/* Recurrence selector (if recurring) */}
              {newType === "recurring" && (
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Recurrence</label>
                  <select
                    value={newRecurrence}
                    onChange={(e) => setNewRecurrence(e.target.value as any)}
                    className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekday">Weekdays (Mon-Fri)</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              )}

              {/* Date picker (if scheduled) */}
              {newType === "scheduled" && (
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {/* Body textarea */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Details (markdown supported)</label>
                <textarea
                  placeholder="Optional markdown content..."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  rows={4}
                  className="w-full bg-transparent border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                />
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={addTodo} disabled={loading || !newTitle.trim()}>
                  Add Todo
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

      {/* Today's Habits (Recurring) */}
      {recurringTodos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Today&apos;s Habits</h2>
            <Badge variant="secondary" className="text-xs">{recurringTodos.length}</Badge>
          </div>
          <p className="text-sm text-muted-foreground -mt-2">Reset automatically based on recurrence</p>
          {recurringTodos.map((todo) => renderTodo(todo, true))}
        </div>
      )}

      {/* Scheduled */}
      {scheduledTodos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Scheduled</h2>
            <Badge variant="secondary" className="text-xs">{scheduledTodos.length}</Badge>
          </div>
          {scheduledTodos
            .sort((a, b) => {
              if (!a.dueDate || !b.dueDate) return 0;
              return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            })
            .map((todo) => renderTodo(todo))}
        </div>
      )}

      {/* Ongoing (Persistent) */}
      {persistentTodos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Ongoing</h2>
            <Badge variant="secondary" className="text-xs">{persistentTodos.length}</Badge>
          </div>
          {persistentTodos.map((todo) => renderTodo(todo))}
        </div>
      )}

      {/* Empty state */}
      {recurringTodos.length === 0 && scheduledTodos.length === 0 && persistentTodos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No active todos 🎉</p>
        </div>
      )}

      {/* Completed */}
      {completedTodos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              {showCompleted ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              Completed
            </button>
            <Badge variant="secondary" className="text-xs">{completedTodos.length}</Badge>
          </div>
          {showCompleted && completedTodos.map((todo) => renderTodo(todo))}
        </div>
      )}
    </div>
  );
}
