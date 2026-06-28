import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Layout, PlayCircle, Code2, AlertTriangle, Sparkles, CheckCircle2 } from "lucide-react";

export default function ImageComparison() {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0 - 100)
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  return (
    <div className="w-full flex flex-col gap-4 select-none">
      <div className="flex justify-between items-center px-2">
        <span className="font-mono text-[10px] text-burnt-sienna tracking-widest uppercase">
          ◀ Blank Screen Block
        </span>
        <span className="font-mono text-[10px] text-green-500 tracking-widest uppercase">
          Catalyst Assisted Init ▶
        </span>
      </div>

      {/* Main Slider Canvas */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative w-full h-[360px] rounded-xl border border-cork-shadow/60 overflow-hidden bg-studio-black cursor-ew-resize"
      >
        {/* Underlay: The Assisted Start State (Right side) */}
        <div className="absolute inset-0 w-full h-full p-6 flex flex-col gap-4 justify-between bg-dark-cork/10">
          <div className="flex items-center justify-between border-b border-cork-shadow/40 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              <span className="font-mono text-[11px] text-warm-cream font-semibold">
                workspace.config.ts — Catalyst Auto-Init
              </span>
            </div>
            <span className="font-mono text-[10px] text-burnt-sienna bg-burnt-sienna/10 px-2 py-0.5 rounded-full">
              AI COMPILED
            </span>
          </div>

          <div className="flex-1 font-mono text-[11px] leading-relaxed text-warm-cream/90 flex flex-col gap-3 justify-center py-2">
            <p className="text-green-500/90 font-medium">
              ✦ Project Initialized with Vite & Tailwind CSS v4 template:
            </p>
            <div className="bg-studio-black/60 p-4 rounded-lg border border-cork-shadow/50 flex flex-col gap-2 font-mono">
              <span className="text-burnt-sienna">import &#123; createServer &#125; from "vite";</span>
              <span>
                <span className="text-[#8e857b]">export default async function</span>{" "}
                <span className="text-green-500">startApp()</span> &#123;
              </span>
              <span className="pl-4">
                <span className="text-[#8e857b]">const</span> app = await createServer(&#123;
              </span>
              <span className="pl-8 text-grey-brown">// 15min Time Sprint Slices configured:</span>
              <span className="pl-8">sprints: ["Outline Layout", "Integrate Theme", "Compile Build"]</span>
              <span className="pl-4">&#125;);</span>
              <span>&#125;</span>
            </div>
            <div className="flex items-center gap-2 text-grey-brown text-[10px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span>Basic file scaffolding & folder architecture generated instantly.</span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-green-500/5 border border-green-500/20 px-3 py-2 rounded-lg">
            <Sparkles className="w-4 h-4 text-green-500" />
            <span className="font-sans text-[11px] text-green-500/90">
              No blank screen staring. You are 100% ready to code.
            </span>
          </div>
        </div>

        {/* Overlay: The Staring State (Left side, clipped) */}
        <div
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
          className="absolute inset-0 w-full h-full p-6 flex flex-col gap-4 justify-between bg-studio-black pointer-events-none select-none z-10"
        >
          <div className="flex items-center justify-between border-b border-cork-shadow/40 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-grey-brown rounded-full" />
              <span className="font-mono text-[11px] text-grey-brown">
                untitled.txt — Empty Document
              </span>
            </div>
            <span className="font-mono text-[10px] text-grey-brown bg-cork-shadow/20 px-2 py-0.5 rounded-full">
              STUCK
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center bg-cork-shadow/10 rounded-full border border-cork-shadow/40">
              <AlertTriangle className="w-5 h-5 text-grey-brown animate-bounce" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-sans font-medium text-[13px] text-warm-cream/90">
                Staring at a Blank Screen
              </h4>
              <p className="font-mono text-[11px] text-grey-brown max-w-xs mx-auto">
                Spent 45 minutes thinking: "How do I even write the first line of code?"
              </p>
            </div>
            <div className="font-mono text-grey-brown text-[14px] mt-4 flex items-center gap-1">
              <span className="w-2.5 h-4 bg-burnt-sienna/80 animate-[ping_1s_infinite]" />
              <span className="text-xs text-grey-brown/40">Waiting...</span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-cork-shadow/10 border border-cork-shadow/20 px-3 py-2 rounded-lg">
            <span className="font-sans text-[11px] text-grey-brown">
              Average loss of productivity: 67% before initiating tasks.
            </span>
          </div>
        </div>

        {/* The Dragging Slider Bar Handle */}
        <div
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
          style={{ left: `${sliderPosition}%` }}
          className="absolute top-0 bottom-0 w-1 bg-burnt-sienna/80 cursor-ew-resize z-20 flex items-center justify-center"
        >
          <div className="absolute w-8 h-8 bg-studio-black border border-burnt-sienna rounded-full flex items-center justify-center shadow-lg active:scale-110 transition-transform">
            <Layout className="w-3.5 h-3.5 text-burnt-sienna" />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center px-1">
        <p className="font-sans text-[11px] text-grey-brown">
          💡 Slide or drag the handle to inspect Oryzo's automatic project-starting boost.
        </p>
        <button
          onClick={() => {
            // Animating slider back and forth for demonstration
            let val = 50;
            const interval = setInterval(() => {
              val = val === 50 ? 20 : val === 20 ? 80 : 50;
              setSliderPosition(val);
              if (val === 50) clearInterval(interval);
            }, 1000);
          }}
          className="font-mono text-[10px] text-burnt-sienna hover:underline cursor-pointer"
        >
          DEMO SLIDE
        </button>
      </div>
    </div>
  );
}
