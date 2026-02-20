"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Note } from "@/lib/types";
import { Star, Pin, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

const MENU_WIDTH = 160;
const MENU_HEIGHT = 120;

function clampMenuPosition(x: number, y: number) {
  const clampedX = Math.min(x, window.innerWidth - MENU_WIDTH - 8);
  const clampedY = Math.min(y, window.innerHeight - MENU_HEIGHT - 8);
  return { x: Math.max(8, clampedX), y: Math.max(8, clampedY) };
}

interface NoteCardProps {
  note: Note;
  notebookName?: string;
  onDelete?: (noteId: string) => void;
  onUpdate?: (note: Note) => void;
}

export default function NoteCard({ note, notebookName, onDelete, onUpdate }: NoteCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const preview =
    note.plainText?.slice(0, 120) || "No content";

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos(clampMenuPosition(e.clientX, e.clientY));
    setShowMenu(true);
  };

  const handleAction = async (
    e: React.MouseEvent,
    updates: Record<string, unknown>,
    callback?: () => void
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    setLoading(true);
    try {
      const res = await fetch("/api/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: note.id, ...updates }),
      });
      if (res.ok) {
        callback?.();
      }
    } catch {
      // network error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) =>
    handleAction(
      e,
      { isTrashed: true, trashedAt: new Date().toISOString() },
      () => onDelete?.(note.id)
    );

  const handleToggleFavorite = (e: React.MouseEvent) =>
    handleAction(
      e,
      { isFavorite: !note.isFavorite },
      () => onUpdate?.({ ...note, isFavorite: !note.isFavorite })
    );

  const handleTogglePin = (e: React.MouseEvent) =>
    handleAction(
      e,
      { isPinned: !note.isPinned },
      () => onUpdate?.({ ...note, isPinned: !note.isPinned })
    );

  const closeMenu = useCallback(() => setShowMenu(false), []);

  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showMenu, closeMenu]);

  return (
    <>
      <div
        onClick={() => router.push(`/notes/${note.id}`)}
        onContextMenu={handleContextMenu}
        className={`bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow group min-h-[180px] flex flex-col ${
          loading ? "opacity-60 pointer-events-none" : ""
        }`}
      >
        {notebookName && (
          <div className="text-xs text-gray-400 mb-1">{notebookName}</div>
        )}
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
          {note.title || "Untitled"}
        </h3>
        <p className="text-xs text-gray-500 flex-1 line-clamp-4 mb-3">
          {preview}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
          </span>
          <div className="flex items-center gap-1">
            {loading && <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />}
            {note.isPinned && <Pin className="w-3 h-3 text-gray-400" />}
            {note.isFavorite && (
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            )}
          </div>
        </div>
      </div>

      {showMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]"
          style={{ left: menuPos.x, top: menuPos.y }}
        >
          <button
            onClick={handleToggleFavorite}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Star className={`w-4 h-4 ${note.isFavorite ? "text-yellow-500 fill-yellow-500" : ""}`} />
            {note.isFavorite ? "Remove favorite" : "Add to favorites"}
          </button>
          <button
            onClick={handleTogglePin}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Pin className={`w-4 h-4 ${note.isPinned ? "text-blue-500" : ""}`} />
            {note.isPinned ? "Unpin" : "Pin to top"}
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </>
  );
}
