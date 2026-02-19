"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import NoteCard from "@/components/NoteCard";
import { Note, Tag } from "@/lib/types";
import { Tag as TagIcon } from "lucide-react";

export default function TagNotesPage() {
  const params = useParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [notesRes, tagsRes] = await Promise.all([
        fetch(`/api/notes?tagId=${params.id}`),
        fetch("/api/tags"),
      ]);
      const [notesData, tagsData] = await Promise.all([
        notesRes.json(),
        tagsRes.json(),
      ]);
      setNotes(notesData);
      setTags(tagsData);
      setLoading(false);
    };
    fetchData();
  }, [params.id]);

  const tagName =
    tags.find((t) => t.id === params.id)?.name || "Tag";

  return (
    <AuthGuard>
      <div className="h-full overflow-y-auto bg-gray-50">
        <div className="max-w-6xl mx-auto p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-8">
            <TagIcon className="w-6 h-6 text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-900">{tagName}</h1>
            <span className="text-sm text-gray-400">
              {notes.length} note{notes.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">No notes with this tag</p>
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
