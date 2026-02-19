"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import CreateNotebookModal from "@/components/CreateNotebookModal";
import { Notebook } from "@/lib/types";
import { Plus, BookOpen, Trash2, Pencil } from "lucide-react";

export default function NotebooksPage() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const router = useRouter();

  const fetchNotebooks = async () => {
    setLoading(true);
    const res = await fetch("/api/notebooks");
    setNotebooks(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const startEdit = (nb: Notebook) => {
    setEditingId(nb.id);
    setEditName(nb.name);
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    await fetch("/api/notebooks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, name: editName.trim() }),
    });
    setEditingId(null);
    fetchNotebooks();
  };

  const deleteNotebook = async (id: string) => {
    if (!confirm("Delete this notebook? Notes inside will be kept.")) return;
    await fetch(`/api/notebooks?id=${id}`, { method: "DELETE" });
    fetchNotebooks();
  };

  return (
    <AuthGuard>
      <div className="h-full overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Notebooks</h1>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#00a82d] text-white rounded-lg hover:bg-[#009425] text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              New Notebook
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notebooks.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg mb-1">No notebooks yet</p>
              <p className="text-sm">Create a notebook to organize your notes.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notebooks.map((nb) => (
                <div
                  key={nb.id}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-shadow group"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: nb.color + "20" }}
                  >
                    <BookOpen
                      className="w-5 h-5"
                      style={{ color: nb.color }}
                    />
                  </div>

                  {editingId === nb.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                      className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => router.push(`/notebooks/${nb.id}`)}
                      className="flex-1 text-left"
                    >
                      <h3 className="font-medium text-gray-900">{nb.name}</h3>
                      <p className="text-xs text-gray-400">
                        {nb.noteCount} note{nb.noteCount !== 1 ? "s" : ""}
                      </p>
                    </button>
                  )}

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(nb)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteNotebook(nb.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showCreate && (
          <CreateNotebookModal
            onClose={() => setShowCreate(false)}
            onCreated={fetchNotebooks}
          />
        )}
      </div>
    </AuthGuard>
  );
}
