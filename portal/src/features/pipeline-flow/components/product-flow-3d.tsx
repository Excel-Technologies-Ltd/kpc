import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { OrbitControls, Sparkles, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { FLOW_DESTINATIONS, PRODUCT_COLORS, type FlowDestination } from '../data/dummy';

/** Resolved light/dark for Three.js materials (system theme → prefers-color-scheme). */
function useIsDarkScene() {
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : true
  );

  useEffect(() => {
    const resolve = () => {
      if (theme === 'dark') return true;
      if (theme === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };
    setIsDark(resolve());
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setIsDark(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  return isDark;
}

type ScenePalette = {
  canvasClear: string;
  ground: string;
  gridMajor: string;
  gridMinor: string;
  axis: string;
  labelMuted: string;
  pad: string;
  tankDialIdle: string;
  textOutline: string;
  sparkles: string;
  rimLight: string;
  ambient: number;
  dirMain: number;
  pointIntensity: number;
  sparkleOpacity: number;
  sparkleCount: number;
};

const SCENE_DARK: ScenePalette = {
  canvasClear: '#080d16',
  ground: '#060a14',
  gridMajor: '#334155',
  gridMinor: '#1e293b',
  axis: '#38bdf8',
  labelMuted: '#475569',
  pad: '#334155',
  tankDialIdle: '#1e293b',
  textOutline: '#0a0f1d',
  sparkles: '#60a5fa',
  rimLight: '#6a8bff',
  ambient: 0.7,
  dirMain: 1.9,
  pointIntensity: 1.5,
  sparkleOpacity: 0.55,
  sparkleCount: 36,
};

const SCENE_LIGHT: ScenePalette = {
  canvasClear: '#e8eef8',
  ground: '#dbe4f0',
  gridMajor: '#94a3b8',
  gridMinor: '#cbd5e1',
  axis: '#0284c7',
  labelMuted: '#64748b',
  pad: '#94a3b8',
  tankDialIdle: '#64748b',
  textOutline: '#f8fafc',
  sparkles: '#3b82f6',
  rimLight: '#93c5fd',
  ambient: 0.95,
  dirMain: 1.7,
  pointIntensity: 1.05,
  sparkleOpacity: 0.32,
  sparkleCount: 22,
};

/** Compact place layout — source west, depots east (like trunk → inland). */
const SOURCE = {
  name: 'Mombasa',
  code: 'MSA',
  role: 'SOURCE',
  pos: [-2.85, 0, 0.15] as [number, number, number],
  color: '#4361ee',
  fillPct: 88,
};

const DEST_META: Record<string, { code: string; pos: [number, number, number]; fillPct: number }> =
  {
    Nairobi: { code: 'NBI', pos: [1.55, 0, -1.35], fillPct: 72 },
    Nakuru: { code: 'NAK', pos: [2.15, 0, -0.35], fillPct: 71 },
    Kisumu: { code: 'KSM', pos: [2.55, 0, 0.55], fillPct: 88 },
    Eldoret: { code: 'ELD', pos: [2.05, 0, 1.45], fillPct: 74 },
  };

function tubeRadius(strokeWidth: number) {
  return 0.03 + (strokeWidth / 15) * 0.05;
}

/** Glass/steel pipe + glowing core + beads sliding source → dest (home network style). */
function FlowTube({
  start,
  end,
  color,
  radius,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  radius: number;
}) {
  const curve = useMemo(() => {
    const p1 = new THREE.Vector3(start[0], 0.16, start[2]);
    const p2 = new THREE.Vector3(end[0], 0.16, end[2]);
    const mid = new THREE.Vector3(
      (start[0] + end[0]) / 2,
      0.28 + Math.abs(end[2] - start[2]) * 0.06,
      (start[2] + end[2]) / 2
    );
    return new THREE.CatmullRomCurve3([p1, mid, p2]);
  }, [start, end]);

  const particleCount = 12;
  const particleOffsets = useMemo(
    () => Array.from({ length: particleCount }, (_, i) => i / particleCount),
    [particleCount]
  );
  const particlesRef = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.32;
    particlesRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const offset = (particleOffsets[i]! + t) % 1;
      mesh.position.copy(curve.getPointAt(offset));
    });
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 40, radius * 2.1, 14, false]} />
        <meshPhysicalMaterial
          color='#60a5fa'
          emissive={color}
          emissiveIntensity={0.22}
          roughness={0.1}
          metalness={0.8}
          transmission={0.45}
          thickness={0.2}
          transparent
          opacity={0.6}
        />
      </mesh>
      <mesh>
        <tubeGeometry args={[curve, 40, radius, 12, false]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.05}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>
      {particleOffsets.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            particlesRef.current[i] = el;
          }}
        >
          <sphereGeometry args={[Math.max(0.04, radius * 0.95), 12, 12]} />
          <meshStandardMaterial
            color='#ffffff'
            emissive={color}
            emissiveIntensity={2.4}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Depot / terminal place — cylindrical tank + pad + floating label (network-map language). */
