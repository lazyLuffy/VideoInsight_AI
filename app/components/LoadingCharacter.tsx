'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Film, Radio, Cpu } from 'lucide-react';

interface LoadingCharacterProps {
  preset?: string;
}

const STEPS = [
  { icon: Radio, text: 'Connecting to video stream & audio track...' },
  { icon: Film, text: 'Subsampling keyframes at 0.2 FPS (1 frame / 5s)...' },
  { icon: Cpu, text: 'Gemini 3.6 Flash analyzing multimodal context...' },
  { icon: Brain, text: 'Extracting key topics, timestamps & takeaways...' },
  { icon: Sparkles, text: 'Crafting your structured notes & study guide...' },
];

export default function LoadingCharacter({ preset }: LoadingCharacterProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(12);

  // Cycle through dynamic steps every 2.6 seconds
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 2600);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92;
        return prev + Math.floor(Math.random() * 4) + 2;
      });
    }, 400);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const CurrentStepIcon = STEPS[stepIndex].icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Robot Mascot Container */}
      <div className="relative mb-6">
        {/* Ambient Red Aura Glow */}
        <div className="absolute inset-0 rounded-full bg-red-600/15 dark:bg-red-600/25 blur-2xl animate-pulse" />

        {/* Orbiting Ring */}
        <div className="absolute -inset-4 rounded-full border border-dashed border-red-500/30 dark:border-red-500/40 animate-[spin_10s_linear_infinite]" />

        {/* Floating Robot Character */}
        <div className="relative flex flex-col items-center animate-float">
          {/* Antenna */}
          <div className="flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-red-600 shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-ping" />
            <div className="h-4 w-1 bg-neutral-400 dark:bg-neutral-600 rounded-full" />
          </div>

          {/* Robot Head */}
          <div className="relative flex h-24 w-28 items-center justify-center rounded-3xl border-2 border-neutral-300 dark:border-[#383838] bg-linear-to-b from-neutral-100 to-neutral-200 dark:from-[#242424] dark:to-[#181818] shadow-xl">
            {/* Left Ear Phone */}
            <div className="absolute -left-2.5 h-8 w-2.5 rounded-l-md bg-red-600" />
            {/* Right Ear Phone */}
            <div className="absolute -right-2.5 h-8 w-2.5 rounded-r-md bg-red-600" />

            {/* Dark Digital Visor / Screen */}
            <div className="relative flex h-14 w-20 items-center justify-center rounded-2xl bg-neutral-950 p-2 shadow-inner overflow-hidden border border-neutral-800">
              {/* Subtle Scanline Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-25 pointer-events-none" />

              {/* Expressive Glowing Eyes */}
              <div className="flex items-center gap-3">
                <div className="h-3.5 w-3.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)] animate-[pulse_1.5s_ease-in-out_infinite]" />
                <div className="h-3.5 w-3.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)] animate-[pulse_1.5s_ease-in-out_infinite]" />
              </div>

              {/* Laser Scanning Beam Effect */}
              <div className="absolute inset-x-0 h-0.5 bg-cyan-300/80 shadow-[0_0_8px_#22d3ee] animate-[bounce_1.8s_ease-in-out_infinite]" />
            </div>
          </div>

          {/* Audio / Neural Equalizer Bars below head */}
          <div className="mt-3 flex items-center gap-1">
            <span className="h-2 w-1 rounded-full bg-red-500 animate-[pulse_0.6s_ease-in-out_infinite]" />
            <span className="h-4 w-1 rounded-full bg-red-500 animate-[pulse_0.8s_ease-in-out_infinite_0.1s]" />
            <span className="h-3 w-1 rounded-full bg-red-600 animate-[pulse_0.7s_ease-in-out_infinite_0.2s]" />
            <span className="h-5 w-1 rounded-full bg-red-500 animate-[pulse_0.9s_ease-in-out_infinite_0.3s]" />
            <span className="h-2 w-1 rounded-full bg-red-500 animate-[pulse_0.6s_ease-in-out_infinite_0.4s]" />
          </div>
        </div>
      </div>

      {/* Main Title */}
      <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
        <span>Insight Bot is Analyzing</span>
        {preset && (
          <span className="rounded-full bg-red-100 dark:bg-red-950/60 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400 capitalize">
            {preset}
          </span>
        )}
      </h3>

      {/* Rotating Dynamic Step */}
      <div className="mt-2.5 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300 transition-all duration-300 min-h-[24px]">
        <CurrentStepIcon className="h-4 w-4 text-red-600 dark:text-red-500 animate-spin-slow shrink-0" />
        <span className="font-medium animate-in fade-in duration-200">
          {STEPS[stepIndex].text}
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="mt-6 w-full max-w-md">
        <div className="flex justify-between items-center text-xs text-neutral-400 mb-1.5 font-mono">
          <span>Processing pipeline</span>
          <span className="text-red-600 dark:text-red-400 font-bold">{progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full bg-linear-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-300 relative"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer light across bar */}
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-neutral-400 dark:text-neutral-500 max-w-sm">
        Longer videos may take 10–20 seconds to subsample and process. Thanks for your patience!
      </p>
    </div>
  );
}
