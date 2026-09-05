import React, { useState } from "react";

export const DailyUsageChart: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("WEEK");

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const levels = ["05", "04", "03", "02", "01"];

  return (
    <div className="relative rounded-3xl border border-white/10 bg-[#121422]/90 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_16px_40px_rgba(0,0,0,0.6)] overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#00ba7c]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Filter */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs sm:text-sm font-semibold tracking-wider text-white/80 uppercase font-['Space_Grotesk']">
          Dayily Usage
        </h3>

        <div className="relative">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="bg-[#181b2e] border border-white/10 text-xs font-mono text-[#8aa0c0] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#386bf6] cursor-pointer"
          >
            <option value="WEEK">WEEK</option>
            <option value="MONTH">MONTH</option>
            <option value="YEAR">YEAR</option>
          </select>
        </div>
      </div>

      {/* Chart Canvas Area with Dual Glowing Waves */}
      <div className="relative w-full h-56 sm:h-64 mt-2">
        {/* Y-Axis levels */}
        <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-[11px] font-mono text-[#5a6d8c]">
          {levels.map((lvl) => (
            <span key={lvl}>{lvl}</span>
          ))}
        </div>

        {/* Horizontal grid guide lines */}
        <div className="absolute left-8 right-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
          {levels.map((lvl) => (
            <div key={lvl} className="w-full border-b border-white/[0.04]" />
          ))}
        </div>

        {/* SVG Neon Glowing Curves */}
        <svg
          className="absolute left-8 right-0 top-0 bottom-8 w-[calc(100%-2rem)] h-[calc(100%-2rem)] overflow-visible"
          viewBox="0 0 700 200"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Cyan Line Glow Filter */}
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Purple Line Glow Filter */}
            <filter id="purpleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Cyan/Teal Smooth Wave */}
          <path
            d="M 0 140 C 100 135, 180 148, 280 135 C 380 120, 480 30, 580 85 C 640 120, 680 50, 700 35"
            fill="none"
            stroke="#00e5bf"
            strokeWidth="3.5"
            filter="url(#cyanGlow)"
            strokeLinecap="round"
          />

          {/* Purple/Indigo Smooth Wave */}
          <path
            d="M 0 125 C 100 120, 200 145, 300 120 C 370 25, 450 35, 520 100 C 600 170, 650 90, 700 45"
            fill="none"
            stroke="#8c52ff"
            strokeWidth="3.5"
            filter="url(#purpleGlow)"
            strokeLinecap="round"
          />

          {/* Active Highlight Node on Peak */}
          <circle cx="370" cy="25" r="5" fill="#ffffff" stroke="#8c52ff" strokeWidth="3" />
        </svg>

        {/* Floating Tooltip Indicator Badge */}
        <div className="absolute left-[48%] top-[2%] -translate-x-1/2 -translate-y-full bg-[#1b1c34] border border-[#8c52ff]/60 px-3 py-1 rounded-full text-xs font-mono font-bold text-white shadow-[0_0_15px_rgba(140,82,255,0.4)]">
          288.90
        </div>

        {/* X-Axis Day Labels */}
        <div className="absolute left-8 right-0 bottom-0 flex justify-between text-[11px] font-mono text-[#8aa0c0] pt-2">
          {days.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyUsageChart;