function PlaceTank({
  name,
  code,
  role,
  pos,
  color,
  fillPct,
  isSource = false,
  palette,
}: {
  name: string;
  code: string;
  role?: string;
  pos: [number, number, number];
  color: string;
  fillPct: number;
  isSource?: boolean;
  palette: ScenePalette;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const height = isSource ? 0.72 : 0.55;
  const radius = isSource ? 0.38 : 0.3;
  const fillHeight = height * (fillPct / 100);

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.35 + Math.sin(clock.getElapsedTime() * 2.4) * 0.25;
  });

  return (
    <group position={[pos[0], 0, pos[2]]}>
      {/* Concrete pad */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[radius * 1.55, radius * 1.65, 0.06, 32]} />
        <meshStandardMaterial color={palette.pad} roughness={0.75} metalness={0.2} />
      </mesh>

      {/* Status ring */}
      <mesh ref={ringRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.55, radius * 1.75, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0.45} />
      </mesh>

      {/* Tank shell */}
      <mesh position={[0, height / 2 + 0.06, 0]}>
        <cylinderGeometry args={[radius, radius, height, 32]} />
        <meshPhysicalMaterial
          color='#e2e8f0'
          emissive={color}
          emissiveIntensity={isSource ? 0.28 : 0.14}
          roughness={0.25}
          metalness={0.85}
          clearcoat={0.3}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Product fill */}
      <mesh position={[0, fillHeight / 2 + 0.06, 0]}>
        <cylinderGeometry args={[radius * 0.94, radius * 0.94, fillHeight, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.65}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>

      {/* Roof */}
      <mesh position={[0, height + 0.07, 0]}>
        <cylinderGeometry args={[radius * 1.02, radius, 0.04, 32]} />
        <meshStandardMaterial color='#cbd5e1' roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Roof dial */}
      <mesh position={[0, height + 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.35, radius * 0.92, 28]} />
        <meshStandardMaterial
          color={palette.tankDialIdle}
          emissive={color}
          emissiveIntensity={0.4}
          roughness={0.25}
          metalness={0.8}
        />
      </mesh>

      {/* Place name on roof (source / destination) */}
      <Text
        position={[0, height + 0.14, 0]}
        rotation={[-Math.PI / 2.35, 0, 0]}
        fontSize={isSource ? 0.11 : 0.095}
        fontWeight={900}
        color='#ffffff'
        anchorX='center'
        anchorY='middle'
        outlineWidth={0.012}
        outlineColor={palette.textOutline}
        maxWidth={radius * 2.2}
        textAlign='center'
      >
        {name}
      </Text>

      {/* Role badge on ground */}
      <Text
        position={[0, 0.02, radius * 1.95]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.09}
        fontWeight={700}
        color={color}
        anchorX='center'
        anchorY='middle'
        outlineWidth={0.008}
        outlineColor={palette.textOutline}
      >
        {role ?? code}
      </Text>
    </group>
  );
}

