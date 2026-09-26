'use client';

import {
  BookOpen,
  BrainCircuit,
  Briefcase,
  Check,
  Copy,
  Download,
  FileText,
  FileVideo,
  History,
  PlayCircle,
  Printer,
  Sparkles,
  UploadCloud,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import siteContent from "../data/site-content.json";
import MarkdownViewer from "./components/MarkdownViewer";
import VideoPlayer, { extractYouTubeId } from "./components/VideoPlayer";
import ChatAssistant from "./components/ChatAssistant";
import ProjectHistory, { saveProjectToHistory, type SavedProject } from "./components/ProjectHistory";
import ThemeToggle from "./components/ThemeToggle";

const iconMap: Record<string, LucideIcon> = {
  "play-circle": PlayCircle,
  "brain-circuit": BrainCircuit,
  "file-text": FileText,
  "upload-cloud": UploadCloud,
  "file-video": FileVideo,
  download: Download,
};

type NotePreset = "comprehensive" | "study" | "executive" | "quick";

const PRESETS: Array<{ id: NotePreset; label: string; icon: LucideIcon; desc: string }> = [
  { id: "comprehensive", label: "Comprehensive", icon: BookOpen, desc: "Full breakdown with timestamps and action items" },
  { id: "study", label: "Study & Quiz", icon: BrainCircuit, desc: "Definitions, breakdown, and 5 practice quiz questions" },
  { id: "executive", label: "Executive Brief", icon: Briefcase, desc: "High-level TL;DR, decisions, and strategic next steps" },
  { id: "quick", label: "Quick Bullets", icon: Zap, desc: "60-second summary and high-signal bullet points" },
];

export default function Home() {
  const { hero, quickBadges, stats, featureSection, features } = siteContent;
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<NotePreset>("comprehensive");
  const [notes, setNotes] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | undefined>();

  const hasYouTubeVideo = Boolean(extractYouTubeId(sourceUrl));

  async function generateNotes() {
    if (!sourceUrl.trim() && !sourceFile) {
      setError("Add a YouTube link or choose a file first.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setNotes("");
    setNoteTitle("");

    try {
      const formData = new FormData();
      formData.set("url", sourceUrl.trim());
      formData.set("preset", preset);
      if (sourceFile) formData.set("file", sourceFile);

      const response = await fetch("/api/generate-notes", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error ?? "Unable to generate notes.");

      const generatedNotes = result.notes;
      const title = result.title || (sourceUrl ? "YouTube Video Notes" : (sourceFile?.name ?? "Video Notes"));

      setNotes(generatedNotes);
      setNoteTitle(title);

      // Save to local project history
      const saved = saveProjectToHistory({
        title,
        sourceUrl: sourceUrl.trim(),
        fileName: sourceFile?.name,
        preset,
        notes: generatedNotes,
      });
      setActiveProjectId(saved.id);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Unable to generate notes.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSelectHistory(project: SavedProject) {
    setNotes(project.notes);
    setNoteTitle(project.title);
    if (project.sourceUrl) setSourceUrl(project.sourceUrl);
    setPreset(project.preset as NotePreset);
    setActiveProjectId(project.id);
    document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" });
  }

  function downloadMarkdown() {
    const filename = `${(noteTitle || "videoinsight-notes").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    const blob = new Blob([notes], { type: "text/markdown;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(notes);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  function exportPdf() {
    window.print();
  }

  return (
    <main className="min-h-screen text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      {/* Floating Top-Right Controls: Theme & History */}
      <div className="no-print fixed top-5 right-6 z-40 flex items-center gap-2 rounded-full border border-neutral-200/90 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md p-1.5 shadow-md hover:shadow-lg transition-all">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer shadow-2xs"
          title="Open saved projects history"
        >
          <History className="h-3.5 w-3.5 text-red-600 dark:text-red-500" />
          <span>History</span>
        </button>
      </div>

      {/* Non-printable Hero Section */}
      <section className="no-print mx-auto max-w-7xl px-6 pb-12 pt-12 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-3.5 py-1 text-sm font-medium text-red-600 dark:text-red-400 shadow-2xs">
            <Sparkles className="h-4 w-4" />
            {hero.eyebrow}
          </div>

          <h1
            className="mt-6 text-5xl font-black tracking-tight text-neutral-900 dark:text-white md:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {hero.headline}
          </h1>

          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            {hero.description}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-neutral-600 dark:text-neutral-400">
            {quickBadges.map((item) => {
              const Icon = iconMap[item.icon] ?? FileVideo;
              return (
                <div key={item.label} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-red-600 dark:text-red-500" />
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Main Workspace */}
      <section id="workspace" className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="rounded-3xl border border-neutral-200 dark:border-[#272727] bg-white dark:bg-[#181818] p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-colors duration-200">
          
          {/* Top Controls / Configuration (Hidden during print) */}
          <div className="no-print space-y-6 mb-8 border-b border-neutral-200/80 dark:border-[#272727] pb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Note Generator Workspace</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Select a style preset, provide a YouTube URL or upload a file</p>
              </div>

              {/* Theme Toggle, History & Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <ThemeToggle />

                <button
                  type="button"
                  onClick={() => setHistoryOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer shadow-2xs mr-1"
                >
                  <History className="h-3.5 w-3.5 text-red-600 dark:text-red-500" />
                  History
                </button>

                {PRESETS.map((p) => {
                  const Icon = p.icon;
                  const isSelected = preset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPreset(p.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                        isSelected
                          ? "bg-red-600 text-white shadow-xs hover:bg-red-700"
                          : "bg-neutral-100 dark:bg-[#272727] border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#383838]"
                      }`}
                      title={p.desc}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Source Inputs (YouTube & File) */}
            <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] items-center">
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#121212] p-3 transition-colors">
                <label htmlFor="source-url" className="text-[11px] uppercase tracking-[0.2em] font-bold text-red-600 dark:text-red-500 block">
                  YouTube Link
                </label>
                <input
                  id="source-url"
                  value={sourceUrl}
                  onChange={(event) => setSourceUrl(event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="mt-1.5 w-full bg-transparent text-sm text-neutral-900 dark:text-neutral-100 outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                />
              </div>

              <div className="text-center text-xs font-bold text-neutral-400 uppercase tracking-widest">or</div>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/70 dark:bg-[#121212] p-3.5 text-sm text-neutral-700 dark:text-neutral-300 transition hover:bg-neutral-100 dark:hover:bg-[#1a1a1a]">
                <UploadCloud className="h-5 w-5 text-red-600 dark:text-red-500 shrink-0" />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {sourceFile?.name ?? "Upload video, PDF, or document (≤20MB)"}
                </span>
                <input
                  type="file"
                  accept="video/*,.pdf,.txt,.md"
                  onChange={(event) => setSourceFile(event.target.files?.[0] ?? null)}
                  className="sr-only"
                />
              </label>
            </div>

            {/* Action Button & Error */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={generateNotes}
                disabled={isGenerating}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-red-600 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60 cursor-pointer"
              >
                {isGenerating ? "Analyzing & Generating Notes..." : "Generate AI Notes"}
                <Sparkles className="h-4 w-4" />
              </button>

              {error && (
                <div role="alert" className="text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl px-4 py-2">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          {notes ? (
            <div className="space-y-6">
              {/* Workspace Action Bar */}
              <div className="no-print flex flex-wrap items-center justify-between gap-4 bg-neutral-50 dark:bg-[#1f1f1f] border border-neutral-200 dark:border-[#2a2a2a] rounded-2xl px-5 py-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-red-600 dark:text-red-500" />
                  <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 line-clamp-1">{noteTitle || "Generated Notes"}</span>
                  <span className="rounded-full bg-red-100 dark:bg-red-950/60 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:text-red-400 capitalize">
                    {preset}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyMarkdown}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#272727] px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#333333] transition cursor-pointer"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>

                  <button
                    onClick={downloadMarkdown}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#272727] px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#333333] transition cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                    Download .md
                  </button>

                  <button
                    onClick={exportPdf}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition shadow-xs cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Export PDF
                  </button>
                </div>
              </div>

              {/* Grid: Video Player + Notes */}
              <div className={`grid gap-8 items-start ${hasYouTubeVideo ? "lg:grid-cols-[1.1fr_0.9fr]" : "grid-cols-1"}`}>
                
                {/* Clean Notes Render Area (Target for Print & PDF) */}
                <div className="print-area rounded-2xl border border-neutral-200 dark:border-[#272727] bg-[#ffffff] dark:bg-[#121212] p-6 md:p-8 shadow-xs">
                  <MarkdownViewer content={notes} onSeekTimestamp={(sec) => setSeekTime(sec)} />
                </div>

                {/* Video Player Column */}
                {hasYouTubeVideo && (
                  <div className="no-print sticky top-6 space-y-4">
                    <VideoPlayer url={sourceUrl} seekTime={seekTime} />
                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-[#1c1c1c] p-3 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      💡 <strong>Interactive Seeking:</strong> Click any <span className="font-mono text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/60 px-1 rounded">[MM:SS]</span> timestamp inside the notes to jump directly to that point in the video!
                    </div>
                  </div>
                )}
              </div>

              {/* "Chat with Video" Assistant */}
              <div className="no-print">
                <ChatAssistant
                  notes={notes}
                  sourceUrl={sourceUrl}
                  onSeekTimestamp={(sec) => setSeekTime(sec)}
                />
              </div>
            </div>
          ) : (
            /* Empty State / Feature Teaser */
            <div className="no-print flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mb-4 shadow-sm">
                <BrainCircuit className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Your AI Notes Will Appear Here</h3>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
                Paste a YouTube URL or upload a file above and hit &ldquo;Generate AI Notes&rdquo;. You will receive synchronized timestamps, full Markdown formatting, and a chat assistant!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Feature Section & Stats (Hidden during print) */}
      <section className="no-print mx-auto max-w-7xl px-6 pb-20 lg:px-8 border-t border-neutral-200 dark:border-[#272727] pt-16">
        <div className="grid gap-5 md:grid-cols-3 mb-16">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-neutral-200 dark:border-[#272727] bg-white dark:bg-[#181818] p-6 shadow-sm">
              <p className="text-3xl font-black text-red-600 dark:text-red-500">{stat.value}</p>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <p className="text-sm font-semibold tracking-[0.2em] text-red-600 dark:text-red-500 uppercase">{featureSection.eyebrow}</p>
          <h2
            className="mt-3 text-3xl font-bold text-neutral-900 dark:text-white md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {featureSection.title}
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map(({ icon, title, description }) => {
            const Icon = iconMap[icon] ?? PlayCircle;
            return (
              <div key={title} className="rounded-2xl border border-neutral-200 dark:border-[#272727] bg-white dark:bg-[#181818] p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">{description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* History Drawer Modal */}
      <ProjectHistory
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelectProject={handleSelectHistory}
        activeProjectId={activeProjectId}
      />
    </main>
  );
}
