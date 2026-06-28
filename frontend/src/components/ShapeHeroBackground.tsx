import { motion } from "motion/react";

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
  borderRadius = 16,
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
  borderRadius?: number;
}) {
  return (
    <motion.div
      animate={{
        opacity: 1,
        y: 0,
        rotate,
      }}
      className={`absolute ${className}`}
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        className="relative"
        style={{
          width,
          height,
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-r to-transparent ${gradient} backdrop-blur-[1px] ring-1 ring-white/[0.04] dark:ring-white/[0.02] shadow-[0_2px_16px_-2px_rgba(255,255,255,0.03)] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)] after:rounded-[inherit]`}
          style={{ borderRadius }}
        />
      </motion.div>
    </motion.div>
  );
}

interface ShapeHeroBackgroundProps {
  theme?: string;
}

export default function ShapeHeroBackground({ theme = "dark" }: ShapeHeroBackgroundProps) {
  const isLight = theme === "light";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Ambient background glows */}
      <div 
        className={`absolute inset-0 transition-colors duration-500 ${
          isLight 
            ? "bg-gradient-to-b from-[#CCD0CF] via-[#CCD0CF] to-[#dbe0df]" 
            : "bg-gradient-to-b from-[#06141B] via-[#06141B] to-[#030d12]"
        }`} 
      />
      <div 
        className={`absolute inset-0 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_-20%,rgba(155,168,171,0.15),transparent_70%)] ${
          isLight ? "opacity-40" : "opacity-100"
        }`} 
      />

      {/* Floating geometric shapes from kokonutd shape-landing-hero design */}
      <ElegantShape
        delay={0.3}
        width={600}
        height={140}
        rotate={12}
        gradient={isLight ? "from-orange-500/[0.06]" : "from-burnt-sienna/[0.12]"}
        className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
      />

      <ElegantShape
        delay={0.5}
        width={500}
        height={120}
        rotate={-15}
        gradient={isLight ? "from-[#11212D]/[0.08]" : "from-[#11212D]/[0.22]"}
        className="right-[-10%] md:right-[-5%] top-[70%] md:top-[75%]"
      />

      <ElegantShape
        delay={0.4}
        width={300}
        height={80}
        rotate={-8}
        gradient={isLight ? "from-amber-500/[0.06]" : "from-amber-500/[0.1]"}
        className="left-[5%] md:left-[10%] top-[60%] md:top-[65%]"
      />

      <ElegantShape
        delay={0.6}
        width={400}
        height={100}
        rotate={20}
        gradient={isLight ? "from-orange-500/[0.05]" : "from-burnt-sienna/[0.08]"}
        className="right-[10%] md:right-[15%] top-[20%] md:top-[25%]"
      />

      <ElegantShape
        delay={0.7}
        width={220}
        height={60}
        rotate={-10}
        gradient={isLight ? "from-[#4A5C6A]/[0.08]" : "from-[#4A5C6A]/[0.15]"}
        className="left-[35%] md:left-[40%] top-[2%] md:top-[5%]"
      />
    </div>
  );
}
