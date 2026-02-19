"use client";

import { useState, useEffect, useRef } from "react";

export default function ScratchPad() {
  const [content, setContent] = useState("");
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    fetch("/api/scratch-pad")
      .then((r) => r.json())
      .then((data) => setContent(data.content || ""));
  }, []);

  const handleChange = (value: string) => {
    setContent(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch("/api/scratch-pad", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: value }),
      });
    }, 1000);
  };

  return (
    <div className="bg-[#fef9e7] rounded-xl p-4 border border-[#f0e6c0]">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Scratch pad</h3>
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Start writing..."
        className="w-full h-32 bg-transparent text-sm text-gray-700 resize-none focus:outline-none placeholder-gray-400"
      />
    </div>
  );
}
