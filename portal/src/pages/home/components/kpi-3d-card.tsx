import { cn } from '@/lib/utils';
import { Float, OrbitControls, Sparkles } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Loader2, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export type Kpi3DType = 'throughput' | 'linefill' | 'revenue' | 'loss' | 'safety';

export interface Kpi3DCardProps {
  id: Kpi3DType;
  title: string;
  value: string;
  unit?: string;
  delta: string;
  deltaType: 'up' | 'down' | 'flat';
  description: string;
  color: string;
  gradient: string;
  subColor: string;
  isLoading?: boolean;
}

/**
 * Animated number count-up component with smooth easing
 */
function AnimatedCounter({ value, duration = 1.2 }: { value: string; duration?: number }) {
  // Extract number and formatting components
  const numericString = value.replace(/[^0-9.]/g, '');
  const targetNumber = parseFloat(numericString);
  const suffix = value.replace(/[0-9.,]/g, '');
  const hasDecimals = value.includes('.');
  const decimalPlaces = hasDecimals ? value.split('.')[1].length : 0;
  const hasCommas = value.includes(',');

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isNaN(targetNumber)) return;
    let startTime: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // Ease out exponential curve
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = targetNumber * ease;
      setDisplayValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [targetNumber, duration]);

  if (isNaN(targetNumber)) {
    return <span>{value}</span>;
  }

  let formatted = hasDecimals
    ? displayValue.toFixed(decimalPlaces)
    : Math.round(displayValue).toString();

  if (hasCommas) {
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    formatted = parts.join('.');
  }

  return (
    <span>
      {formatted}
      {suffix}
    </span>
  );
}

// 1. Throughput 3D Mesh: Flowing Torus Knot Vortex
function ThroughputMesh({ color }: { color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.55;
      meshRef.current.rotation.y += delta * 0.75;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[0.78, 0.25, 128, 32, 2, 3]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.45}
        roughness={0.12}
        metalness={0.88}
      />
    </mesh>
  );
}

// 2. Line Fill 3D Mesh: Ribbed Golden/Cyan Sphere with Inner Pack Core
function LineFillMesh({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.6;
      groupRef.current.rotation.z += delta * 0.25;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer ribbed layers */}
      {[-0.55, -0.28, 0, 0.28, 0.55].map((y, i) => {
        const radius = Math.cos(y * 1.5) * 0.88;
        return (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, 0.085, 16, 48]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.45}
              roughness={0.12}
              metalness={0.9}
            />
          </mesh>
        );
      })}
      {/* Glowing inner core */}
      <mesh>
        <sphereGeometry args={[0.48, 32, 32]} />
        <meshStandardMaterial
          color='#ffffff'
          emissive={color}
          emissiveIntensity={1.4}
          roughness={0.08}
          metalness={0.6}
        />
      </mesh>
    </group>
  );
}

// 3. Revenue 3D Mesh: Faceted Wealth Crystal
function RevenueMesh({ color }: { color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.65;
      meshRef.current.rotation.x += delta * 0.4;
    }
  });

  return (
    <mesh ref={meshRef}>
      <dodecahedronGeometry args={[0.92, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        roughness={0.1}
        metalness={0.92}
        flatShading
      />
    </mesh>
  );
}

// 4. System Loss 3D Mesh: Precision Dual Gyroscope Rings
function LossMesh({ color }: { color: string }) {
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ring1.current) ring1.current.rotation.x += delta * 0.85;
    if (ring2.current) ring2.current.rotation.y += delta * 0.75;
    if (core.current) core.current.rotation.z += delta * 0.55;
  });

  return (
    <group>
      <mesh ref={ring1}>
        <torusGeometry args={[0.9, 0.07, 16, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.55}
          roughness={0.15}
          metalness={0.88}
        />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.74, 0.065, 16, 64]} />
        <meshStandardMaterial
          color='#fbbf24'
          emissive='#fbbf24'
          emissiveIntensity={0.45}
          roughness={0.15}
          metalness={0.85}
        />
      </mesh>
      <mesh ref={core}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color='#ffffff'
          emissive={color}
          emissiveIntensity={1.2}
          roughness={0.08}
          metalness={0.92}
        />
      </mesh>
    </group>
  );
}

// 5. Safety 3D Mesh: HSE Shield Icosahedron Core
function SafetyMesh({ color }: { color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.55;
      meshRef.current.rotation.z += delta * 0.45;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[0.9, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.55}
        roughness={0.15}
        metalness={0.88}
        flatShading
      />
    </mesh>
  );
}

function Scene3DObject({ type, color }: { type: Kpi3DType; color: string }) {
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 5, 4]} intensity={2.2} />
      <directionalLight position={[-4, -3, -2]} intensity={1.0} color='#6a8bff' />
      <pointLight position={[0, 0, 2.5]} intensity={1.5} color={color} />

      <Sparkles count={32} scale={3.4} size={2.4} speed={0.4} color={color} opacity={0.7} />

      <Float speed={2.2} rotationIntensity={0.45} floatIntensity={0.45}>
        <group scale={0.82}>
          {type === 'throughput' && <ThroughputMesh color={color} />}
          {type === 'linefill' && <LineFillMesh color={color} />}
          {type === 'revenue' && <RevenueMesh color={color} />}
          {type === 'loss' && <LossMesh color={color} />}
          {type === 'safety' && <SafetyMesh color={color} />}
        </group>
      </Float>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        rotateSpeed={0.8}
        dampingFactor={0.08}
        enableDamping
      />
    </>
  );
}

