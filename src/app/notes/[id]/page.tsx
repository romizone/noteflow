"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import NoteEditor from "@/components/NoteEditor";
import TagManager from "@/components/TagManager";
import { Note, Notebook, Tag } from "@/lib/types";
import {
  ArrowLeft,
  Star,
  Pin,
  Trash2,
  MoreHorizontal,
  BookOpen,
  RotateCcw,
} from "lucide-react";

export default function NoteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "new";

  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    fetch("/api/notebooks").then((r) => r.json()).then(setNotebooks);
    fetch("/api/tags").then((r) => r.json()).then(setAllTags);

    if (!isNew) {
      fetch(`/api/notes`)
        .then((r) => r.json())
        .then((notes: Note[]) => {
          const found = notes.find((n) => n.id === params.id);
          if (found) {
            setNote(found);
            setTitle(found.title);
            setContent(found.content);
            setSelectedNotebookId(found.notebookId || "");
          }
          setLoading(false);
        });
    }
  }, [params.id, isNew]);

  const saveNote = useCallback(
    async (html: string, text: string) => {
      setSaving(true);
      try {
        if (isNew || !note) {
          const res = await fetch("/api/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: title || "Untitled",
              content: html,
              plainText: text,
              notebookId: selectedNotebookId || null,
              tagIds: selectedTagIds,
            }),
          });
          const newNote = await res.json();
          setNote(newNote);
          window.history.replaceState(null, "", `/notes/${newNote.id}`);
        } else {
          await fetch("/api/notes", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: note.id,
              title: title || "Untitled",
              content: html,
              plainText: text,
              notebookId: selectedNotebookId || null,
              tagIds: selectedTagIds,
            }),
          });
        }
      } catch (err) {
        console.error("Failed to save:", err);
      }
      setSaving(false);
    },
    [isNew, note, title, selectedNotebookId, selectedTagIds]
  );

  const handleTitleBlur = () => {
    if (note && title !== note.title) {
      fetch("/api/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: note.id, title: title || "Untitled" }),
      });
    }
  };

  const toggleFavorite = async () => {
    if (!note) return;
    const res = await fetch("/api/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: note.id, isFavorite: !note.isFavorite }),
    });
    const updated = await res.json();
    setNote(updated);
  };

  const togglePin = async () => {
    if (!note) return;
    const res = await fetch("/api/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: note.id, isPinned: !note.isPinned }),
    });
    const updated = await res.json();
    setNote(updated);
  };

  const moveToTrash = async () => {
    if (!note) return;
    await fetch("/api/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: note.id,
        isTrashed: true,
        trashedAt: new Date().toISOString(),
      }),
    });
    router.push("/");
  };

  const restoreNote = async () => {
    if (!note) return;
    await fetch("/api/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: note.id, isTrashed: false, trashedAt: null }),
    });
    router.push("/");
  };

  const handleNotebookChange = async (notebookId: string) => {
    setSelectedNotebookId(notebookId);
    if (note) {
      await fetch("/api/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: note.id, notebookId: notebookId || null }),
      });
    }
  };

  const handleCreateTag = async (name: string): Promise<Tag> => {
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const tag = await res.json();
    setAllTags((prev) => [...prev, { ...tag, noteCount: 0 }]);
    return tag;
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="h-full flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="h-full flex flex-col bg-white">
        {/* Header Bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Notebook Selector */}
          <div className="flex items-center gap-1.5 text-sm">
            <BookOpen className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedNotebookId}
              onChange={(e) => handleNotebookChange(e.target.value)}
              className="text-sm text-gray-600 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="">No notebook</option>
              {notebooks.map((nb) => (
                <option key={nb.id} value={nb.id}>
                  {nb.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1" />

          {/* Save Status */}
          <span className="text-xs text-gray-400">
            {saving ? "Saving..." : "Saved"}
          </span>

          {note && !note.isTrashed && (
            <>
              <button
                onClick={togglePin}
                className={`p-1.5 rounded-lg hover:bg-gray-100 ${
                  note.isPinned ? "text-green-600" : "text-gray-400"
                }`}
                title={note.isPinned ? "Unpin" : "Pin"}
              >
                <Pin className="w-4 h-4" />
              </button>
              <button
                onClick={toggleFavorite}
                className={`p-1.5 rounded-lg hover:bg-gray-100 ${
                  note.isFavorite
                    ? "text-yellow-500"
                    : "text-gray-400"
                }`}
                title={note.isFavorite ? "Remove from favorites" : "Favorite"}
              >
                <Star
                  className={`w-4 h-4 ${
                    note.isFavorite ? "fill-yellow-500" : ""
                  }`}
                />
              </button>
              <button
                onClick={moveToTrash}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                title="Move to trash"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          {note?.isTrashed && (
            <button
              onClick={restoreNote}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore
            </button>
          )}
        </div>

        {/* Title */}
        <div className="px-6 pt-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="Untitled"
            className="w-full text-2xl font-bold text-gray-900 placeholder-gray-300 focus:outline-none"
          />
        </div>

        {/* Tags */}
        <div className="px-6 py-2">
          <TagManager
            allTags={allTags}
            selectedTagIds={selectedTagIds}
            onChange={(ids) => {
              setSelectedTagIds(ids);
              if (note) {
                fetch("/api/notes", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: note.id, tagIds: ids }),
                });
              }
            }}
            onCreateTag={handleCreateTag}
          />
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <NoteEditor content={content} onChange={saveNote} />
        </div>
      </div>
    </AuthGuard>
  );
}
