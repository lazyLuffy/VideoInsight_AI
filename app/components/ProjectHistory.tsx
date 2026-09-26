'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Trash2, X, Search, FileText } from 'lucide-react';

export interface SavedProject {
  id: string;
  title: string;
  date: string;
  sourceUrl?: string;
  fileName?: string;
  preset: string;
  notes: string;
}

interface ProjectHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: SavedProject) => void;
  activeProjectId?: string;
}

const STORAGE_KEY = 'videoinsight_history';

function loadStoredProjects(): SavedProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveProjectToHistory(project: Omit<SavedProject, 'id' | 'date'>): SavedProject {
  if (typeof window === 'undefined') return { ...project, id: '', date: '' };

  const existing = loadStoredProjects();

  const newProject: SavedProject = {
    ...project,
    id: `project-${Date.now()}`,
    date: new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  const updated = [newProject, ...existing.filter((p) => p.title !== newProject.title).slice(0, 29)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newProject;
}

export default function ProjectHistory({
  isOpen,
  onClose,
  onSelectProject,
  activeProjectId,
}: ProjectHistoryProps) {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      setProjects(loadStoredProjects());
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen]);

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function handleClearAll() {
    if (!confirm('Are you sure you want to clear your entire history?')) return;
    setProjects([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.notes.toLowerCase().includes(search.toLowerCase()) ||
      (p.sourceUrl && p.sourceUrl.toLowerCase().includes(search.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="relative flex h-full w-full max-w-md flex-col bg-white dark:bg-[#0f0f0f] border-l border-neutral-200 dark:border-[#272727] shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-[#272727] px-6 py-4 bg-neutral-50 dark:bg-[#181818]">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-red-600 dark:text-red-500" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Saved Projects & History</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-neutral-200 dark:border-[#272727] p-4 bg-white dark:bg-[#0f0f0f]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search previous notes..."
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181818] pl-9 pr-4 py-2 text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:border-red-500 focus:bg-white dark:focus:bg-[#181818] focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950/40 placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50/40 dark:bg-[#0f0f0f]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-neutral-400">
              <FileText className="h-10 w-10 text-neutral-300 dark:text-neutral-700 mb-2" />
              <p className="text-sm font-medium">No saved notes found</p>
              <p className="text-xs text-neutral-400 mt-1">
                Generated notes will automatically appear here.
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const isActive = item.id === activeProjectId;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectProject(item);
                    onClose();
                  }}
                  className={`group relative cursor-pointer rounded-2xl border p-4 transition ${
                    isActive
                      ? 'border-red-600 bg-red-50/70 dark:bg-red-950/30 shadow-sm'
                      : 'border-neutral-200 dark:border-[#272727] bg-white dark:bg-[#181818] hover:border-red-300 dark:hover:border-red-600/50 hover:bg-neutral-50 dark:hover:bg-[#212121]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-1">
                      {item.title}
                    </h3>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      title="Delete from history"
                      className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {item.notes.replace(/[#*`_]/g, '').slice(0, 140)}...
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3 text-red-500/80" /> {item.date}
                    </span>
                    <span className="rounded-full bg-red-100/80 dark:bg-red-950/60 px-2 py-0.5 font-medium text-red-700 dark:text-red-400 capitalize">
                      {item.preset}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {projects.length > 0 && (
          <div className="border-t border-neutral-200 dark:border-[#272727] p-4 flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-[#181818]">
            <span>{projects.length} saved project{projects.length === 1 ? '' : 's'}</span>
            <button
              onClick={handleClearAll}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:underline font-medium cursor-pointer"
            >
              Clear all history
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
