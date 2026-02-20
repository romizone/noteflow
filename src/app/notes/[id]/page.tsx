"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import NoteEditor from "@/components/NoteEditor";
import TagManager from "@/components/TagManager";
import { Note, Notebook, Tag } from "@/lib/types";
import type { Editor } from "@tiptap/react";
import {
  ArrowLeft,
  Star,
  Pin,
  Trash2,
  BookOpen,
  RotateCcw,
  Save,
  Check,
  Loader2,
  MousePointerClick,
  Copy,
  Scissors,
  ClipboardPaste,
} from "lucide-react";

interface NoteWithTags extends Note {
  tagIds?: string[];
}

export default function NoteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "new";

  const [note, setNote] = useState<NoteWithTags | null>(null);
  const [title, setTitle] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState<string | null>(null);
  const editorInstanceRef = useRef<Editor | null>(null);

  // Refs for latest values (avoid stale closures in debounce)
  const latestContentRef = useRef<{ html: string; text: string } | null>(null);
  const noteRef = useRef<NoteWithTags | null>(null);
  const titleRef = useRef(title);
  const notebookRef = useRef(selectedNotebookId);
  const tagIdsRef = useRef(selectedTagIds);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);
  const isNewRef = useRef(isNew);
  const savingRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { noteRef.current = note; }, [note]);
  useEffect(() => { titleRef.current = title; }, [title]);
  useEffect(() => { notebookRef.current = selectedNotebookId; }, [selectedNotebookId]);
  useEffect(() => { tagIdsRef.current = selectedTagIds; }, [selectedTagIds]);
  useEffect(() => { isNewRef.current = isNew; }, [isNew]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Load data
  useEffect(() => {
    fetch("/api/notebooks")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load notebooks");
        return r.json();
      })
      .then(setNotebooks)
      .catch(() => {});

    fetch("/api/tags")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load tags");
        return r.json();
      })
      .then(setAllTags)
      .catch(() => {});

    if (!isNew) {
      fetch(`/api/notes/${params.id}`)
        .then((r) => {
          if (!r.ok) throw new Error("Note not found");
          return r.json();
        })
        .then((data: NoteWithTags) => {
          setNote(data);
          setTitle(data.title);
          setInitialContent(data.content);
          setSelectedNotebookId(data.notebookId || "");
          setSelectedTagIds(data.tagIds || []);
          latestContentRef.current = { html: data.content, text: data.plainText };
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [params.id, isNew]);

  // Core save function using refs to avoid stale closures
  const performSave = useCallback(async () => {
    if (savingRef.current) return;
    const ref = latestContentRef.current;
    if (!ref) return;

    savingRef.current = true;
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      if (isNewRef.current || !noteRef.current) {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: titleRef.current || "Untitled",
            content: ref.html,
            plainText: ref.text,
            notebookId: notebookRef.current || null,
            tagIds: tagIdsRef.current,
          }),
        });
        if (!res.ok) throw new Error("Failed to create note");
        const newNote = await res.json();
        setNote(newNote);
        isNewRef.current = false;
        window.history.replaceState(null, "", `/notes/${newNote.id}`);
      } else {
        const res = await fetch("/api/notes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: noteRef.current.id,
            title: titleRef.current || "Untitled",
            content: ref.html,
            plainText: ref.text,
            notebookId: notebookRef.current || null,
            tagIds: tagIdsRef.current,
          }),
        });
        if (!res.ok) throw new Error("Failed to save note");
      }
      setSaved(true);
      // Reset saved indicator after 2s
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, []);

  // Keyboard shortcut: Ctrl+S / Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        performSave();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [performSave]);

  // Debounced auto-save triggered by editor content changes
  const handleEditorChange = useCallback(
    (html: string, text: string) => {
      latestContentRef.current = { html, text };
      setSaved(false);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        performSave();
      }, 1500);
    },
    [performSave]
  );

  // Manual save
  const handleManualSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    performSave();
  }, [performSave]);

  // Title blur → save title
  const handleTitleBlur = () => {
    if (noteRef.current && title !== noteRef.current.title) {
      fetch("/api/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: noteRef.current.id, title: title || "Untitled" }),
      }).catch(() => {});
    }
  };

  const toggleFavorite = async () => {
    if (!note) return;
    try {
      const res = await fetch("/api/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: note.id, isFavorite: !note.isFavorite }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setNote((prev) => prev ? { ...prev, ...updated } : prev);
    } catch {
      setError("Failed to update");
    }
  };

  const togglePin = async () => {
    if (!note) return;
    try {
      const res = await fetch("/api/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: note.id, isPinned: !note.isPinned }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setNote((prev) => prev ? { ...prev, ...updated } : prev);
    } catch {
      setError("Failed to update");
    }
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
    if (noteRef.current) {
      await fetch("/api/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: noteRef.current.id, notebookId: notebookId || null }),
      }).catch(() => {});
    }
  };

  const handleCreateTag = async (name: string): Promise<Tag> => {
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Failed to create tag");
    const tag = await res.json();
    setAllTags((prev) => [...prev, { ...tag, noteCount: 0 }]);
    return tag;
  };

  // Clipboard actions
  const handleSelectAll = useCallback(() => {
    editorInstanceRef.current?.chain().focus().selectAll().run();
  }, []);

  const handleCopy = useCallback(() => {
    const ed = editorInstanceRef.current;
    if (!ed) return;
    const { from, to } = ed.state.selection;
    if (from === to) ed.chain().focus().selectAll().run();
    const text = ed.state.doc.textBetween(
      ed.state.selection.from,
      ed.state.selection.to,
      "\n"
    );
    navigator.clipboard.writeText(text);
  }, []);

  const handleCut = useCallback(() => {
    const ed = editorInstanceRef.current;
    if (!ed) return;
    const { from, to } = ed.state.selection;
    if (from === to) ed.chain().focus().selectAll().run();
    const text = ed.state.doc.textBetween(
      ed.state.selection.from,
      ed.state.selection.to,
      "\n"
    );
    navigator.clipboard.writeText(text);
    ed.chain().focus().deleteSelection().run();
  }, []);

  const handlePaste = useCallback(async () => {
    const ed = editorInstanceRef.current;
    if (!ed) return;
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        ed.chain().focus().insertContent(text).run();
      }
    } catch {
      // Clipboard permission denied — ignore
    }
  }, []);

  if (loading) {
    return (
      <AuthGuard>
        <div className="h-full flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AuthGuard>
    );
  }

  if (error && !note && !isNew) {
    return (
      <AuthGuard>
        <div className="h-full flex flex-col items-center justify-center gap-4">
          <p className="text-gray-500">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Go Home
          </button>
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

          <div className="w-px h-5 bg-gray-200 mx-0.5" />

          {/* Clipboard Actions */}
          <button
            onClick={handleSelectAll}
            title="Select All"
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
          >
            <MousePointerClick className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            title="Copy"
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handleCut}
            title="Cut"
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
          >
            <Scissors className="w-4 h-4" />
          </button>
          <button
            onClick={handlePaste}
            title="Paste"
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
          >
            <ClipboardPaste className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-gray-200 mx-0.5" />

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

          {/* Save status */}
          {error && (
            <span className="text-xs text-red-500 mr-2">{error}</span>
          )}

          {/* Save Button */}
          <button
            onClick={handleManualSave}
            disabled={saving}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              saved
                ? "bg-green-100 text-green-700"
                : "bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : saved ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {saving ? "Saving..." : saved ? "Saved" : "Save"}
          </button>

          {note && !note.isTrashed && (
            <>
              <button
                onClick={togglePin}
                className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${
                  note.isPinned ? "text-green-600" : "text-gray-400"
                }`}
                title={note.isPinned ? "Unpin" : "Pin"}
              >
                <Pin className="w-4 h-4" />
              </button>
              <button
                onClick={toggleFavorite}
                className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${
                  note.isFavorite ? "text-yellow-500" : "text-gray-400"
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
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
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
              if (noteRef.current) {
                fetch("/api/notes", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: noteRef.current.id, tagIds: ids }),
                }).catch(() => {});
              }
            }}
            onCreateTag={handleCreateTag}
          />
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <NoteEditor content={initialContent} onChange={handleEditorChange} editorRef={editorInstanceRef} />
        </div>
      </div>
    </AuthGuard>
  );
}
