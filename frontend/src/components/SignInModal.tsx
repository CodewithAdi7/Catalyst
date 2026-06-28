import React, { useRef, useEffect, useState } from "react";
import { Eye, EyeOff, ArrowRight, X, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  theme?: "dark" | "light";
}

type RoutePoint = {
  x: number;
  y: number;
  delay: number;
};

const DotMap = ({ theme }: { theme: "dark" | "light" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const isLight = theme === "light";

  // Create dots for the world map
  const generateDots = (width: number, height: number) => {
    const dots = [];
    const gap = 12;
    const dotRadius = 1.2;

    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        // Shape dots to form a world map silhouette
        const isInMapShape =
          // North America
          ((x < width * 0.28 && x > width * 0.05) && (y < height * 0.4 && y > height * 0.1)) ||
          // South America
          ((x < width * 0.28 && x > width * 0.16) && (y < height * 0.8 && y > height * 0.4)) ||
          // Europe
          ((x < width * 0.48 && x > width * 0.32) && (y < height * 0.35 && y > height * 0.12)) ||
          // Africa
          ((x < width * 0.52 && x > width * 0.36) && (y < height * 0.68 && y > height * 0.35)) ||
          // Asia
          ((x < width * 0.75 && x > width * 0.48) && (y < height * 0.52 && y > height * 0.1)) ||
          // Australia
          ((x < width * 0.85 && x > width * 0.68) && (y < height * 0.82 && y > height * 0.58));

        if (isInMapShape && Math.random() > 0.28) {
          dots.push({
            x,
            y,
            radius: dotRadius,
            opacity: Math.random() * 0.4 + 0.15,
          });
        }
      }
    }
    return dots;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const width = parent.clientWidth;
        const height = parent.clientHeight;
        setDimensions({ width, height });
        canvas.width = width;
        canvas.height = height;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dots = generateDots(dimensions.width, dimensions.height);
    let animationFrameId: number;
    let startTime = Date.now();

    // Scale routes dynamically
    const routes = [
      {
        start: { x: dimensions.width * 0.18, y: dimensions.height * 0.25, delay: 0 },
        end: { x: dimensions.width * 0.42, y: dimensions.height * 0.18, delay: 1.8 },
        color: "#dc5000",
      },
      {
        start: { x: dimensions.width * 0.42, y: dimensions.height * 0.18, delay: 1.8 },
        end: { x: dimensions.width * 0.62, y: dimensions.height * 0.32, delay: 3.5 },
        color: "#dc5000",
      },
      {
        start: { x: dimensions.width * 0.12, y: dimensions.height * 0.6, delay: 0.8 },
        end: { x: dimensions.width * 0.44, y: dimensions.height * 0.48, delay: 2.8 },
        color: "#dc5000",
      },
      {
        start: { x: dimensions.width * 0.72, y: dimensions.height * 0.22, delay: 0.3 },
        end: { x: dimensions.width * 0.52, y: dimensions.height * 0.52, delay: 2.2 },
        color: "#dc5000",
      },
    ];

    function drawDots() {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        // Fill dots using Burnt Sienna with random opacity
        ctx.fillStyle = `rgba(220, 80, 0, ${dot.opacity * (isLight ? 0.75 : 1.0)})`;
        ctx.fill();
      });
    }

    function drawRoutes() {
      const currentTime = (Date.now() - startTime) / 1000;
      
      routes.forEach(route => {
        const elapsed = currentTime - route.start.delay;
        if (elapsed <= 0) return;
        
        const duration = 2.5; 
        const progress = Math.min(elapsed / duration, 1);
        
        const x = route.start.x + (route.end.x - route.start.x) * progress;
        const y = route.start.y + (route.end.y - route.start.y) * progress;
        
        // Draw path
        ctx.beginPath();
        ctx.moveTo(route.start.x, route.start.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = `rgba(220, 80, 0, ${isLight ? 0.45 : 0.75})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        
        // Draw endpoints
        ctx.beginPath();
        ctx.arc(route.start.x, route.start.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = route.color;
        ctx.fill();
        
        // Draw moving point
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? "#100904" : "#ffedd7";
        ctx.fill();
        
        // Pulsing glow
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? "rgba(16, 9, 4, 0.25)" : "rgba(255, 237, 215, 0.35)";
        ctx.fill();
        
        if (progress === 1) {
          ctx.beginPath();
          ctx.arc(route.end.x, route.end.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = route.color;
          ctx.fill();
        }
      });
    }
    
    function animate() {
      drawDots();
      drawRoutes();
      
      const currentTime = (Date.now() - startTime) / 1000;
      if (currentTime > 10) { 
        startTime = Date.now();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    }
    
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [dimensions, isLight]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default function SignInModal({ isOpen, onClose, onSuccess, theme = "dark" }: SignInModalProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const isLight = theme === "light";

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate authentication success
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full max-w-4xl overflow-hidden rounded-2xl flex relative shadow-2xl ${
          isLight ? "bg-white text-studio-black" : "bg-[#100904] text-warm-cream border border-cork-shadow/60"
        }`}
      >
        {/* Close trigger button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full border transition-all z-20 cursor-pointer ${
            isLight 
              ? "bg-[#faf6f0] border-[#d2c2b0] hover:bg-white text-[#100904]" 
              : "bg-[#100904] border-cork-shadow hover:bg-dark-cork text-[#ffedd7]"
          }`}
        >
          <X size={15} />
        </button>

        {/* Left column - Animated World Map */}
        <div className={`hidden md:block w-1/2 h-[550px] relative overflow-hidden border-r ${
          isLight ? "bg-gradient-to-br from-[#fffbf4] to-[#ffedd7] border-[#e5e5e5]" : "bg-gradient-to-br from-[#1c120c] to-[#100904] border-cork-shadow/40"
        }`}>
          <DotMap theme={theme} />
          
          {/* Spatial branding overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10 select-none pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-4"
            >
              <div className="h-11 w-11 rounded-xl bg-burnt-sienna flex items-center justify-center shadow-lg shadow-burnt-sienna/25">
                <Sparkles className="text-white h-5.5 w-5.5 animate-pulse" />
              </div>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-2xl font-bold tracking-tight text-center"
            >
              CATALYST <span className="text-burnt-sienna">SYNC</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-[12px] text-center text-grey-brown max-w-[220px] mt-2 leading-relaxed"
            >
              Connect with your workspaces, automate code scaffolding, and sync active timelines globally.
            </motion.p>
          </div>
        </div>
        
        {/* Right column - Sign In Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div>
            <h1 className={`text-2xl font-bold mb-1 ${isLight ? "text-studio-black" : "text-white"}`}>
              Welcome back
            </h1>
            <p className="text-grey-brown text-xs mb-8">Sign in to your account</p>
            
            {/* Google Identity login */}
            <div className="mb-5">
              <button 
                type="button"
                onClick={onSuccess}
                className={`w-full flex items-center justify-center gap-2 rounded-full p-2.5 text-xs font-mono font-bold tracking-wider uppercase border transition-all duration-300 shadow-sm cursor-pointer ${
                  isLight 
                    ? "bg-[#faf6f0] border-[#d2c2b0] hover:bg-white text-[#100904]" 
                    : "bg-white/5 border-white/10 hover:bg-white/10 text-warm-cream"
                }`}
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fillOpacity=".54"
                  />
                  <path
                    fill="#4285F4"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#34A853"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Login with Google</span>
              </button>
            </div>
            
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isLight ? "border-black/10" : "border-white/5"}`} />
              </div>
              <span className={`relative px-3 text-[10px] font-mono tracking-widest uppercase ${
                isLight ? "bg-white text-grey-brown" : "bg-[#100904] text-grey-brown"
              }`}>or email</span>
            </div>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-[10px] font-mono tracking-widest uppercase text-grey-brown mb-1.5">
                  Email Address <span className="text-burnt-sienna">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className={`w-full rounded p-2 text-xs focus:outline-none focus:border-burnt-sienna/60 transition-all ${
                    isLight 
                      ? "bg-[#faf6f0] border border-[#d2c2b0] text-[#100904]" 
                      : "bg-black/40 border border-cork-shadow/50 text-warm-cream"
                  }`}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-[10px] font-mono tracking-widest uppercase text-grey-brown mb-1.5">
                  Password <span className="text-burnt-sienna">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={isPasswordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className={`w-full rounded p-2 text-xs focus:outline-none focus:border-burnt-sienna/60 pr-10 transition-all ${
                      isLight 
                        ? "bg-[#faf6f0] border border-[#d2c2b0] text-[#100904]" 
                        : "bg-black/40 border border-cork-shadow/50 text-warm-cream"
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-grey-brown hover:text-burnt-sienna transition-colors"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    {isPasswordVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              
              <div className="pt-2">
                <ButtonWithShimmer 
                  isHovered={isHovered}
                  setIsHovered={setIsHovered}
                />
              </div>
              
              <div className="text-center pt-2">
                <a href="#" className="text-xs text-burnt-sienna hover:underline font-mono tracking-wide">
                  Forgot password?
                </a>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Button Component with Shimmer highlight
function ButtonWithShimmer({ 
  isHovered, 
  setIsHovered 
}: { 
  isHovered: boolean; 
  setIsHovered: (h: boolean) => void;
}) {
  return (
    <motion.button
      type="submit"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`w-full py-3 rounded-lg text-white font-mono text-[11px] font-bold uppercase tracking-widest relative overflow-hidden bg-burnt-sienna hover:bg-burnt-sienna/95 transition-all duration-300 cursor-pointer ${
        isHovered ? "shadow-lg shadow-burnt-sienna/20" : ""
      }`}
    >
      <span className="flex items-center justify-center gap-1.5">
        Sign in
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
      {isHovered && (
        <motion.span
          initial={{ left: "-100%" }}
          animate={{ left: "100%" }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{ filter: "blur(6px)" }}
        />
      )}
    </motion.button>
  );
}
