import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface PlanetCardProps {
  name: string;
  suffix?: string;
  price: number;
  chosen?: boolean;
  imageSrc: string;
  glowColor: string;
  footerGradient: string;
  onChoose?: () => void;
}

export const PlanetCard: React.FC<PlanetCardProps> = ({
  name,
  suffix,
  price,
  chosen = false,
  imageSrc,
  glowColor,
  footerGradient,
  onChoose,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 180, damping: 20, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-14, 14]);
  const sphereShiftX = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);
  const sphereShiftY = useTransform(smoothY, [-0.5, 0.5], [-12, 12]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className="relative flex-1 min-w-[280px] rounded-3xl overflow-hidden border border-white/10 bg-[#121422]/90 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] group transition-all duration-300"
    >
      {/* Price pill top-right */}
      <div className="absolute top-4 right-5 z-20 flex items-baseline gap-1.5 font-['IBM_Plex_Mono']">
        <span className="text-xl font-bold text-white tracking-tight">{price}</span>
        <span className="text-[11px] font-semibold text-white/60 tracking-wider">COIN</span>
      </div>

      {/* Floating 3D Planet Stage */}
      <div className="relative h-[220px] flex items-center justify-center pt-2 overflow-visible">
        {/* Ambient radial blur halo */}
        <div
          style={{ backgroundColor: glowColor }}
          className="absolute w-[180px] h-[180px] rounded-full blur-[65px] opacity-45 pointer-events-none transition-opacity duration-300 group-hover:opacity-75"
        />

        {/* 3D Sphere with Parallax Tilt */}
        <motion.div
          style={{ x: sphereShiftX, y: sphereShiftY }}
          className="relative w-[170px] h-[170px] z-10 filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
        >
          <img
            src={imageSrc}
            alt={`Planet ${name}`}
            className="w-full h-full object-cover rounded-full mix-blend-screen scale-105 transition-transform duration-500 group-hover:scale-110"
          />
        </motion.div>
      </div>

      {/* Arched Gradient Pedestal Base */}
      <div className={`relative px-6 pt-5 pb-6 bg-gradient-to-br ${footerGradient} text-white shadow-inner overflow-hidden`}>
        {/* Soft highlight glare */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3 relative z-10">
          <div>
            <div className="text-base font-semibold tracking-wide font-['Space_Grotesk'] text-white">
              Planet <span className="font-bold text-white tracking-normal">{name}</span>
              {suffix && <sup className="text-xs font-mono ml-0.5 opacity-90">{suffix}</sup>}
            </div>
            <p className="text-[11px] text-white/80 mt-1 max-w-[190px] leading-relaxed font-normal">
              Black hole engulfs and multiplies your wallet
            </p>
          </div>

          {/* Toggle Choice Switch */}
          <button
            type="button"
            onClick={onChoose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 hover:bg-black/30 border border-white/20 text-white transition-all cursor-pointer shadow-sm"
          >
            {chosen ? (
              <span className="w-3.5 h-3.5 rounded-full bg-white text-black flex items-center justify-center text-[9px] font-bold">
                ✓
              </span>
            ) : (
              <span className="w-2.5 h-2.5 rounded-full border border-white/60" />
            )}
            <span className="text-[10px] font-mono font-medium tracking-wider uppercase">
              {chosen ? "Chose" : "Choose"}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PlanetCard;
