import React from "react";
import { motion } from "framer-motion";

export const TimeFinishCard: React.FC = () => {
  return (
    <div className="relative rounded-3xl border border-white/10 bg-[#121422]/90 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex flex-col items-center justify-between overflow-hidden">
      {/* Background radial atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#386bf6]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Title */}
      <div className="w-full text-center mb-4">
        <h3 className="font-['Space_Grotesk'] text-lg sm:text-xl font-bold text-white tracking-tight">
          Time to finish Found
        </h3>

        {/* Countdown Timers */}
        <div className="flex items-center justify-center gap-2.5 mt-3.5">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#8aa0c0] font-mono uppercase mb-1">Min</span>
            <div className="w-11 h-9 rounded-xl bg-[#1a1d30] border border-white/10 flex items-center justify-center text-sm font-bold font-mono text-white shadow-inner">
              39
            </div>
          </div>
          <span className="text-white/40 font-mono text-sm self-end mb-2">:</span>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#8aa0c0] font-mono uppercase mb-1">Hours</span>
            <div className="w-11 h-9 rounded-xl bg-[#1a1d30] border border-white/10 flex items-center justify-center text-sm font-bold font-mono text-white shadow-inner">
              12
            </div>
          </div>
          <span className="text-white/40 font-mono text-sm self-end mb-2">:</span>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#8aa0c0] font-mono uppercase mb-1">Days</span>
            <div className="w-11 h-9 rounded-xl bg-[#1a1d30] border border-white/10 flex items-center justify-center text-sm font-bold font-mono text-white shadow-inner">
              05
            </div>
          </div>
        </div>
      </div>

      {/* 3D Orbiting Atom Planet Graphic */}
      <div className="relative w-48 h-48 my-3 flex items-center justify-center">
        {/* Progress Arc Halo */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="44"
            className="stroke-white/10"
            strokeWidth="3"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            className="stroke-[#386bf6]"
            strokeWidth="3.5"
            strokeDasharray="276"
            strokeDashoffset="75"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Orbit Rings Animated */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute w-40 h-40 rounded-full border border-emerald-400/50 [transform:rotateX(68deg)_rotateY(25deg)] shadow-[0_0_15px_rgba(52,211,153,0.3)] pointer-events-none"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute w-44 h-44 rounded-full border border-cyan-400/50 [transform:rotateX(68deg)_rotateY(-35deg)] shadow-[0_0_15px_rgba(34,211,238,0.3)] pointer-events-none"
        />

        {/* Glowing Planet Core */}
        <div className="relative w-28 h-28 rounded-full bg-radial from-[#10b981] via-[#047857] to-[#022c22] shadow-[0_0_40px_rgba(16,185,129,0.5)] border border-emerald-400/40 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent_60%)]" />
          <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[repeating-linear-gradient(45deg,#000_0,#000_3px,transparent_3px,transparent_8px)]" />
        </div>
      </div>

      {/* Call to Action Button */}
      <button
        type="button"
        className="w-full mt-3 py-3 rounded-2xl bg-gradient-to-r from-[#2563eb] to-[#4f46e5] text-white font-['Space_Grotesk'] font-semibold text-sm shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
      >
        Explore Now!
      </button>
    </div>
  );
};

export default TimeFinishCard;
