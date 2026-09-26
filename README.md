# ⚡ VideoInsight AI

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Google Gemini](https://img.shields.io/badge/Gemini_API-3.6_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<p align="center">
  <strong>Transform YouTube videos, recorded lectures, and documents into structured, synchronized study guides, executive briefs, and interactive notes in seconds.</strong>
</p>

[Key Features](#-key-features) •
[Architecture](#-architecture--data-flow) •
[Quick Start](#-quick-start) •
[Presets](#-note-style-presets) •
[Resilience & Engineering](#-resilience--engineering-highlights) •
[Project Structure](#-project-structure)

---

</div>

## 🌟 Overview

**VideoInsight AI** is an intelligent multimodal knowledge extraction engine. By combining Google's latest **Gemini 3.6 Flash** models with Next.js App Router and interactive client components, VideoInsight AI digests hours of video content or uploaded documents and translates them into high-signal Markdown notes, practice quizzes, and executive summaries.

Every generated note features **synchronized clickable timestamps (`[MM:SS]`)** that jump directly to key video moments, alongside an interactive **Chat with Video** assistant for real-time Q&A.

---

## ✨ Key Features

### 🧠 Multimodal AI Synthesis
- **YouTube Link Ingestion**: Direct multimodal analysis of YouTube videos without requiring manual transcript downloads.
- **File Upload Support**: Accepts uploaded videos (`.mp4`, `.mov`, `.webm`), documents (`.pdf`), and text files up to 20 MB.
- **State-of-the-Art Model**: Defaulted to Google's **Gemini 3.6 Flash**, engineered for high-throughput multimodal comprehension and razor-sharp timestamp precision.

### ⏱️ Synchronized Interactive Video Player
- Notes embed formatted timestamp badges (e.g., `[04:12]`).
- Clicking any timestamp immediately commands the embedded YouTube player to seek to that exact second via iframe `postMessage` synchronization.

### 🎯 4 Cognitive Note Presets
Tailor knowledge extraction to your immediate objective:
1. **Comprehensive Breakdown**: Full curriculum structure, key takeaways, timestamped topic analysis, and tactical action items.
2. **Study Guide & Quiz**: Conceptual definitions, timeline breakdown, and an active-recall **5-question practice quiz** with explanations.
3. **Executive Brief**: High-impact TL;DR, core strategic takeaways, key metrics & numbers, and executive next steps.
4. **Quick Bullets**: A 60-second snapshot with high-signal, zero-fluff takeaways.

### 🤖 "Chat with Video" Assistant
- Embedded slide-down conversational drawer grounded in your video source and generated notes.
- Quick prompt chips (*"💡 Quiz me on 3 key points"*, *"🔍 Explain the most complex concept"*, *"📋 Implementation checklist"*).
- Supports interactive timestamp jumping within AI responses.

### 📚 Project History & Persistence
- Automatically archives generated notes to client-side `localStorage`.
- Full-text search across titles, source links, and note contents.
- Instant reload, individual deletion, and history clearing without needing an external database.

### 🎨 YouTube-Inspired Theme & Theme Management
- **YouTube Design Language**: Signature YouTube Red (`#FF0000`/`#DC2626`) accents, authentic YouTube Dark mode (`#0F0F0F` canvas, `#181818` surfaces), and pill-shaped chip filters.
- **Theme Switcher**: Instant switching between **Light ☀️**, **Dark 🌙**, and **System 💻** modes with `localStorage` persistence.
- **Zero FOUC**: Injects an anti-flash script in `<head>` ensuring dark theme loads instantaneously on page reload without visual flicker.

---

## 🏗️ Architecture & Data Flow

```mermaid
flowchart TD
    subgraph Client ["Client Browser (Next.js 16 + React 19)"]
        UI["Main Workspace UI\n(app/page.tsx)"]
        Player["Synchronized YouTube Player\n(VideoPlayer.tsx)"]
        Viewer["Markdown & Timestamp Engine\n(MarkdownViewer.tsx)"]
        Chat["Chat Assistant\n(ChatAssistant.tsx)"]
        History["Project History\n(ProjectHistory.tsx)"]
    end

    subgraph Server ["Next.js App Router (Node.js Runtime)"]
        GenRoute["/api/generate-notes\n- FPS Subsampling (0.2 -> 0.05)\n- Model Fallback & Backoff"]
        ChatRoute["/api/chat-notes\n- System Context Grounding\n- 503 Fallback & Retry"]
    end

    subgraph Gemini ["Google Gemini API"]
        G36["gemini-3.6-flash (Primary)"]
        G38["gemini-3.8-flash (Fallback)"]
    end

    UI -->|YouTube URL or Uploaded File| GenRoute
    GenRoute -->|1 frame / 5 sec| G36
    G36 -.->|503 High Demand| G38
    GenRoute -->|Generated Notes + Title| UI
    UI --> Viewer
    UI --> Player
    UI --> History
    Viewer -->|Click Timestamp [MM:SS]| Player
    UI -->|Follow-up Questions| ChatRoute
    ChatRoute --> G36
    ChatRoute -->|Streamed Answer| Chat
```

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18.18.0 or higher
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A Google Gemini API Key (free tier available at [Google AI Studio](https://aistudio.google.com/app/apikey))

### 1. Clone the Repository
```bash
git clone https://github.com/lazyLuffy/VideoInsight_AI.git
cd VideoInsight_AI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the project root:
```bash
cp .env.example .env.local
```

Add your Gemini API key:
```env
# Google Gemini API Configuration
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Model Selection (defaults to gemini-3.6-flash)
GEMINI_MODEL=gemini-3.6-flash
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## ⚙️ Configuration & Environment Variables

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `GEMINI_API_KEY` | **Yes** | — | Your Google Gemini API key from AI Studio. |
| `GEMINI_MODEL` | No | `gemini-3.6-flash` | Primary Gemini model for notes & chat. |
| `GEMINI_FALLBACK_MODEL` | No | `gemini-3.8-flash` | Fallback model used automatically if the primary encounters 503 high demand. |

---

## 🛡️ Resilience & Engineering Highlights

### 1. Video Token Optimization (FPS Subsampling)
Full 1.0 FPS video ingestion quickly saturates Gemini's 1-million-token context on videos longer than 45 minutes. VideoInsight AI configures:
```typescript
videoMetadata: { fps: 0.2 } // 1 frame every 5 seconds (80% token reduction)
```
If a video exceeds token limits, the engine automatically catches the error and retries at `fps: 0.05` (1 frame every 20s), enabling digestion of multi-hour seminars.

### 2. High Demand (503 UNAVAILABLE) Automatic Model Fallback
During peak Google Cloud demand spikes, API calls can return `503 Model Unavailable`. VideoInsight AI implements automatic exponential backoff retry and automatically fails over from primary (`gemini-3.6-flash`) to fallback (`gemini-3.8-flash`) endpoints transparently to ensure uninterrupted user requests.

### 3. Print-Optimized CSS
Exporting to PDF uses browser-native `@media print` stylesheets that strip away buttons, headers, and video embeds, formatting typography with automatic page-break avoidance for clean documentation.

---

## 📁 Project Structure

```text
ai-video-notes-app/
├── app/
│   ├── api/
│   │   ├── chat-notes/
│   │   │   └── route.ts          # Interactive Q&A endpoint with context grounding
│   │   └── generate-notes/
│   │       └── route.ts          # Multimodal ingestion, FPS downsampling & presets
│   ├── components/
│   │   ├── ChatAssistant.tsx     # Floating Q&A drawer with suggestion chips
│   │   ├── MarkdownViewer.tsx    # Custom parser with interactive timestamp badges
│   │   ├── ProjectHistory.tsx    # Slide-out drawer with search & local storage
│   │   ├── ThemeProvider.tsx     # React 19 external store theme context
│   │   ├── ThemeToggle.tsx       # YouTube-styled theme selector dropdown
│   │   └── VideoPlayer.tsx       # YouTube iframe with postMessage seek sync
│   ├── globals.css               # Tailwind CSS v4, custom scrollbars & print styling
│   ├── layout.tsx                # App shell, fonts (Jakarta Sans, Cormorant) & metadata
│   └── page.tsx                  # Main workspace orchestrator & preset controls
├── data/
│   └── site-content.json         # Lean static metadata (hero text, badges, stats)
├── public/                       # Static SVGs and branding assets
├── .env.example                  # Documented environment template
├── .gitignore                    # Secrets & build artifact protection
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # Strict TypeScript configuration
└── README.md                     # Project documentation
```

---

## 💡 Usage Guide

1. **Paste a Link or Upload**: Enter any public YouTube URL or select a video/PDF/document.
2. **Choose a Preset**: Click *Comprehensive*, *Study Guide & Quiz*, *Executive Brief*, or *Quick Bullets*.
3. **Generate**: Click **Generate AI Notes**. The system extracts the core knowledge within seconds.
4. **Interact**:
   - Click any timestamp badge (`[02:15]`) to jump the video to that moment.
   - Expand the **Chat with Video** drawer to test your understanding or ask follow-ups.
5. **Save & Export**: Download the raw `.md` file, copy to clipboard, or export to PDF via the print dialog.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
