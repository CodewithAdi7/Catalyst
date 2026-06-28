import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "motion/react";
import {
  ChevronDown,
  Sparkles,
  Flame,
  Mail,
  ArrowRight,
  Play,
  X,
  Clock,
  Calendar,
  Layers,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

import ShapeHeroBackground from "./components/ShapeHeroBackground";
import TubelightNavbar from "./components/TubelightNavbar";
import ThreeDCalendar from "./components/ThreeDCalendar";
import ImageComparison from "./components/ImageComparison";
import OryzoApp from "./components/OryzoApp";
import SignInModal from "./components/SignInModal";
import AppLoader from "./components/AppLoader";

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [isLoading, setIsLoading] = useState(true);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isAppLaunched, setIsAppLaunched] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [isWaitlisted, setIsWaitlisted] = useState(false);

  // Scroll animations hooks and mappings
  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Parallax mappings for Hero
  const heroY = useTransform(scrollY, [0, 800], [0, 180]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const bgShapesY = useTransform(scrollY, [0, 1000], [0, 250]);
  const calendarY = useTransform(scrollY, [0, 800], [0, -60]);

  // Floating effects/Parallax for Cards
  const featuresCardY = useTransform(scrollY, [200, 1200], [40, -40]);
  const productCardY = useTransform(scrollY, [1000, 2200], [50, -50]);

  // Toggle theme class on document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLaunchApp = () => {
    setIsAppLaunched(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSignIn = () => {
    setIsSignInOpen(true);
  };

  const handleSignInSuccess = () => {
    setIsSignInOpen(false);
    setIsAppLaunched(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToLanding = () => {
    setIsAppLaunched(false);
  };

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setIsWaitlisted(true);
      setEmailInput("");
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-x-hidden ${theme === "light" ? "bg-[#CCD0CF] text-[#06141B]" : "bg-[#06141B] text-[#CCD0CF]"}`}>
      {/* Scroll Progress Indicator */}
      {!isAppLaunched && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-burnt-sienna origin-left z-[100]"
          style={{ scaleX }}
        />
      )}
      {/* App Loading screen */}
      {isLoading && <AppLoader theme={theme as any} />}

      {/* Sign In modal */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSuccess={handleSignInSuccess}
        theme={theme as any}
      />
      
      {/* Immersive Vertical Side Badge from Design HTML */}
      <div 
        className="fixed right-8 top-1/2 -translate-y-1/2 hidden lg:flex text-[10px] font-mono uppercase tracking-widest text-grey-brown opacity-50 select-none pointer-events-none z-50"
        style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}
      >
        PRODUCT_V_01 // INTEGRATED_AI_AGENT
      </div>

      {/* Tubelight Navbar */}
      <TubelightNavbar
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onLaunchApp={handleLaunchApp}
        onSignIn={handleSignIn}
        isAppLaunched={isAppLaunched}
        onBackToLanding={handleBackToLanding}
      />

      <AnimatePresence mode="wait">
        {isAppLaunched ? (
          <motion.div
            key="app-workspace"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <OryzoApp theme={theme} />
          </motion.div>
        ) : (
          <motion.div
            key="landing-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* SECTION 1: HERO SECTION */}
            <section
              id="intro"
              className="relative min-h-screen flex flex-col justify-between pt-24 pb-12 overflow-hidden"
            >
              {/* Shape Landing Hero Background with parallax scroll */}
              <motion.div style={{ y: bgShapesY, opacity: heroOpacity }} className="absolute inset-0 z-0">
                <ShapeHeroBackground theme={theme} />
              </motion.div>

              {/* Edge label - Vertical Rotated Label */}
              <div className="absolute right-4 md:right-8 top-1/3 origin-right rotate-90 translate-x-1/2 pointer-events-none select-none z-10">
                <span className="font-mono text-[9px] tracking-[0.3em] text-burnt-sienna uppercase">
                  MODEL: CATALYST-1 ENGINE
                </span>
              </div>

              {/* Hero Main Content */}
              <div className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 my-auto">
                {/* Left Side: Cinematic Headline with parallax */}
                <motion.div style={{ y: heroY, opacity: heroOpacity }} className="lg:col-span-7 flex flex-col gap-6 text-left">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col gap-1"
                  >
                    <span className="font-mono text-xs tracking-widest text-burnt-sienna font-semibold uppercase">
                      ✦ THE END OF BLANK SCREEN ANXIETY
                    </span>
                    <h1 className="font-sans font-medium text-[41px] sm:text-[51px] leading-[0.9] text-warm-cream dark:text-warm-cream light:text-studio-black tracking-tight max-w-xl">
                      DON'T JUST MEET DEADLINES.<br />
                      START SWIFTLY.
                    </h1>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="font-sans text-subheading text-grey-brown max-w-md leading-relaxed"
                  >
                    Catalyst is a physical and digital assistant that breaks your procrastination blocks. When a deadline looms, we don't just warn you—our AI builds your project's starting framework, scaffolding, and 15-minute milestones instantly.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-wrap gap-4 items-center"
                  >
                    {/* Primary Launch App Action */}
                    <button
                      id="hero-launch-btn"
                      onClick={handleLaunchApp}
                      className="px-6 py-3 bg-dark-cork text-warm-cream text-[13px] font-medium tracking-wider rounded-[36px] hover:bg-burnt-sienna border border-transparent transition-all duration-300 cursor-pointer shadow-lg"
                    >
                      INITIALIZE SWIFT STATE
                    </button>

                    {/* Secondary Ghost Button */}
                    <button
                      id="hero-explore-btn"
                      onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                      className="px-6 py-3 bg-transparent text-warm-cream dark:text-warm-cream light:text-studio-black hover:text-burnt-sienna border border-warm-cream/20 hover:border-burnt-sienna text-[13px] font-medium tracking-wider rounded-[22.5px] transition-all duration-300 cursor-pointer"
                    >
                      EXPLORE FEATURES
                    </button>
                  </motion.div>
                </motion.div>

                {/* Right Side: Interactive 3D Calendar Object with parallax */}
                <motion.div
                  style={{ y: calendarY, opacity: heroOpacity }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="lg:col-span-5 flex justify-center items-center"
                >
                  <ThreeDCalendar theme={theme} />
                </motion.div>
              </div>

              {/* Scroll Prompt & Corner Video Thumbnail */}
              <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-end z-10 relative mt-8">
                {/* Scroll Prompt */}
                <div className="flex flex-col items-center gap-1.5 mx-auto">
                  <span className="font-mono text-[9px] tracking-[0.25em] text-grey-brown uppercase">
                    SCROLL TO CONTINUE
                  </span>
                  <ChevronDown className="w-4 h-4 text-burnt-sienna animate-bounce" />
                </div>

                {/* Product Video Thumbnail / play chip */}
                <button
                  id="play-video-chip"
                  onClick={() => setIsVideoOpen(true)}
                  className="absolute bottom-0 right-6 md:right-12 flex items-center gap-2.5 p-2 pr-4 bg-dark-cork/40 hover:bg-[#11212D]/90 border border-warm-cream/10 hover:border-burnt-sienna rounded-xl transition-all duration-300 cursor-pointer shadow-xl max-w-xs group"
                >
                  <div className="w-10 h-10 bg-burnt-sienna/10 rounded-lg flex items-center justify-center text-burnt-sienna group-hover:bg-burnt-sienna group-hover:text-warm-cream transition-all duration-300">
                    <Play className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-mono text-[8px] tracking-widest text-burnt-sienna uppercase font-bold">
                      PLAY INTRO
                    </span>
                    <span className="font-sans text-[11px] text-warm-cream/90 font-medium">
                      See Catalyst in Action
                    </span>
                  </div>
                </button>
              </div>
            </section>

            {/* SECTION 2: FEATURES SECTION */}
            <section
              id="features"
              className="min-h-screen py-24 border-t border-dashed border-cork-shadow/60 flex flex-col justify-center"
            >
              <div className="w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left Side: Spatial Text with scroll animations */}
                <motion.div 
                  initial={{ opacity: 0, x: -45 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-120px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="lg:col-span-5 flex flex-col gap-6 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-burnt-sienna flex items-center justify-center text-[10px] font-mono font-bold text-burnt-sienna shrink-0">
                      01
                    </div>
                    <span className="font-mono text-xs tracking-widest uppercase text-grey-brown">
                      The Sprint Attack
                    </span>
                  </div>
                  <div className="overflow-hidden mb-1">
                    <motion.h2 
                      initial={{ y: "100%" }}
                      whileInView={{ y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="font-sans font-medium text-heading-lg leading-tight text-warm-cream dark:text-warm-cream light:text-studio-black"
                    >
                      ELIMINATE THE BLANK SCREEN SENSATION.
                    </motion.h2>
                  </div>
                  <p className="font-sans text-body text-grey-brown leading-relaxed">
                    Over 80% of task procrastination happens before the first line is written or the first block is drawn. When you stare at an empty canvas, the friction is highest.
                  </p>
                  <p className="font-sans text-body text-grey-brown leading-relaxed">
                    Catalyst's integrated AI understands the scope of your target task, automatically builds the scaffolding, outline structure, and templates, and presents you with a populated starting point instantly.
                  </p>
                  <div className="border-t border-dashed border-cork-shadow/60 pt-4 mt-2">
                     <h4 className="font-mono text-[11px] text-burnt-sienna tracking-widest uppercase mb-1">
                      INTELLIGENT INTEGRATION
                    </h4>
                    <p className="font-sans text-caption text-grey-brown">
                      No more writer's block or empty template anxiety. Launch straight into active execution mode.
                    </p>
                  </div>
                </motion.div>

                {/* Right Side: Image Comparison Slider with scroll animations */}
                <motion.div 
                  style={{ y: featuresCardY }}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-120px" }}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="lg:col-span-7"
                >
                  <ImageComparison />
                </motion.div>
              </div>
            </section>

            {/* SECTION 3: PRODUCT FEATURE SECTION */}
            <section
              id="product"
              className="min-h-screen py-24 border-t border-dashed border-cork-shadow/60 flex flex-col justify-center"
            >
              <div className="w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Left Side: Milestone list with scroll animations */}
                <motion.div 
                  style={{ y: productCardY }}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-120px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="lg:col-span-7 order-2 lg:order-1"
                >
                  <div className="p-6 rounded-2xl border border-cork-shadow/60 bg-studio-black/40 flex flex-col gap-5 relative">
                    <div className="absolute top-0 right-6 font-mono text-[8px] text-burnt-sienna bg-burnt-sienna/5 border border-burnt-sienna/20 px-2 py-0.5 rounded-full uppercase tracking-widest">
                      ACTIVE SPRINT Slices
                    </div>

                    <div className="flex items-center gap-3 border-b border-cork-shadow/40 pb-4">
                      <Clock className="w-5 h-5 text-burnt-sienna" />
                      <div>
                        <h4 className="font-sans font-semibold text-[14px] text-warm-cream">
                          SAMPLE 15MIN SPRINT ATTACK WORKFLOW
                        </h4>
                        <p className="font-mono text-caption text-grey-brown">
                          Project: Deploy Cloud Run Backend API
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-3 p-3.5 rounded-lg border border-green-500/20 bg-green-500/5 text-grey-brown">
                        <CheckCircle2 className="w-4.5 h-4.5 text-green-500 shrink-0" />
                        <div>
                          <span className="font-mono text-[10px] uppercase font-bold text-green-500/80">
                            SPRINT 1 (00:00 - 15:00) — COMPLETED
                          </span>
                          <p className="font-sans text-[12.5px] text-warm-cream/70 font-medium">
                            Create folder matrices, configure package.json and import express routes
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3.5 rounded-lg border border-burnt-sienna bg-burnt-sienna/5 text-warm-cream">
                        <div className="w-4.5 h-4.5 rounded-full border-2 border-burnt-sienna flex items-center justify-center shrink-0">
                          <div className="w-2 h-2 bg-burnt-sienna rounded-full animate-ping" />
                        </div>
                        <div>
                          <span className="font-mono text-[10px] uppercase font-bold text-burnt-sienna">
                            SPRINT 2 (15:00 - 30:00) — IN PROGRESS
                          </span>
                          <p className="font-sans text-[12.5px] font-medium">
                            Develop router endpoints and mock JSON output for task deadlines
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3.5 rounded-lg border border-cork-shadow/30 opacity-40 text-warm-cream/40">
                        <div className="w-4.5 h-4.5 rounded-full border border-cork-shadow/80 shrink-0" />
                        <div>
                          <span className="font-mono text-[10px] uppercase font-bold">
                            SPRINT 3 (30:00 - 45:00) — PENDING
                          </span>
                          <p className="font-sans text-[12.5px] font-medium">
                            Optimize esbuild bundler and write standalone script compilations
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Right Side: Sprint Attack Explanation with scroll animations */}
                <motion.div 
                  initial={{ opacity: 0, x: 45 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-120px" }}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="lg:col-span-5 order-1 lg:order-2 flex flex-col gap-6 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-warm-cream flex items-center justify-center text-[10px] font-mono font-bold text-warm-cream shrink-0">
                      02
                    </div>
                    <span className="font-mono text-xs tracking-widest uppercase text-grey-brown">
                      Passive Reminders
                    </span>
                  </div>
                  <div className="overflow-hidden mb-1">
                    <motion.h2 
                      initial={{ y: "100%" }}
                      whileInView={{ y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="font-sans font-medium text-heading-lg leading-tight text-warm-cream dark:text-warm-cream light:text-studio-black"
                    >
                      TIME SPRINT ATTACK METRICS.
                    </motion.h2>
                  </div>
                  <p className="font-sans text-body text-grey-brown leading-relaxed">
                    Long, unstructured deadlines create a feeling of infinite time, which amplifies anxiety and triggers procrastination. 
                  </p>
                  <p className="font-sans text-body text-grey-brown leading-relaxed">
                    Catalyst completely eliminates this cycle by slicing your looming project into 15-minute high-focus, single-task milestones. You complete tiny, bite-sized tasks consecutively. Suddenly, you've finished the whole project without the overwhelming weight of starting.
                  </p>
                  <div className="border-t border-dashed border-cork-shadow/60 pt-4 mt-2">
                    <h4 className="font-mono text-[11px] text-burnt-sienna tracking-widest uppercase mb-1">
                      THE 15-MINUTE ADVANTAGE
                    </h4>
                    <p className="font-sans text-caption text-grey-brown">
                      By reducing focus intervals to exactly 15 minutes, brain cognitive load decreases by up to 74%.
                    </p>
                  </div>
                </motion.div>

              </div>
            </section>

            {/* SECTION 4: CONTACT & WAITLIST SECTION */}
            <section
              id="contact"
              className="py-32 border-t border-dashed border-cork-shadow/60 flex flex-col justify-center items-center text-center bg-[#06141B]/20"
            >
                <motion.div 
                  initial={{ opacity: 0, y: 40, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-120px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-xl mx-auto px-6 flex flex-col gap-6"
                >
                  <div className="flex items-center gap-2 text-burnt-sienna justify-center">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    <span className="font-mono text-xs tracking-widest uppercase font-semibold">
                      JOIN THE LIST
                    </span>
                  </div>

                  <div className="overflow-hidden mb-1">
                    <motion.h2 
                      initial={{ y: "100%" }}
                      whileInView={{ y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="font-sans font-medium text-heading-lg md:text-[51px] leading-[0.9] text-warm-cream dark:text-warm-cream light:text-studio-black tracking-tight"
                    >
                      SECURE EARLY ACCESS.
                    </motion.h2>
                  </div>
                  
                  <p className="font-sans text-subheading text-grey-brown max-w-sm mx-auto">
                    Catalyst is currently rolling out. Sign up to lock in free lifetime workspace credentials and start swift immediately.
                  </p>

                  <AnimatePresence mode="wait">
                    {isWaitlisted ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-5 rounded-xl border border-green-500/20 bg-green-500/5 text-green-500 text-center flex flex-col items-center gap-2"
                      >
                        <CheckCircle2 className="w-6 h-6 text-green-500 animate-bounce" />
                        <div>
                          <span className="font-mono text-[10px] uppercase font-bold">
                            WAITLIST CONFIRMED — ACCESS LOCKED
                          </span>
                          <span className="font-sans text-[13px] font-medium block mt-1">
                            Your Catalyst workspace credentials will be compiled and delivered to your inbox shortly.
                          </span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.form
                        onSubmit={handleWaitlistSubmit}
                        className="flex flex-col sm:flex-row items-center gap-4 bg-dark-cork/20 border border-cork-shadow/80 rounded-2xl p-2 pl-4 max-w-md mx-auto w-full"
                      >
                        <div className="flex items-center gap-3 flex-1 w-full">
                          <Mail className="text-burnt-sienna w-5 h-5" />
                          <input
                            type="email"
                            required
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="Your professional email address"
                            className="flex-1 bg-transparent text-warm-cream font-sans text-body focus:outline-none placeholder:text-warm-cream/35"
                          />
                        </div>
                        <button
                          id="submit-waitlist-btn"
                          type="submit"
                          className="px-5 py-2.5 bg-warm-cream text-studio-black text-caption font-semibold tracking-wider rounded-[22.5px] hover:bg-burnt-sienna hover:text-warm-cream transition-all duration-300 cursor-pointer uppercase font-mono shrink-0"
                        >
                          LOCK ACCESS
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  <p className="font-mono text-[9px] text-grey-brown mt-4 uppercase tracking-widest">
                    🔒 No spam, zero trackings. Craftsmanship and privacy first.
                  </p>
                </motion.div>
            </section>

            {/* FOOTER */}
            <footer className="py-12 border-t border-dashed border-cork-shadow/60 bg-studio-black">
              <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
                
                {/* Left side credits */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-grey-brown tracking-widest uppercase">
                    © 2026 CATALYST STUDIOS INC.
                  </span>
                  <span className="text-cork-shadow">•</span>
                  <span className="font-mono text-[10px] text-grey-brown tracking-widest uppercase">
                    Zero Shadows Elevation
                  </span>
                </div>

                {/* Right side status */}
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-burnt-sienna rounded-full animate-ping" />
                  <span className="font-mono text-[10px] text-burnt-sienna tracking-widest uppercase">
                    Catalyst-1 System Online
                  </span>
                </div>

              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIDEO MODAL / OVERLAY */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-studio-black/95 backdrop-blur-md z-50 flex items-center justify-center p-6"
          >
            <div className="relative w-full max-w-3xl bg-studio-black border border-cork-shadow rounded-2xl overflow-hidden p-6 flex flex-col gap-4 shadow-2xl">
              
              {/* Close Button */}
              <button
                id="close-video-btn"
                onClick={() => setIsVideoOpen(false)}
                className="absolute top-4 right-4 p-2 text-grey-brown hover:text-burnt-sienna transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 pb-2 border-b border-cork-shadow/40">
                <Flame className="text-burnt-sienna w-5 h-5 animate-pulse" />
                <span className="font-sans font-semibold text-body text-warm-cream">
                  Catalyst: Cinematic Product Introduction
                </span>
              </div>

              {/* Simulated cinematic presentation of features */}
              <div className="w-full aspect-video rounded-xl bg-dark-cork/20 border border-cork-shadow/60 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-burnt-sienna)_0%,_transparent_60%)] opacity-10 pointer-events-none" />
                
                {/* Floating graphic elements */}
                <div className="w-20 h-20 rounded-full border border-burnt-sienna/30 flex items-center justify-center bg-burnt-sienna/5 mb-4 group-hover:scale-105 transition-transform duration-500">
                  <Play className="w-8 h-8 text-burnt-sienna fill-burnt-sienna" />
                </div>

                <div className="flex flex-col gap-2 max-w-sm z-10">
                  <h4 className="font-sans font-medium text-subheading text-warm-cream">
                    "From Blank Page to Completed Sprints"
                  </h4>
                  <p className="font-mono text-caption text-grey-brown">
                    A visual tour of the Catalyst physical clock widget syncing in real-time with VS Code, Figma, and Notion workspaces.
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-mono text-[9px] text-grey-brown uppercase tracking-widest">
                  Duration: 1:45 • High Definition Spatial Audio
                </span>

                <button
                  id="modal-launch-btn"
                  onClick={() => {
                    setIsVideoOpen(false);
                    handleLaunchApp();
                  }}
                  className="px-4 py-2 bg-warm-cream hover:bg-burnt-sienna text-studio-black hover:text-warm-cream font-mono text-[10px] tracking-widest uppercase rounded-full transition-all duration-300 cursor-pointer"
                >
                  Skip and Launch App
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
