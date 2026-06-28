import { motion } from "motion/react";

export default function GooeyBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-40 pointer-events-none select-none z-0">
      {/* SVG gooey filter as specified in the Immersive UI design mockup */}
      <svg className="hidden">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Blobs container with the filter applied */}
      <div
        className="w-full h-full relative"
        style={{ filter: "url(#goo)" }}
      >
        {/* Blob 1: Dark Cork Radial Gradient */}
        <motion.div
          animate={{
            x: ["10vw", "25vw", "15vw", "10vw"],
            y: ["10vh", "30vh", "20vh", "10vh"],
            scale: [1, 1.2, 0.95, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-96 h-96 rounded-full mix-blend-screen"
          style={{
            background: "radial-gradient(circle, #382416 0%, transparent 70%)",
            top: "15%",
            left: "15%",
          }}
        />

        {/* Blob 2: Burnt Sienna Radial Gradient */}
        <motion.div
          animate={{
            x: ["60vw", "45vw", "55vw", "60vw"],
            y: ["50vh", "30vh", "45vh", "50vh"],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-80 h-80 rounded-full mix-blend-screen"
          style={{
            background: "radial-gradient(circle, #dc5000 0%, transparent 70%)",
            opacity: 0.3,
            top: "40%",
            left: "50%",
          }}
        />

        {/* Blob 3: Cork Shadow Radial Gradient */}
        <motion.div
          animate={{
            x: ["30vw", "50vw", "40vw", "30vw"],
            y: ["60vh", "45vh", "55vh", "60vh"],
            scale: [0.9, 1.1, 1, 0.9],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, #40372e 0%, transparent 75%)",
            opacity: 0.1,
            top: "30%",
            left: "25%",
          }}
        />
      </div>
    </div>
  );
}
