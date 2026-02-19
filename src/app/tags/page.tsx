"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { Tag as TagType } from "@/lib/types";
import { Tag, Trash2, Plus } from "lucide-react";

export default function TagsPage() {
  const [tags, setTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const router = useRouter();

  const fetchTags = async () => {
    setLoading(true);
    const res = await fetch("/api/tags");
    setTags(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const createTag = async () => {
    if (!newTagName.trim()) return;
    await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTagName.trim() }),
    });
    setNewTagName("");
    fetchTags();
  };

  const deleteTag = async (id: string) => {
    if (!confirm("Delete this tag?")) return;
    await fetch(`/api/tags?id=${id}`, { method: "DELETE" });
    fetchTags();
  };

  return (
    <AuthGuard>
      <div className="h-full overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto p-6 lg:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Tags</h1>

          {/* Create Tag */}
          <div className="flex items-center gap-2 mb-6">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createTag()}
              placeholder="Create new tag..."
              className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={createTag}
              disabled={!newTagName.trim()}
              className="px-4 py-2.5 bg-[#00a82d] text-white rounded-lg hover:bg-[#009425] text-sm font-medium disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tags.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg mb-1">No tags yet</p>
              <p className="text-sm">Create tags to organize your notes.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-shadow group"
                >
                  <Tag className="w-4 h-4 text-gray-400" />
                  <button
                    onClick={() => router.push(`/tags/${tag.id}`)}
                    className="flex-1 text-left text-sm font-medium text-gray-900"
                  >
                    {tag.name}
                  </button>
                  <span className="text-xs text-gray-400">
                    {tag.noteCount} note{tag.noteCount !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={() => deleteTag(tag.id)}
                    className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
