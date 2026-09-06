import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Cpu, PlaneTakeoffIcon, Radio, Shield } from "lucide-react";
import { useRef, useState } from "react";
// import { Planet, Cpu, Radio, Shield, HelpCircle } from "lucide-react";

// 3D Celestial Core Element
function CosmicCore() {
  const planetRef = useRef();
  const ringRef = useRef();

  // Gentle, continuous rotations mimicking orbit mechanics
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    if (planetRef.current) {
      planetRef.current.rotation.y = elapsedTime * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -elapsedTime * 0.05;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central Star/Planet */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial 
          color="#3b82f6" 
          wireframe 
          emissive="#1d4ed8" 
          emissiveIntensity={0.5} 
        />
      </mesh>

      {/* Orbit Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2.5, 0, 0]}>
        <ringGeometry args={[2.8, 3, 64]} />
        <meshBasicMaterial color="#a855f7" side={2} transparent opacity={0.6} />
      </mesh>

      {/* Dynamic Ambient Point Lights */}
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#6366f1" />
      <pointLight position={[-5, -5, -5]} intensity={1} color="#a855f7" />
    </group>
  );
}

// Reusable Dashboard Telemetry Card
function StatCard({ icon: Icon, title, value, status, trend }) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition-all duration-300 shadow-2xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold tracking-wider text-slate-400 uppercase">{title}</span>
        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
          <Icon size={20} />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight text-white mb-1">{value}</div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-emerald-400 font-medium">{trend}</span>
          <span className="text-slate-500 uppercase tracking-widest text-[10px] bg-slate-800 px-2 py-0.5 rounded">
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CosmicDashboard() {
  const [systemActive, setSystemActive] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden selection:bg-indigo-500/30">
      
      {/* 1. Full-screen Background 3D Canvas Canvas */}
      <div className="absolute inset-0 z-0 pointer-events-none md:pointer-events-auto">
        <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
          <ambientLight intensity={0.2} />
          
          {/* Cosmic Starfield Generator */}
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0.5} fade speed={1} />
          
          {/* Animated 3D Assembly */}
          <CosmicCore />
          
          {/* Camera Interactions (Disable zoom to preserve dashboard readability) */}
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} />
        </Canvas>
      </div>

      {/* 2. Glassmorphic UI Dashboard Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 flex flex-col min-h-screen justify-between pointer-events-none">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/40 backdrop-blur-md border border-slate-900 p-4 rounded-xl pointer-events-auto">
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Aetheris OS
            </h1>
            <p className="text-xs text-slate-400 font-mono">STATION ID // ORBIT-NX-704</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSystemActive(!systemActive)}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wider uppercase border transition-all ${
                systemActive 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}
            >
              System: {systemActive ? "Nominal" : "Standby"}
            </button>
          </div>
        </header>

        {/* Central Visualization Space (Pushes cards to bottom/sides) */}
        <div className="flex-1 my-6 flex items-center justify-center">
          <p className="text-slate-500 font-mono text-[10px] tracking-widest uppercase animate-pulse select-none">
            Drag to pan space canvas
          </p>
        </div>

        {/* Analytics Grid Footer */}
        <footer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pointer-events-auto w-full">
          <StatCard 
            icon={PlaneTakeoffIcon} 
            title="Warp Vector" 
            value="8.42 ly/h" 
            status="Stable" 
            trend="+1.2% Dev"
          />
          <StatCard 
            icon={Cpu} 
            title="Core Singularity" 
            value="42,109 TH/s" 
            status="Optimal" 
            trend="98.4% Efficiency"
          />
          <StatCard 
            icon={Radio} 
            title="Subspace Array" 
            value="-42.1 dBm" 
            status="Online" 
            trend="4 Nodes Sync"
          />
          <StatCard 
            icon={Shield} 
            title="Deflector Grid" 
            value="100.0%" 
            status="Charged" 
            trend="0 Triggers"
          />
        </footer>
      </div>
    </div>
  );
}