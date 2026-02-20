"use client";

import { useState, useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";

export default function ScratchPad() {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetch("/api/scratch-pad")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load scratch pad");
        return r.json();
      })
      .then((data) => setContent(data.content || ""))
      .catch((err) => setError(err.message));
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const handleChange = (value: string) => {
    setContent(value);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      // Abort any previous in-flight save request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setSaving(true);
      try {
        const res = await fetch("/api/scratch-pad", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: value }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to save");
      } catch (err) {
        // Ignore abort errors
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Failed to save. Changes may be lost.");
      } finally {
        setSaving(false);
      }
    }, 1000);
  };

  return (
    <div className="bg-[#fef9e7] rounded-xl p-4 border border-[#f0e6c0] max-w-2xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Scratch pad</h3>
        {saving && (
          <span className="text-xs text-gray-400">Saving...</span>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 mb-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Start writing..."
        className="w-full h-24 bg-transparent text-sm text-gray-700 resize-none focus:outline-none placeholder-gray-400"
      />
    </div>
  );
}