function FlowGround({ palette }: { palette: ScenePalette }) {
  return (
    <group>
      {/* Deep plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[16, 10]} />
        <meshStandardMaterial color={palette.ground} roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Lat/long style grid (home network surface) */}
      <gridHelper
        args={[14, 28, palette.gridMajor, palette.gridMinor]}
        position={[0, 0.001, 0]}
      />

      {/* Soft center highlight strip (source → destinations axis) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[7.5, 0.06]} />
        <meshBasicMaterial color={palette.axis} transparent opacity={0.22} />
      </mesh>

      <Text
        position={[-2.85, 0.015, -2.35]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.16}
        fontWeight={800}
        color={palette.labelMuted}
        fillOpacity={0.35}
        letterSpacing={0.12}
        anchorX='center'
        anchorY='middle'
      >
        SOURCE
      </Text>
      <Text
        position={[2.1, 0.015, -2.35]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.16}
        fontWeight={800}
        color={palette.labelMuted}
        fillOpacity={0.35}
        letterSpacing={0.12}
        anchorX='center'
        anchorY='middle'
      >
        DESTINATIONS
      </Text>
    </group>
  );
}

function FlowScene({ palette }: { palette: ScenePalette }) {
  return (
    <>
      <color attach='background' args={[palette.canvasClear]} />
      <fog attach='fog' args={[palette.canvasClear, 9, 20]} />
      <ambientLight intensity={palette.ambient} />
      <directionalLight position={[5, 7, 4]} intensity={palette.dirMain} />
      <directionalLight position={[-5, 3, -3]} intensity={0.75} color={palette.rimLight} />
      <pointLight
        position={[SOURCE.pos[0], 2.2, SOURCE.pos[2]]}
        intensity={palette.pointIntensity}
        color='#4361ee'
      />

      <Sparkles
        count={palette.sparkleCount}
        scale={[11, 2.5, 6]}
        size={2.2}
        speed={0.28}
        color={palette.sparkles}
        opacity={palette.sparkleOpacity}
      />

      <FlowGround palette={palette} />

      <PlaceTank
        name={SOURCE.name}
        code={SOURCE.code}
        role={SOURCE.role}
        pos={SOURCE.pos}
        color={SOURCE.color}
        fillPct={SOURCE.fillPct}
        isSource
        palette={palette}
      />

      {FLOW_DESTINATIONS.map((dest: FlowDestination) => {
        const meta = DEST_META[dest.name];
        if (!meta) return null;
        const color = PRODUCT_COLORS[dest.product];
        return (
          <group key={dest.name}>
            <FlowTube
              start={SOURCE.pos}
              end={meta.pos}
              color={color}
              radius={tubeRadius(dest.strokeWidth)}
            />
            <PlaceTank
              name={dest.name}
              code={meta.code}
              role={dest.product.toUpperCase()}
              pos={meta.pos}
              color={color}
              fillPct={meta.fillPct}
              palette={palette}
            />
          </group>
        );
      })}

      <OrbitControls
        enablePan={false}
        minDistance={5.5}
        maxDistance={9}
        minPolarAngle={Math.PI / 3.4}
        maxPolarAngle={Math.PI / 2.2}
        minAzimuthAngle={-0.65}
        maxAzimuthAngle={0.65}
        autoRotate
        autoRotateSpeed={0.28}
        target={[0, 0.15, 0]}
      />
    </>
  );
}

export function ProductFlow3D() {
  const isDark = useIsDarkScene();
  const palette = isDark ? SCENE_DARK : SCENE_LIGHT;

  return (
    <div
      className={cn(
        'relative h-80 w-full overflow-hidden rounded-xl border shadow-inner',
        'border-border bg-linear-to-b from-slate-100 via-slate-50 to-slate-200',
        'dark:border-white/10 dark:from-[#0e1628] dark:via-[#090e18] dark:to-[#04070d]'
      )}
    >
      <Canvas
        key={isDark ? 'dark' : 'light'}
        dpr={[1, 1.75]}
        camera={{ position: [0.35, 4.6, 6.4], fov: 40 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        className='h-full w-full touch-none'
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(palette.canvasClear), 1);
        }}
      >
        <Suspense fallback={null}>
          <FlowScene palette={palette} />
        </Suspense>
      </Canvas>
      <div className='pointer-events-none absolute bottom-2 left-3 text-[10px] font-medium tracking-wide text-muted-foreground uppercase dark:text-white/40'>
        Source → destinations · live flow
      </div>
    </div>
  );
}
