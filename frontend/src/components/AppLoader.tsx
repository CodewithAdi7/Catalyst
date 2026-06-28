import React from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

interface AppLoaderProps {
  theme?: "dark" | "light";
}

export default function AppLoader({ theme = "dark" }: AppLoaderProps) {
  const isLight = theme === "light";

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-colors duration-500 ${
      isLight ? "bg-[#CCD0CF] text-studio-black" : "bg-studio-black text-warm-cream"
    }`}>
      {/* Luma Spin Loader */}
      <div className="relative w-[65px] aspect-square">
        <span className={`absolute rounded-[50px] animate-loaderAnim shadow-[inset_0_0_0_3.5px] ${
          isLight ? "shadow-[#11212D]" : "shadow-warm-cream"
        }`} />
        <span className={`absolute rounded-[50px] animate-loaderAnim animation-delay shadow-[inset_0_0_0_3.5px] ${
          isLight ? "shadow-[#11212D]" : "shadow-warm-cream"
        }`} />
        
        {/* Style tag inject for the keyframes physics */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes loaderAnim {
            0% {
              inset: 0 35px 35px 0;
            }
            12.5% {
              inset: 0 35px 0 0;
            }
            25% {
              inset: 35px 35px 0 0;
            }
            37.5% {
              inset: 35px 0 0 0;
            }
            50% {
              inset: 35px 0 0 35px;
            }
            62.5% {
              inset: 0 0 0 35px;
            }
            75% {
              inset: 0 0 35px 35px;
            }
            87.5% {
              inset: 0 0 35px 0;
            }
            100% {
              inset: 0 35px 35px 0;
            }
          }
          .animate-loaderAnim {
            animation: loaderAnim 2.4s infinite cubic-bezier(0.25, 1, 0.5, 1);
          }
          .animation-delay {
            animation-delay: -1.2s;
          }
        `}} />
      </div>

      {/* Loading telemetry status */}
      <div className="mt-8 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4.5 h-4.5 text-burnt-sienna animate-pulse" />
          <span className="font-sans font-bold tracking-widest text-sm uppercase">
            CATALYST
          </span>
        </div>
        <span className="font-mono text-[9px] tracking-widest text-grey-brown uppercase animate-pulse">
          ALLOCATING WORKSPACE ENGINE...
        </span>
      </div>
    </div>
  );
}
