"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import NoteCard from "@/components/NoteCard";
import ScratchPad from "@/components/ScratchPad";
import { Note, Notebook } from "@/lib/types";
import { Pin, Pencil, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

function HomeContent() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [notesRes, notebooksRes] = await Promise.all([
          searchQuery
            ? fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
            : fetch("/api/notes"),
          fetch("/api/notebooks"),
        ]);

        if (!notesRes.ok) throw new Error("Failed to load notes");
        if (!notebooksRes.ok) throw new Error("Failed to load notebooks");

        const [notesData, notebooksData] = await Promise.all([
          notesRes.json(),
          notebooksRes.json(),
        ]);

        setNotes(Array.isArray(notesData) ? notesData : []);
        setNotebooks(Array.isArray(notebooksData) ? notebooksData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
      setLoading(false);
    };
    fetchData();
  }, [searchQuery]);

  const getNotebookName = (notebookId: string | null) => {
    if (!notebookId) return undefined;
    return notebooks.find((nb) => nb.id === notebookId)?.name;
  };

  // For Home (no search): only show pinned notes
  // For Search: show all results
  const pinnedNotes = searchQuery
    ? notes
    : notes.filter((n) => n.isPinned);

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {searchQuery ? `Search: "${searchQuery}"` : "Home"}
          </h1>
          <button
            onClick={() => router.push("/notes/new")}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="New note"
          >
            <Pencil className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 text-red-700 rounded-xl border border-red-200 animate-slide-up">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Search results OR Pinned notes */}
            {searchQuery ? (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Results
                </h2>
                {pinnedNotes.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-lg mb-2">No results found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        notebookName={getNotebookName(note.notebookId)}
                        onDelete={(id) => setNotes((prev) => prev.filter((n) => n.id !== id))}
                        onUpdate={(updated) => setNotes((prev) => prev.map((n) => n.id === updated.id ? updated : n))}
                      />
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <>
                {/* Pinned notes section — only show if there are pinned notes */}
                {pinnedNotes.length > 0 && (
                  <section className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Pin className="w-4 h-4 text-green-600" />
                      <h2 className="text-lg font-semibold text-gray-800">
                        Pinned
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {pinnedNotes.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          notebookName={getNotebookName(note.notebookId)}
                          onDelete={(id) => setNotes((prev) => prev.filter((n) => n.id !== id))}
                          onUpdate={(updated) => setNotes((prev) => prev.map((n) => n.id === updated.id ? updated : n))}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {/* Scratch Pad — always visible on Home */}
            {!searchQuery && (
              <section className="mt-2">
                <ScratchPad />
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <div className="h-full flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <HomeContent />
      </Suspense>
    </AuthGuard>
  );
}
