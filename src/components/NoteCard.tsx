"use client";

import { Note } from "@/lib/types";
import { Star, Pin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

interface NoteCardProps {
  note: Note;
  notebookName?: string;
}

export default function NoteCard({ note, notebookName }: NoteCardProps) {
  const router = useRouter();

  const preview =
    note.plainText?.slice(0, 120) || "No content";

  return (
    <div
      onClick={() => router.push(`/notes/${note.id}`)}
      className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow group min-h-[180px] flex flex-col"
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
          {note.isPinned && <Pin className="w-3 h-3 text-gray-400" />}
          {note.isFavorite && (
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          )}
        </div>
      </div>
    </div>
  );
}
