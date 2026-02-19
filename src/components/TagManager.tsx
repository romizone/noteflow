"use client";

import { useState } from "react";
import { Tag as TagType } from "@/lib/types";
import { X, Plus } from "lucide-react";

interface TagManagerProps {
  allTags: TagType[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  onCreateTag: (name: string) => Promise<TagType>;
}

export default function TagManager({
  allTags,
  selectedTagIds,
  onChange,
  onCreateTag,
}: TagManagerProps) {
  const [newTagName, setNewTagName] = useState("");
  const [showInput, setShowInput] = useState(false);

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    const tag = await onCreateTag(newTagName.trim());
    onChange([...selectedTagIds, tag.id]);
    setNewTagName("");
    setShowInput(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {allTags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => toggleTag(tag.id)}
          className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
            selectedTagIds.includes(tag.id)
              ? "bg-green-100 border-green-300 text-green-700"
              : "bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {tag.name}
        </button>
      ))}
      {showInput ? (
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
            className="px-2 py-0.5 text-xs border rounded-full w-24 focus:outline-none focus:ring-1 focus:ring-green-500"
            placeholder="Tag name"
            autoFocus
          />
          <button
            onClick={() => setShowInput(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="p-0.5 text-gray-400 hover:text-gray-600"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
