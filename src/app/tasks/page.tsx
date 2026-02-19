"use client";

import { useState, useEffect } from "react";
import AuthGuard from "@/components/AuthGuard";
import { Task } from "@/lib/types";
import {
  Plus,
  CheckSquare,
  Square,
  Trash2,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  const fetchTasks = async () => {
    setLoading(true);
    const res = await fetch("/api/tasks");
    setTasks(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const createTask = async () => {
    if (!newTaskTitle.trim()) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTaskTitle.trim(),
        dueDate: newTaskDueDate || null,
      }),
    });
    setNewTaskTitle("");
    setNewTaskDueDate("");
    fetchTasks();
  };

  const toggleTask = async (task: Task) => {
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, isCompleted: !task.isCompleted }),
    });
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    fetchTasks();
  };

  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  return (
    <AuthGuard>
      <div className="h-full overflow-y-auto bg-gray-50">
        <div className="max-w-3xl mx-auto p-6 lg:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Tasks</h1>

          {/* Create Task */}
          <div className="flex items-center gap-2 mb-6">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createTask()}
              placeholder="Add a task..."
              className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={createTask}
              disabled={!newTaskTitle.trim()}
              className="px-4 py-2.5 bg-[#00a82d] text-white rounded-lg hover:bg-[#009425] text-sm font-medium disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg mb-1">No tasks yet</p>
              <p className="text-sm">Add a task to get started.</p>
            </div>
          ) : (
            <>
              {/* Pending Tasks */}
              {pendingTasks.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    To Do ({pendingTasks.length})
                  </h2>
                  <div className="space-y-1">
                    {pendingTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 group hover:shadow-sm"
                      >
                        <button
                          onClick={() => toggleTask(task)}
                          className="text-gray-300 hover:text-green-500"
                        >
                          <Square className="w-5 h-5" />
                        </button>
                        <span className="flex-1 text-sm text-gray-900">
                          {task.title}
                        </span>
                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(task.dueDate), "MMM d")}
                          </span>
                        )}
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Completed ({completedTasks.length})
                  </h2>
                  <div className="space-y-1">
                    {completedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 group hover:shadow-sm opacity-60"
                      >
                        <button
                          onClick={() => toggleTask(task)}
                          className="text-green-500"
                        >
                          <CheckSquare className="w-5 h-5" />
                        </button>
                        <span className="flex-1 text-sm text-gray-500 line-through">
                          {task.title}
                        </span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
