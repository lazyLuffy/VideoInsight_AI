'use client';

import { useEffect, useRef } from 'react';
import { ExternalLink, Video } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  seekTime: number | null;
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function VideoPlayer({ url, seekTime }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoId = extractYouTubeId(url);

  // When seekTime changes, send postMessage to YouTube iframe API
  useEffect(() => {
    if (seekTime === null || !videoId) return;

    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'seekTo',
          args: [seekTime, true],
        }),
        '*'
      );
    }
  }, [seekTime, videoId]);

  if (!videoId) return null;

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1`;

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-[#272727] bg-neutral-900 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 dark:bg-[#181818] border-b border-neutral-800 text-xs text-neutral-300">
        <span className="flex items-center gap-1.5 font-medium">
          <Video className="h-3.5 w-3.5 text-red-500" />
          Synchronized Video Player
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-neutral-400 hover:text-red-400 transition"
        >
          Open in YouTube <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <div className="relative aspect-video w-full bg-black">
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title="YouTube Video Player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    </div>
  );
}
