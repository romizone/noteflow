"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import NoteCard from "@/components/NoteCard";
import { Note, Notebook } from "@/lib/types";
import { BookOpen, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotebookPage() {
  const params = useParams();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [notesRes, notebooksRes] = await Promise.all([
        fetch(`/api/notes?notebookId=${params.id}`),
        fetch("/api/notebooks"),
      ]);
      const [notesData, notebooksData] = await Promise.all([
        notesRes.json(),
        notebooksRes.json(),
      ]);
      setNotes(notesData);
      setNotebook(
        notebooksData.find((nb: Notebook) => nb.id === params.id) || null
      );
      setLoading(false);
    };
    fetchData();
  }, [params.id]);

  const createNote = async () => {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notebookId: params.id }),
    });
    const note = await res.json();
    router.push(`/notes/${note.id}`);
  };

  return (
    <AuthGuard>
      <div className="h-full overflow-y-auto bg-gray-50">
        <div className="max-w-6xl mx-auto p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              {notebook && (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: notebook.color + "20" }}
                >
                  <BookOpen
                    className="w-5 h-5"
                    style={{ color: notebook.color }}
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {notebook?.name || "Notebook"}
                </h1>
                <p className="text-sm text-gray-400">
                  {notes.length} note{notes.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={createNote}
              className="flex items-center gap-2 px-4 py-2 bg-[#00a82d] text-white rounded-lg hover:bg-[#009425] text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              New Note
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg mb-1">No notes in this notebook</p>
              <p className="text-sm">Create one to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDelete={(id) => setNotes((prev) => prev.filter((n) => n.id !== id))}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