export function Kpi3DCard({
  id,
  title,
  value,
  unit,
  delta,
  deltaType,
  description,
  color,
  gradient,
  subColor,
  isLoading = false,
}: Kpi3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Framer motion 3D Tilt physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 280, damping: 22 });
  const mouseYSpring = useSpring(y, { stiffness: 280, damping: 22 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['14deg', '-14deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-14deg', '14deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // 50% refined color-coded left thickness extrusion shadow
  const custom3DThicknessShadow = `
    -1.5px 2px 0 0 ${color},
    -3px 4px 0 0 ${color}cc,
    -5px 6px 0 0 ${color}88,
    -7px 8px 0 0 ${color}44,
    -10px 12px 20px rgba(0, 0, 0, 0.55),
    0 18px 36px -8px rgba(0, 0, 0, 0.75),
    inset 0 1.2px 1.5px rgba(255, 255, 255, 0.32)
  `;

  return (
    <div className='perspective-distant w-full pt-1 pl-2'>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          boxShadow: custom3DThicknessShadow,
          borderLeftColor: color,
        }}
        whileHover={{ scale: 1.025, y: -4 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className='group relative flex h-90 w-full flex-col justify-between overflow-hidden rounded-[24px] border border-white/20 border-l-2 bg-linear-to-b from-[#18233c] via-[#0f1728] to-[#080d16] p-4 transition-all duration-200 hover:border-white/40'
      >
        {/* 3D Physical Back-Plate Slab with base color glow */}
        <div
          style={{
            transform: 'translateZ(-10px)',
            borderColor: `${color}35`,
            background: `linear-gradient(135deg, ${color}15, #080d16 70%)`,
          }}
          className='pointer-events-none absolute inset-0 rounded-[24px] border shadow-xl'
        />

        {/* Ambient colored background radial glow */}
        <div
          className='pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full blur-3xl opacity-35'
          style={{ background: color }}
        />

        {/* 3D Floating Top Header (translateZ: 38px) */}
        <div
          style={{ transform: 'translateZ(38px)' }}
          className='relative z-20 space-y-1.5 px-1 pt-1'
        >
          {/* Row 1: Title */}
          <div className='flex items-center gap-2'>
            <div
              className='size-2.5 shrink-0 rounded-full shadow-md ring-2 ring-white/25'
              style={{ backgroundColor: color }}
            />
            <span className='truncate text-xs font-bold uppercase tracking-wider text-white/85 drop-shadow-sm'>
              {title}
            </span>
          </div>

          {/* Row 2: Value & Delta Badge (or Loader) */}
          <div className='flex flex-col items-start justify-between gap-1.5 pt-0.5'>
            {isLoading ? (
              <div className='flex h-9 items-center gap-2'>
                <div className='h-7 w-28 animate-pulse rounded-md bg-white/20' />
                <Loader2 className='size-3.5 animate-spin text-white/50' />
              </div>
            ) : (
              <div className='flex items-baseline gap-1'>
                <span className='font-mono text-2xl font-black tracking-tight text-white drop-shadow-md xl:text-3xl'>
                  <AnimatedCounter value={value} />
                </span>
                {unit && (
                  <span
                    className='text-xs font-extrabold sm:text-sm'
                    style={{ color: subColor || color }}
                  >
                    {unit}
                  </span>
                )}
              </div>
            )}

            {/* Delta Pill (or Loader) */}
            {isLoading ? (
              <div className='h-4.5 w-20 animate-pulse rounded-full bg-white/15' />
            ) : (
              <div
                className={cn(
                  'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-sm backdrop-blur-md',
                  deltaType === 'up'
                    ? 'border border-emerald-400/30 bg-emerald-500/20 text-emerald-300'
                    : deltaType === 'down'
                      ? 'border border-rose-400/30 bg-rose-500/20 text-rose-300'
                      : 'border border-white/20 bg-white/10 text-white/90'
                )}
              >
                {deltaType === 'up' && <TrendingUp className='size-3 shrink-0' />}
                {deltaType === 'down' && <TrendingDown className='size-3 shrink-0' />}
                {deltaType === 'flat' && <Minus className='size-3 shrink-0' />}
                <span>{delta}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3D Floating Canvas (translateZ: 60px) */}
        <div
          style={{ transform: 'translateZ(60px)' }}
          className='relative flex-1 min-h-35 cursor-grab active:cursor-grabbing'
        >
          <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0, 3.2], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={null}>
              <Scene3DObject type={id} color={color} />
            </Suspense>
          </Canvas>
        </div>

        {/* 3D Floating Bottom Glossy Glass Banner (translateZ: 42px) */}
        <div
          style={{
            transform: 'translateZ(42px)',
            background: gradient,
            border: '1px solid rgba(255, 255, 255, 0.26)',
          }}
          className={cn(
            'relative z-20 rounded-2xl p-3 text-white shadow-xl backdrop-blur-md transition-transform duration-200 group-hover:scale-[1.01]'
          )}
        >
          <p className='line-clamp-2 text-[11.5px] font-medium leading-relaxed text-white/95 drop-shadow-xs'>
            {description}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
