import { Sun, Moon } from "lucide-react";
import { motion } from "motion/react";

interface ThemeTogglerProps {
  theme: "dark" | "light";
  onToggle: () => void;
}

export default function ThemeToggler({ theme, onToggle }: ThemeTogglerProps) {
  const isDark = theme === "dark";

  return (
    <button
      id="theme-toggler-btn"
      onClick={onToggle}
      className="relative flex items-center justify-center w-10 h-10 rounded-full border border-warm-cream/20 bg-studio-black/40 hover:border-burnt-sienna/60 hover:bg-dark-cork/20 transition-all duration-300 overflow-hidden cursor-pointer group"
      aria-label="Toggle theme"
    >
      <motion.div
        animate={{
          rotate: isDark ? 0 : 180,
          scale: isDark ? 1 : 0.8,
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 flex items-center justify-center text-warm-cream dark:text-warm-cream light:text-studio-black"
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-burnt-sienna group-hover:text-warm-cream transition-colors duration-300" />
        ) : (
          <Moon className="w-5 h-5 text-studio-black group-hover:text-burnt-sienna transition-colors duration-300" />
        )}
      </motion.div>
    </button>
  );
}
