"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  FileText,
  CheckSquare,
  BookOpen,
  Tag,
  Trash2,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Pin,
  Star,
} from "lucide-react";
import { Notebook, Tag as TagType, Note } from "@/lib/types";

const NAV_ITEMS = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Notes", icon: FileText, href: "/notes/new" },
  { label: "Tasks", icon: CheckSquare, href: "/tasks" },
];

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [notebooksOpen, setNotebooksOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Track which notebooks are expanded to show their notes
  const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(new Set());
  // Cache of notes per notebook
  const [notebookNotes, setNotebookNotes] = useState<Record<string, Note[]>>({});
  const [loadingNotes, setLoadingNotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (session) {
      fetch("/api/notebooks")
        .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
        .then((data) => setNotebooks(Array.isArray(data) ? data : []))
        .catch(() => setNotebooks([]));
      fetch("/api/tags")
        .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
        .then((data) => setTags(Array.isArray(data) ? data : []))
        .catch(() => setTags([]));
    }
  }, [session]);

  const toggleNotebookExpand = useCallback(async (notebookId: string) => {
    setExpandedNotebooks((prev) => {
      const next = new Set(prev);
      if (next.has(notebookId)) {
        next.delete(notebookId);
      } else {
        next.add(notebookId);
      }
      return next;
    });

    // Fetch notes for this notebook if not already cached
    if (!notebookNotes[notebookId] && !loadingNotes.has(notebookId)) {
      setLoadingNotes((prev) => new Set(prev).add(notebookId));
      try {
        const res = await fetch(`/api/notes?notebookId=${notebookId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setNotebookNotes((prev) => ({ ...prev, [notebookId]: Array.isArray(data) ? data : [] }));
      } catch {
        setNotebookNotes((prev) => ({ ...prev, [notebookId]: [] }));
      } finally {
        setLoadingNotes((prev) => {
          const next = new Set(prev);
          next.delete(notebookId);
          return next;
        });
      }
    }
  }, [notebookNotes, loadingNotes]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  const createNewNote = () => {
    router.push("/notes/new");
    setMobileOpen(false);
  };

  const isActive = (href: string) => pathname === href;

  const truncateTitle = (title: string, maxLen = 22) =>
    title.length > maxLen ? title.slice(0, maxLen) + "…" : title;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#f5f0e8] border-r border-[#e0d9cd]">
      {/* Search */}
      <div className="p-3">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#d5cfc3] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </form>
      </div>

      {/* New Note Button */}
      <div className="px-3 pb-2">
        <button
          onClick={createNewNote}
          className="flex items-center gap-2 w-full px-4 py-2.5 bg-[#00a82d] hover:bg-[#009425] text-white rounded-lg font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Note
        </button>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto px-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.href}
            onClick={() => {
              router.push(item.href);
              setMobileOpen(false);
            }}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors mb-0.5 ${
              isActive(item.href)
                ? "bg-[#e8e1d3] text-gray-900 font-medium"
                : "text-gray-700 hover:bg-[#ece5d8]"
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}

        {/* Notebooks Section */}
        <div className="mt-4">
          <button
            onClick={() => setNotebooksOpen(!notebooksOpen)}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
          >
            {notebooksOpen ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            Notebooks
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push("/notebooks");
              }}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </button>

          {notebooksOpen && (
            <div className="ml-1">
              {notebooks.map((nb) => {
                const isExpanded = expandedNotebooks.has(nb.id);
                const nbNotes = notebookNotes[nb.id] || [];
                const isLoading = loadingNotes.has(nb.id);

                return (
                  <div key={nb.id}>
                    {/* Notebook row */}
                    <div className="flex items-center">
                      {/* Expand/collapse toggle */}
                      <button
                        onClick={() => toggleNotebookExpand(nb.id)}
                        className="p-0.5 text-gray-400 hover:text-gray-600 flex-shrink-0"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </button>

                      {/* Notebook name — navigates to notebook page */}
                      <button
                        onClick={() => {
                          router.push(`/notebooks/${nb.id}`);
                          setMobileOpen(false);
                        }}
                        className={`flex items-center gap-2 flex-1 min-w-0 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                          pathname === `/notebooks/${nb.id}`
                            ? "bg-[#e8e1d3] text-gray-900 font-medium"
                            : "text-gray-600 hover:bg-[#ece5d8]"
                        }`}
                      >
                        <BookOpen
                          className="w-3.5 h-3.5 flex-shrink-0"
                          style={{ color: nb.color }}
                        />
                        <span className="truncate">{nb.name}</span>
                        <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
                          {nb.noteCount}
                        </span>
                      </button>
                    </div>

                    {/* Expanded notes list */}
                    {isExpanded && (
                      <div className="ml-4 pl-2 border-l border-[#ddd6c6]">
                        {isLoading ? (
                          <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-400">
                            <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin" />
                            Loading...
                          </div>
                        ) : nbNotes.length === 0 ? (
                          <div className="px-2 py-1.5 text-xs text-gray-400 italic">
                            No notes
                          </div>
                        ) : (
                          nbNotes.map((note) => (
                            <button
                              key={note.id}
                              onClick={() => {
                                router.push(`/notes/${note.id}`);
                                setMobileOpen(false);
                              }}
                              className={`flex items-center gap-1.5 w-full px-2 py-1 rounded text-xs transition-colors ${
                                pathname === `/notes/${note.id}`
                                  ? "bg-[#e8e1d3] text-gray-900 font-medium"
                                  : "text-gray-500 hover:bg-[#ece5d8] hover:text-gray-700"
                              }`}
                            >
                              <FileText className="w-3 h-3 flex-shrink-0 text-gray-400" />
                              <span className="truncate">
                                {truncateTitle(note.title || "Untitled")}
                              </span>
                              {note.isPinned && (
                                <Pin className="w-2.5 h-2.5 text-green-500 flex-shrink-0 ml-auto" />
                              )}
                              {note.isFavorite && (
                                <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                              )}
                            </button>
                          ))
                        )}

                        {/* Quick add note to this notebook */}
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch("/api/notes", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ notebookId: nb.id }),
                              });
                              if (!res.ok) return;
                              const newNote = await res.json();
                              setNotebookNotes((prev) => ({
                                ...prev,
                                [nb.id]: [newNote, ...(prev[nb.id] || [])],
                              }));
                              router.push(`/notes/${newNote.id}`);
                              setMobileOpen(false);
                            } catch {
                              // silently ignore
                            }
                          }}
                          className="flex items-center gap-1.5 w-full px-2 py-1 rounded text-xs text-gray-400 hover:bg-[#ece5d8] hover:text-green-600 transition-colors mt-0.5"
                        >
                          <Plus className="w-3 h-3" />
                          Add note
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tags Section */}
        <div className="mt-4">
          <button
            onClick={() => setTagsOpen(!tagsOpen)}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
          >
            {tagsOpen ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            Tags
          </button>

          {tagsOpen && (
            <div className="ml-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    router.push(`/tags/${tag.id}`);
                    setMobileOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    pathname === `/tags/${tag.id}`
                      ? "bg-[#e8e1d3] text-gray-900 font-medium"
                      : "text-gray-600 hover:bg-[#ece5d8]"
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span className="truncate">{tag.name}</span>
                  <span className="ml-auto text-xs text-gray-400">
                    {tag.noteCount}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Trash */}
        <div className="mt-4">
          <button
            onClick={() => {
              router.push("/trash");
              setMobileOpen(false);
            }}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === "/trash"
                ? "bg-[#e8e1d3] text-gray-900 font-medium"
                : "text-gray-700 hover:bg-[#ece5d8]"
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Trash
          </button>
        </div>
      </nav>

      {/* User Section */}
      <div className="border-t border-[#e0d9cd] p-3">
        <div className="flex items-center gap-2">
          {session?.user?.image && (
            <img
              src={session.user.image}
              alt=""
              className="w-7 h-7 rounded-full"
            />
          )}
          <span className="text-sm text-gray-700 truncate flex-1">
            {session?.user?.email}
          </span>
          <button
            onClick={() => signOut()}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block w-60 h-screen flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={`lg:hidden fixed top-0 left-0 w-64 h-screen z-40 transform transition-transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
