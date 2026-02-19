"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { Note } from "@/lib/types";
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function TrashPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchTrashed = async () => {
    setLoading(true);
    const res = await fetch("/api/notes?trashed=true");
    setNotes(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchTrashed();
  }, []);

  const restoreNote = async (id: string) => {
    await fetch("/api/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isTrashed: false, trashedAt: null }),
    });
    fetchTrashed();
  };

  const permanentDelete = async (id: string) => {
    if (!confirm("Permanently delete this note? This cannot be undone."))
      return;
    await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
    fetchTrashed();
  };

  const emptyTrash = async () => {
    if (
      !confirm(
        `Permanently delete ${notes.length} note(s)? This cannot be undone.`
      )
    )
      return;
    await Promise.all(
      notes.map((n) =>
        fetch(`/api/notes?id=${n.id}`, { method: "DELETE" })
      )
    );
    fetchTrashed();
  };

  return (
    <AuthGuard>
      <div className="h-full overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Trash2 className="w-6 h-6 text-gray-400" />
              <h1 className="text-2xl font-bold text-gray-900">Trash</h1>
            </div>
            {notes.length > 0 && (
              <button
                onClick={emptyTrash}
                className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 text-sm font-medium"
              >
                <AlertTriangle className="w-4 h-4" />
                Empty Trash
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Trash2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg mb-1">Trash is empty</p>
              <p className="text-sm">Deleted notes will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-sm group"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate">
                      {note.title}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">
                      {note.plainText?.slice(0, 80) || "No content"}
                    </p>
                    {note.trashedAt && (
                      <p className="text-xs text-gray-300 mt-1">
                        Deleted{" "}
                        {formatDistanceToNow(new Date(note.trashedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => restoreNote(note.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-green-600 border border-green-200 rounded-lg hover:bg-green-50"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restore
                    </button>
                    <button
                      onClick={() => permanentDelete(note.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
