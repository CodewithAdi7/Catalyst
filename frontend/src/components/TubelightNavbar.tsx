import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import ThemeToggler from "./ThemeToggler";

interface NavItem {
  name: string;
  id: string;
}

interface TubelightNavbarProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onLaunchApp: () => void;
  onSignIn: () => void;
  isAppLaunched: boolean;
  onBackToLanding: () => void;
}

export default function TubelightNavbar({
  theme,
  onToggleTheme,
  onLaunchApp,
  onSignIn,
  isAppLaunched,
  onBackToLanding,
}: TubelightNavbarProps) {
  const items: NavItem[] = [
    { name: "INTRO", id: "intro" },
    { name: "FEATURES", id: "features" },
    { name: "PRODUCT", id: "product" },
    { name: "CONTACT", id: "contact" },
  ];

  const [activeTab, setActiveTab] = useState("intro");

  // Track active section on scroll
  useEffect(() => {
    if (isAppLaunched) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveTab(item.id);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAppLaunched]);

  const handleNavClick = (id: string) => {
    if (isAppLaunched) {
      onBackToLanding();
      // Wait for state transition, then scroll
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header
      id="main-header"
      className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl z-50 flex items-center justify-between px-6 py-3 rounded-full border border-cork-shadow/60 backdrop-blur-md bg-studio-black/40 gap-4 md:gap-8 transition-all duration-300 shadow-2xl"
    >
      {/* Left: Brand Logo */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={onBackToLanding}>
        <motion.div
          initial={{ rotate: -15, scale: 0.9 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-burnt-sienna text-warm-cream"
        >
          <Sparkles className="w-4 h-4" />
        </motion.div>
        <div className="flex flex-col">
          <span className="font-sans font-semibold tracking-wider text-sm text-warm-cream dark:text-warm-cream light:text-studio-black">
            CATALYST
          </span>
          <span className="font-mono text-[8px] tracking-widest text-burnt-sienna uppercase">
            Start Swiftly
          </span>
        </div>
      </div>

      {/* Center: Tubelight Nav Tabs (Hidden in App Mode for cleaner workspace) */}
      {!isAppLaunched ? (
        <nav className="hidden md:flex items-center gap-1 bg-dark-cork/10 p-1.5 rounded-full border border-cork-shadow/40 relative">
          {items.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-4 py-2 font-mono text-[11px] tracking-wider rounded-full cursor-pointer transition-all duration-300 ${
                  isActive
                    ? "text-burnt-sienna font-medium"
                    : "text-grey-brown hover:text-warm-cream"
                }`}
              >
                {/* Active slider background pill */}
                {isActive && (
                  <motion.div
                    layoutId="active-nav-pill"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className="absolute inset-0 bg-warm-cream/5 rounded-full border border-warm-cream/10 flex items-end justify-center"
                  >
                    {/* Glowing tubelight line at the bottom */}
                    <div className="w-6 h-[2px] bg-burnt-sienna rounded-full shadow-[0_0_8px_#dc5000]" />
                  </motion.div>
                )}
                <span className="relative z-10">{item.name}</span>
              </button>
            );
          })}
        </nav>
      ) : (
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-burnt-sienna/10 border border-burnt-sienna/20 rounded-full">
          <span className="w-1.5 h-1.5 bg-burnt-sienna rounded-full animate-pulse" />
          <span className="font-mono text-[10px] text-burnt-sienna font-medium tracking-widest">
            CATALYST ACTIVE WORKSPACE
          </span>
        </div>
      )}

      {/* Right: Theme Toggle, Sign In, Launch App */}
      <div className="flex items-center gap-4">
        {/* Animated Theme Toggler */}
        <ThemeToggler theme={theme} onToggle={onToggleTheme} />

        {/* Sign In (Ghost Pill Button) */}
        {!isAppLaunched && (
          <button
            id="signin-btn"
            onClick={onSignIn}
            className="hidden sm:inline-block px-4 py-2 text-[12px] font-medium tracking-wider text-warm-cream dark:text-warm-cream light:text-studio-black hover:text-burnt-sienna border border-transparent hover:border-warm-cream/20 rounded-full transition-all duration-300 cursor-pointer"
          >
            SIGN IN
          </button>
        )}

        {/* Launch App (Dark Cork Filled / Burnt Sienna Pill Button) */}
        {isAppLaunched ? (
          <button
            id="back-landing-btn"
            onClick={onBackToLanding}
            className="px-5 py-2.5 text-[11px] font-semibold tracking-wider text-warm-cream bg-dark-cork border border-warm-cream/20 hover:border-burnt-sienna rounded-[36px] transition-all duration-300 cursor-pointer shadow-lg"
          >
            BACK TO INFO
          </button>
        ) : (
          <button
            id="launch-app-btn"
            onClick={onLaunchApp}
            className="px-5 py-2.5 text-[11px] font-semibold tracking-wider text-studio-black bg-warm-cream hover:bg-burnt-sienna hover:text-warm-cream rounded-[36px] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-burnt-sienna/20"
          >
            LAUNCH APP
          </button>
        )}
      </div>
    </header>
  );
}
