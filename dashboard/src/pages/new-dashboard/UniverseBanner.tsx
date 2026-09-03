import React from "react";
import { motion } from "framer-motion";

export const UniverseBanner: React.FC = () => {
  return (
    <div className="relative rounded-3xl border border-white/10 bg-[#121422]/90 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex items-center justify-between gap-6 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 bg-[#386bf6]/20 rounded-full blur-3xl pointer-events-none" />

      {/* 3D Flying Rocket Illustration */}
      <div className="relative shrink-0 w-28 h-36 flex items-center justify-center">
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-full h-full flex flex-col items-center justify-center"
        >
          {/* Rocket Body SVG 3D Shaded */}
          <svg className="w-20 h-28 drop-shadow-[0_0_20px_rgba(99,102,241,0.6)]" viewBox="0 0 100 140" fill="none">
            {/* Thruster Flame */}
            <path
              d="M44 105 Q50 135 50 138 Q50 135 56 105 Z"
              fill="url(#fireGradient)"
              className="animate-pulse"
            />
            <path
              d="M47 105 Q50 125 50 128 Q50 125 53 105 Z"
              fill="#ffffff"
            />

            {/* Wings */}
            <path d="M22 80 L35 70 L35 102 L20 108 Z" fill="#3b42a0" />
            <path d="M78 80 L65 70 L65 102 L80 108 Z" fill="#434cbd" />

            {/* Fuselage */}
            <path
              d="M50 8 C35 30 35 75 35 105 L65 105 C65 75 65 30 50 8 Z"
              fill="url(#rocketBodyGradient)"
            />

            {/* Cockpit Glass */}
            <circle cx="50" cy="45" r="7" fill="#00f2fe" stroke="#ffffff" strokeWidth="1.5" />

            {/* Gradients */}
            <defs>
              <linearGradient id="rocketBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="50%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#312e81" />
              </linearGradient>
              <linearGradient id="fireGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#fef08a" />
                <stop offset="60%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </div>

      {/* Text & Action Callout */}
      <div className="flex-1 text-left">
        <h2 className="font-['Space_Grotesk'] text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight tracking-tight">
          You Haven't Conquered Universe Yet?
        </h2>

        <div className="mt-4">
          <button
            type="button"
            className="px-6 py-3 rounded-full border border-[#818cf8]/60 bg-[#1e2238]/80 hover:bg-[#282d4a] text-white font-['Space_Grotesk'] font-semibold text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all cursor-pointer"
          >
            Start your Journey now!
          </button>
        </div>
      </div>
    </div>
  );
};

export default UniverseBanner;
