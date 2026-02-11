"use client";

import { useState } from "react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import ReactMarkdown from "react-markdown";
import { ChevronDown, ChevronRight, GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";

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
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface TodoItemProps {
  todo: Todo;
  isRecurring: boolean;
  onToggleComplete: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  onEdit: (todo: Todo) => void;
  expandedTodos: Set<number>;
  onToggleExpand: (id: number) => void;
}

function SortableTodoItem({ todo, isRecurring, onToggleComplete, onDelete, onEdit, expandedTodos, onToggleExpand }: TodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isExpanded = expandedTodos.has(todo.id);
  const hasBody = !!todo.body;

  function formatFullDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className={`${todo.completed && !isRecurring ? "opacity-60" : ""} ${isDragging ? "shadow-lg" : ""}`}
    >
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground mt-1 flex-shrink-0"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Checkbox */}
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggleComplete(todo.id, !todo.completed)}
            className="mt-1 h-4 w-4 rounded border-gray-300 cursor-pointer flex-shrink-0"
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div 
              className={`flex items-start gap-2 ${hasBody ? "cursor-pointer" : ""}`}
              onClick={() => hasBody && onToggleExpand(todo.id)}
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

          {/* Actions */}
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(todo)}
              className="text-muted-foreground hover:text-primary p-1 rounded opacity-50 hover:opacity-100 transition-opacity"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              className="text-muted-foreground hover:text-destructive p-1 rounded opacity-50 hover:opacity-100 transition-opacity"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TodoListV2({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [showForm, setShowForm] = useState(false);
  const [expandedTodos, setExpandedTodos] = useState<Set<number>>(new Set());
  const [showCompleted, setShowCompleted] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    body: "",
    todoType: "persistent" as "persistent" | "recurring" | "scheduled",
    recurrence: "daily" as "daily" | "weekday" | "weekly",
    dueDate: "",
  });
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group todos
  const recurringTodos = todos.filter((t) => t.todoType === "recurring" && !t.completed)
    .sort((a, b) => b.priority - a.priority);
  const scheduledTodos = todos.filter((t) => t.todoType === "scheduled" && !t.completed)
    .sort((a, b) => b.priority - a.priority);
  const persistentTodos = todos.filter((t) => t.todoType === "persistent" && !t.completed)
    .sort((a, b) => b.priority - a.priority);
  const completedTodos = todos.filter((t) => t.completed && t.todoType !== "recurring")
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

  async function handleDragEnd(event: DragEndEvent, todoType: string) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const todoList = 
      todoType === "recurring" ? recurringTodos :
      todoType === "scheduled" ? scheduledTodos :
      persistentTodos;

    const oldIndex = todoList.findIndex((t) => t.id === active.id);
    const newIndex = todoList.findIndex((t) => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedTodos = arrayMove(todoList, oldIndex, newIndex);
    
    // Update priorities based on new order
    const updates = reorderedTodos.map((todo, index) => ({
      id: todo.id,
      priority: reorderedTodos.length - index, // Higher index = higher priority
    }));

    // Optimistically update UI
    setTodos(todos.map(t => {
      const update = updates.find(u => u.id === t.id);
      return update ? { ...t, priority: update.priority } : t;
    }));

    // Send batch update to server
    try {
      await fetch("/api/todos/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
    } catch (error) {
      console.error("Failed to update priorities:", error);
      // Revert on error
      setTodos(todos);
    }
  }

  async function addOrUpdateTodo() {
    if (!formData.title.trim()) return;
    setLoading(true);

    try {
      if (editingTodo) {
        // Update existing todo
        const res = await fetch("/api/todos", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingTodo.id,
            title: formData.title,
            description: formData.description || null,
            body: formData.body || null,
            todoType: formData.todoType,
            recurrence: formData.todoType === "recurring" ? formData.recurrence : null,
            dueDate: formData.todoType === "scheduled" && formData.dueDate ? formData.dueDate : null,
          }),
        });
        const updated = await res.json();
        setTodos(todos.map((t) => (t.id === updated.id ? updated : t)));
        setEditingTodo(null);
      } else {
        // Create new todo
        const res = await fetch("/api/todos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description || null,
            body: formData.body || null,
            todoType: formData.todoType,
            recurrence: formData.todoType === "recurring" ? formData.recurrence : null,
            dueDate: formData.todoType === "scheduled" && formData.dueDate ? formData.dueDate : null,
          }),
        });
        const newTodo = await res.json();
        setTodos([newTodo, ...todos]);
      }
      
      resetForm();
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      title: "",
      description: "",
      body: "",
      todoType: "persistent",
      recurrence: "daily",
      dueDate: "",
    });
    setShowForm(false);
    setEditingTodo(null);
  }

  function handleEdit(todo: Todo) {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || "",
      body: todo.body || "",
      todoType: todo.todoType as any,
      recurrence: (todo.recurrence as any) || "daily",
      dueDate: todo.dueDate ? (new Date(todo.dueDate).toISOString().split("T")[0] || "") : "",
    });
    setShowForm(true);
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

  async function confirmDelete() {
    if (!deletingTodoId) return;
    
    await fetch("/api/todos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deletingTodoId }),
    });
    setTodos(todos.filter((t) => t.id !== deletingTodoId));
    setDeletingTodoId(null);
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

  return (
    <div className="space-y-8">
      {/* Add/Edit Todo Form */}
      <div>
        {showForm ? (
          <Card className="border-primary/20">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">
                  {editingTodo ? "Edit Todo" : "Add New Todo"}
                </h3>
                <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="What needs to be done?"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  autoFocus
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief summary (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              {/* Type selector */}
              <div>
                <Label>Type</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant={formData.todoType === "persistent" ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, todoType: "persistent" })}
                    type="button"
                  >
                    Ongoing
                  </Button>
                  <Button
                    size="sm"
                    variant={formData.todoType === "recurring" ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, todoType: "recurring" })}
                    type="button"
                  >
                    Recurring
                  </Button>
                  <Button
                    size="sm"
                    variant={formData.todoType === "scheduled" ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, todoType: "scheduled" })}
                    type="button"
                  >
                    Scheduled
                  </Button>
                </div>
              </div>

              {/* Recurrence selector (if recurring) */}
              {formData.todoType === "recurring" && (
                <div>
                  <Label htmlFor="recurrence">Recurrence</Label>
                  <select
                    id="recurrence"
                    value={formData.recurrence}
                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value as any })}
                    className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary mt-2"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekday">Weekdays (Mon-Fri)</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              )}

              {/* Date picker (if scheduled) */}
              {formData.todoType === "scheduled" && (
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="mt-2"
                  />
                </div>
              )}

              {/* Body textarea */}
              <div>
                <Label htmlFor="body">Details (markdown supported)</Label>
                <Textarea
                  id="body"
                  placeholder="Optional markdown content..."
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={4}
                  className="mt-2 resize-y"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={addOrUpdateTodo} disabled={loading || !formData.title.trim()}>
                  {editingTodo ? "Update Todo" : "Add Todo"}
                </Button>
                <Button size="sm" variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button onClick={() => setShowForm(true)} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Todo
          </Button>
        )}
      </div>

      {/* Today's Habits (Recurring) */}
      {recurringTodos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Today&apos;s Habits</h2>
            <Badge variant="secondary">{recurringTodos.length}</Badge>
          </div>
          <p className="text-sm text-muted-foreground -mt-2">Reset automatically based on recurrence</p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(e) => handleDragEnd(e, "recurring")}
          >
            <SortableContext items={recurringTodos.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {recurringTodos.map((todo) => (
                  <SortableTodoItem
                    key={todo.id}
                    todo={todo}
                    isRecurring={true}
                    onToggleComplete={toggleComplete}
                    onDelete={setDeletingTodoId}
                    onEdit={handleEdit}
                    expandedTodos={expandedTodos}
                    onToggleExpand={toggleExpand}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Scheduled */}
      {scheduledTodos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Scheduled</h2>
            <Badge variant="secondary">{scheduledTodos.length}</Badge>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(e) => handleDragEnd(e, "scheduled")}
          >
            <SortableContext items={scheduledTodos.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {scheduledTodos.map((todo) => (
                  <SortableTodoItem
                    key={todo.id}
                    todo={todo}
                    isRecurring={false}
                    onToggleComplete={toggleComplete}
                    onDelete={setDeletingTodoId}
                    onEdit={handleEdit}
                    expandedTodos={expandedTodos}
                    onToggleExpand={toggleExpand}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Ongoing (Persistent) */}
      {persistentTodos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Ongoing</h2>
            <Badge variant="secondary">{persistentTodos.length}</Badge>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(e) => handleDragEnd(e, "persistent")}
          >
            <SortableContext items={persistentTodos.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {persistentTodos.map((todo) => (
                  <SortableTodoItem
                    key={todo.id}
                    todo={todo}
                    isRecurring={false}
                    onToggleComplete={toggleComplete}
                    onDelete={setDeletingTodoId}
                    onEdit={handleEdit}
                    expandedTodos={expandedTodos}
                    onToggleExpand={toggleExpand}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Empty state */}
      {recurringTodos.length === 0 && scheduledTodos.length === 0 && persistentTodos.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground text-lg">No active todos 🎉</p>
          <p className="text-muted-foreground text-sm mt-2">Click the button above to add your first task</p>
        </div>
      )}

      {/* Completed */}
      {completedTodos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 text-xl font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              {showCompleted ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              Completed
            </button>
            <Badge variant="secondary">{completedTodos.length}</Badge>
          </div>
          {showCompleted && (
            <div className="space-y-2">
              {completedTodos.map((todo) => (
                <Card key={todo.id} className="opacity-60">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => toggleComplete(todo.id, false)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 cursor-pointer flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-through">{todo.title}</p>
                        {todo.description && (
                          <p className="text-sm text-muted-foreground mt-0.5 line-through">
                            {todo.description}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">{todo.assignedTo}</Badge>
                          {todo.completedAt && (
                            <span className="text-xs text-muted-foreground">
                              Done {new Date(todo.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setDeletingTodoId(todo.id)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded opacity-50 hover:opacity-100 transition-opacity"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletingTodoId !== null} onOpenChange={(open) => !open && setDeletingTodoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Todo?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this todo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
