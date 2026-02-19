export interface Note {
  id: string;
  title: string;
  content: string;
  plainText: string;
  notebookId: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  isTrashed: boolean;
  trashedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notebook {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
  noteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  noteCount: number;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  noteId: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScratchPadData {
  id?: string;
  content: string;
  updatedAt?: string;
}
