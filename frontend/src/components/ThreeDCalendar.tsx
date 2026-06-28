import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Calendar, CheckCircle2, Circle, Flame, Sparkles, Clock } from "lucide-react";

export default function ThreeDCalendar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(15);

  const { scrollYProgress } = useScroll();

  // Scroll animations: tilt the calendar in 3D, shift slightly on scale & floating path
  const scrollRotateX = useTransform(scrollYProgress, [0, 0.5, 1], [0, 12, -8]);
  const scrollRotateY = useTransform(scrollYProgress, [0, 0.5, 1], [0, 20, 5]);
  const scrollScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.94, 1.03]);
  const scrollYPos = useTransform(scrollYProgress, [0, 0.5, 1], [0, 50, -50]);
  const scrollXPos = useTransform(scrollYProgress, [0, 0.5, 1], [0, -25, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const card = containerRef.current;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;

    // Map to tilt degree (e.g., max 15 degrees tilt)
    setRotateX(-y / (box.height / 30));
    setRotateY(x / (box.width / 30));
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  // Simulated days of the month (e.g., June 2026)
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  // Highlighting days with sprints/milestones
  const sprintDays = [4, 12, 15, 23, 28];
  const completedDays = [4, 12];

  // Milestone details
  const milestones: Record<number, { task: string; sprints: string[]; status: string }> = {
    15: {
      task: "Launch Catalyst",
      sprints: ["Draft hero layout", "Design 3D calendar widget", "Code sprint stopwatch"],
      status: "Deadline in 2 hours - AI Sprint Ready",
    },
    23: {
      task: "Dribbble Portfolio Layout",
      sprints: ["Outline showcase grid", "Select high-contrast palettes", "Render cork materials"],
      status: "Due June 23 - Starts in 5 days",
    },
    28: {
      task: "Express API Refactoring",
      sprints: ["Audit file imports", "Integrate esbuild bundles", "Mount route health checks"],
      status: "Due June 28 - Starts in 10 days",
    },
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 select-none">
      {/* 3D Perspective Card Wrapper */}
      <motion.div
        style={{ 
          perspective: 1200,
          rotateX: scrollRotateX,
          rotateY: scrollRotateY,
          scale: scrollScale,
          y: scrollYPos,
          x: scrollXPos,
          transformStyle: "preserve-3d"
        }}
        className="w-full max-w-sm flex items-center justify-center cursor-pointer"
      >
        <motion.div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          animate={{
            rotateX: isHovered ? rotateX : 0,
            rotateY: isHovered ? rotateY : 0,
            scale: isHovered ? 1.03 : 1,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-80 rounded-2xl bg-studio-black border border-warm-cream/20 shadow-2xl p-6 flex flex-col gap-4 overflow-visible"
        >
          {/* Depth Layer: Floating AI Suggestion Overlay Chip from Immersive UI mockup */}
          <div
            style={{ transform: "translateZ(55px) rotate(12deg)" }}
            className="absolute -top-8 -right-14 w-48 bg-dark-cork border border-warm-cream/30 rounded-xl p-3.5 shadow-2xl flex flex-col justify-center pointer-events-none"
          >
            <div className="text-[9px] text-grey-brown font-mono uppercase tracking-widest mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-burnt-sienna rounded-full animate-pulse" />
              AI SUGGESTION
            </div>
            <div className="text-[11px] leading-tight text-warm-cream">
              "Start with a 3-point outline for Section A..."
            </div>
          </div>

          {/* Depth Layer: Cork Ambient Backing Grid (translateZ) */}
          <div
            style={{ transform: "translateZ(-10px)" }}
            className="absolute inset-0 rounded-2xl bg-[#11212D]/10 border border-[#11212D]/30 pointer-events-none"
          />

          {/* Depth Layer: Interactive Headers */}
          <div style={{ transform: "translateZ(20px)" }} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-burnt-sienna" />
              <span className="font-mono text-[10px] tracking-widest text-grey-brown">
                JUNE 2026
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-burnt-sienna/30 bg-burnt-sienna/5">
              <span className="w-1 h-1 bg-burnt-sienna rounded-full animate-ping" />
              <span className="font-mono text-[8px] text-burnt-sienna tracking-wider">
                TIME SPRINT ENABLED
              </span>
            </div>
          </div>

          {/* Depth Layer: Calendar Matrix */}
          <div
            style={{ transform: "translateZ(30px)" }}
            className="grid grid-cols-7 gap-2 text-center"
          >
            {/* Weekdays */}
            {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
              <span key={idx} className="font-mono text-[9px] text-grey-brown font-semibold">
                {d}
              </span>
            ))}

            {/* Calendar Days */}
            {days.map((day) => {
              const isSprint = sprintDays.includes(day);
              const isCompleted = completedDays.includes(day);
              const isSelected = selectedDay === day;

              let dayStyle = "text-warm-cream/50";
              if (isSprint) {
                dayStyle = "text-burnt-sienna font-bold";
              }
              if (isCompleted) {
                dayStyle = "text-green-500/80 line-through";
              }
              if (isSelected) {
                dayStyle = "bg-burnt-sienna text-warm-cream border border-warm-cream/40 rounded-lg scale-110";
              }

              return (
                <button
                  key={day}
                  onClick={() => isSprint && setSelectedDay(day)}
                  className={`relative h-8 w-8 flex items-center justify-center text-[11px] font-mono rounded-md hover:bg-dark-cork/20 transition-all duration-200 cursor-pointer ${dayStyle}`}
                >
                  {day}
                  {isSprint && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 bg-burnt-sienna rounded-full" />
                  )}
                  {isCompleted && (
                    <span className="absolute bottom-1 w-1 h-1 bg-green-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-cork-shadow/60 my-1" />

          {/* Floating Details Panel (translateZ(45px)) */}
          <div
            style={{ transform: "translateZ(45px)" }}
            className="relative bg-dark-cork/30 border border-cork-shadow p-3.5 rounded-xl flex flex-col gap-2.5 shadow-xl transition-all duration-300"
          >
            {selectedDay && milestones[selectedDay] ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-burnt-sienna">
                    <Flame className="w-3.5 h-3.5 animate-pulse" />
                    <span className="font-sans font-semibold text-[11px] tracking-wide">
                      {milestones[selectedDay].task}
                    </span>
                  </div>
                  <span className="font-mono text-[8px] text-burnt-sienna uppercase tracking-widest">
                    SPRINT ATTACK
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {milestones[selectedDay].sprints.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-grey-brown" />
                      <span className="font-mono text-[9px] text-warm-cream/80">
                        {idx * 15}:00 - {s}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="font-mono text-[8px] text-grey-brown text-right italic">
                  {milestones[selectedDay].status}
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <Sparkles className="w-5 h-5 text-grey-brown/50 mb-1" />
                <p className="font-sans text-[11px] text-grey-brown">
                  Click on an orange deadline day to reveal its 15min Sprints
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
      <p className="font-mono text-[10px] text-grey-brown/60 mt-4 tracking-widest uppercase">
        ▲ Cursor Interactive 3D Cork Object
      </p>
    </div>
  );
}
