import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { OrbitControls, Sparkles, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { Gauge, Radio, Waves } from 'lucide-react';
import { Suspense, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

// Kenya Geographic Depot Data with Lat/Long mapped to 3D Coordinates
export interface TerminalNode3D {
  id: string;
  code: string;
  name: string;
  terminal: string;
  lat: number;
  lng: number;
  pos: [number, number, number]; // [x, y, z] in 3D scene
  product: string;
  capacityKL: number;
  currentStockKL: number;
  fillPct: number;
  color: string;
  isPumpStation?: boolean;
}

const KENYA_TERMINALS: TerminalNode3D[] = [
  {
    id: 'MSA-T01',
    code: 'MSA-01',
    name: 'Mombasa Kipevu Terminal',
    terminal: 'MSA-01',
    lat: -4.0435,
    lng: 39.6682,
    pos: [4.2, 0, 1.6],
    product: 'AGO-ULSD',
    capacityKL: 45000,
    currentStockKL: 38200,
    fillPct: 85,
    color: '#06b6d4',
  },
  {
    id: 'PS3-MTI',
    code: 'PS3',
    name: 'Mtito Andei Pump Station',
    terminal: 'PS3-01',
    lat: -2.6908,
    lng: 38.1678,
    pos: [2.3, 0, 0.7],
    product: 'Booster Pump',
    capacityKL: 6000,
    currentStockKL: 4800,
    fillPct: 80,
    color: '#10b981',
    isPumpStation: true,
  },
  {
    id: 'PS4-SHM',
    code: 'PS4',
    name: 'Sultan Hamud Pump Station',
    terminal: 'PS4-01',
    lat: -2.0167,
    lng: 37.3667,
    pos: [0.6, 0, 0.1],
    product: 'Booster Pump',
    capacityKL: 6000,
    currentStockKL: 4200,
    fillPct: 70,
    color: '#f59e0b',
    isPumpStation: true,
  },
  {
    id: 'NBI-T01',
    code: 'NBI-01',
    name: 'Nairobi Main Tank',
    terminal: 'NBI-01',
    lat: -1.2921,
    lng: 36.8219,
    pos: [-1.1, 0, -0.4],
    product: 'AGO-ULSD',
    capacityKL: 45000,
    currentStockKL: 32600,
    fillPct: 72,
    color: '#4361ee',
  },
  {
    id: 'NAK-T01',
    code: 'NAK-01',
    name: 'Nakuru Depot Tank',
    terminal: 'NAK-01',
    lat: -0.3031,
    lng: 36.08,
    pos: [-2.6, 0, -0.9],
    product: 'PMS-Super',
    capacityKL: 30000,
    currentStockKL: 21400,
    fillPct: 71,
    color: '#10b981',
  },
  {
    id: 'ELD-T01',
    code: 'ELD-01',
    name: 'Eldoret Regional Tank',
    terminal: 'ELD-01',
    lat: 0.5143,
    lng: 35.2698,
    pos: [-4.0, 0, -1.8],
    product: 'Jet A-1',
    capacityKL: 25000,
    currentStockKL: 18500,
    fillPct: 74,
    color: '#f43f5e',
  },
  {
    id: 'KSM-T01',
    code: 'KSM-01',
    name: 'Kisumu Regional Tank',
    terminal: 'KSM-01',
    lat: -0.0917,
    lng: 34.768,
    pos: [-4.1, 0, 0.4],
    product: 'AGO-ULSD',
    capacityKL: 28000,
    currentStockKL: 24800,
    fillPct: 88,
    color: '#06b6d4',
  },
];

// 3D Animated Pipeline Tube connecting two points
function Pipeline3DTube({
  start,
  end,
  color = '#4361ee',
  active = true,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  active?: boolean;
}) {
  const curve = useMemo(() => {
    // Elevate the pipe slightly above the ground plane
    const p1 = new THREE.Vector3(start[0], 0.15, start[2]);
    const p2 = new THREE.Vector3(end[0], 0.15, end[2]);
    // Create subtle curved arch
    const mid = new THREE.Vector3((start[0] + end[0]) / 2, 0.22, (start[2] + end[2]) / 2);
    return new THREE.CatmullRomCurve3([p1, mid, p2]);
  }, [start, end]);

  // Oil flow particles moving inside the tube
  const particleGroup = useRef<THREE.Group>(null);
  const particleCount = 14;

  const particleOffsets = useMemo(
    () => Array.from({ length: particleCount }, (_, i) => i / particleCount),
    [particleCount]
  );

  const particlesRef = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }) => {
    if (!active) return;
    const t = clock.getElapsedTime() * 0.25;

    particlesRef.current.forEach((mesh, i) => {
      if (mesh) {
        const offset = (particleOffsets[i] + t) % 1;
        const point = curve.getPointAt(offset);
        mesh.position.copy(point);
      }
    });
  });

  return (
    <group>
      {/* 1. Outer Translucent Glass/Steel Pipe Tube */}
      <mesh>
        <tubeGeometry args={[curve, 32, 0.085, 16, false]} />
        <meshPhysicalMaterial
          color='#60a5fa'
          emissive={color}
          emissiveIntensity={0.2}
          roughness={0.1}
          metalness={0.8}
          transmission={0.45}
          thickness={0.2}
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* 2. Inner Glowing Core Flow Line */}
      <mesh>
        <tubeGeometry args={[curve, 32, 0.035, 12, false]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.9}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* 3. Animated 3D Oil Droplets / Flow Pulses inside the Pipe */}
      {active && (
        <group ref={particleGroup}>
          {particleOffsets.map((_, i) => (
            <mesh
              key={i}
              ref={(el) => {
                if (el) particlesRef.current[i] = el;
              }}
            >
              <sphereGeometry args={[0.055, 12, 12]} />
              <meshStandardMaterial
                color='#ffffff'
                emissive={color}
                emissiveIntensity={2.5}
                roughness={0.1}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

// 3D Oil Tank Model with fill level and interactive HTML tooltip
function OilTank3D({
  tank,
  isSelected,
  onSelect,
}: {
  tank: TerminalNode3D;
  isSelected: boolean;
  onSelect: (tank: TerminalNode3D) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const tankHeight = tank.isPumpStation ? 0.45 : 0.75;
  const tankRadius = tank.isPumpStation ? 0.28 : 0.42;
  const fillHeight = tankHeight * (tank.fillPct / 100);

  return (
    <group
      position={[tank.pos[0], 0, tank.pos[2]]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(tank);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* 1. Tank Base Concrete Foundation Ring */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[tankRadius * 1.25, tankRadius * 1.3, 0.08, 32]} />
        <meshStandardMaterial color='#334155' roughness={0.7} metalness={0.2} />
      </mesh>

      {/* 2. Cylindrical Steel Tank Shell (Outer) */}
      <mesh position={[0, tankHeight / 2 + 0.08, 0]}>
        <cylinderGeometry args={[tankRadius, tankRadius, tankHeight, 32]} />
        <meshPhysicalMaterial
          color='#e2e8f0'
          emissive={tank.color}
          emissiveIntensity={hovered || isSelected ? 0.35 : 0.1}
          roughness={0.25}
          metalness={0.85}
          clearcoat={0.3}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* 3. Internal Oil Liquid Level Volume */}
      <mesh position={[0, fillHeight / 2 + 0.08, 0]}>
        <cylinderGeometry args={[tankRadius * 0.95, tankRadius * 0.95, fillHeight, 24]} />
        <meshStandardMaterial
          color={tank.color}
          emissive={tank.color}
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>

      {/* 4. Floating Roof Cap / Top Dome */}
      <mesh position={[0, tankHeight + 0.09, 0]}>
        <cylinderGeometry args={[tankRadius * 1.02, tankRadius, 0.04, 32]} />
        <meshStandardMaterial color='#cbd5e1' roughness={0.2} metalness={0.9} />
      </mesh>

      {/* 5. Glowing Base Status Ring */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[tankRadius * 1.25, tankRadius * 1.4, 32]} />
        <meshBasicMaterial
          color={tank.color}
          transparent
          opacity={hovered || isSelected ? 0.9 : 0.4}
        />
      </mesh>

      {/* 6. Physical 3D Roof Seal / Dial Signature */}
      <group position={[0, tankHeight + 0.11, 0]}>
        {/* Dial ring plate */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[tankRadius * 0.45, tankRadius * 0.9, 32]} />
          <meshStandardMaterial
            color={isSelected ? '#10b981' : hovered ? '#4361ee' : '#1e293b'}
            emissive={tank.color}
            emissiveIntensity={isSelected || hovered ? 0.8 : 0.25}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* 3D Etched Fill % Mark on Tank Roof (Tilted for crisp visibility from camera) */}
        <Text
          position={[0, 0.04, 0]}
          rotation={[-Math.PI / 2.4, 0, 0]}
          fontSize={tank.isPumpStation ? 0.13 : 0.18}
          fontWeight={900}
          color='#ffffff'
          anchorX='center'
          anchorY='middle'
          outlineWidth={0.015}
          outlineColor='#0a0f1d'
        >
          {tank.isPumpStation ? tank.code : `${tank.fillPct}%`}
        </Text>

        {/* 3D Code Signature underneath the percentage */}
        <Text
          position={[0, 0.02, 0.16]}
          rotation={[-Math.PI / 2.4, 0, 0]}
          fontSize={0.095}
          fontWeight={700}
          color={isSelected ? '#ffffff' : tank.color}
          anchorX='center'
          anchorY='middle'
          outlineWidth={0.01}
          outlineColor='#0a0f1d'
        >
          {tank.code}
        </Text>
      </group>
    </group>
  );
}

// 3D Full Earth Shadow Curvature & Geographic Landmass
function EarthGlobalShadowCurvature() {
  // World / African continent major landmass contours in shadow projection
  const { africaShape, arabiaShape, madagascarShape } = useMemo(() => {
    // 1. Africa Continent Silhouette
    const aShape = new THREE.Shape();
    // South Africa (Cape)
    aShape.moveTo(1.2, -8.2);
    // West Coast (Namibia -> Angola -> Gulf of Guinea)
    aShape.lineTo(-1.8, -7.0);
    aShape.lineTo(-3.4, -4.5);
    aShape.lineTo(-4.2, -1.8);
    aShape.lineTo(-8.5, 0.4); // West Africa bulge (Liberia / Senegal)
    aShape.lineTo(-9.4, 2.5); // Mauritania / Western Sahara
    aShape.lineTo(-7.5, 6.5); // Morocco / Strait of Gibraltar
    // North Coast (Algeria -> Tunisia -> Libya -> Egypt)
    aShape.lineTo(-3.0, 7.0);
    aShape.lineTo(0.5, 6.8);
    aShape.lineTo(4.5, 5.8); // Nile Delta
    // Red Sea / Horn of Africa
    aShape.lineTo(5.8, 3.2); // Eritrea / Djibouti
    aShape.lineTo(8.2, 1.8); // Somalia Horn (Ras Hafun)
    aShape.lineTo(5.4, -1.2); // East Coast (Kenya / Tanzania)
    aShape.lineTo(4.2, -4.8); // Mozambique
    aShape.lineTo(2.8, -7.2); // South Africa East Coast
    aShape.lineTo(1.2, -8.2);

    // 2. Arabian Peninsula Silhouette
    const arShape = new THREE.Shape();
    arShape.moveTo(5.2, 5.2);
    arShape.lineTo(6.8, 5.8);
    arShape.lineTo(9.5, 4.8);
    arShape.lineTo(9.8, 2.8);
    arShape.lineTo(6.6, 2.2); // Yemen / Bab-el-Mandeb
    arShape.lineTo(5.2, 5.2);

    // 3. Madagascar Island Silhouette
    const mShape = new THREE.Shape();
    mShape.moveTo(6.0, -4.2);
    mShape.lineTo(6.8, -5.2);
    mShape.lineTo(5.8, -7.2);
    mShape.lineTo(5.2, -6.2);
    mShape.lineTo(6.0, -4.2);

    return { africaShape: aShape, arabiaShape: arShape, madagascarShape: mShape };
  }, []);

  return (
    <group position={[0, -0.04, 0]}>
      {/* 1. Global Lat/Long Graticule Grid Lines (Equator, Meridians, Tropics) */}
      <gridHelper args={[26, 26, '#334155', '#1e293b']} position={[0, -0.01, 0]} />

      {/* 2. Deep Earth Global Horizon Shadow Plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[32, 24]} />
        <meshStandardMaterial
          color='#060a14'
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      {/* 3. Africa Continent Shadow Silhouette */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <shapeGeometry args={[africaShape]} />
        <meshStandardMaterial
          color='#0f172a'
          emissive='#1e293b'
          emissiveIntensity={0.2}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* 4. Arabian Peninsula Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <shapeGeometry args={[arabiaShape]} />
        <meshStandardMaterial
          color='#0f172a'
          emissive='#1e293b'
          emissiveIntensity={0.15}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* 5. Madagascar Shadow Island */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <shapeGeometry args={[madagascarShape]} />
        <meshStandardMaterial
          color='#0f172a'
          emissive='#1e293b'
          emissiveIntensity={0.15}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* 6. Glowing Equator Orbital Line across Earth (0° Lat) */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[26, 0.03]} />
        <meshBasicMaterial color='#38bdf8' transparent opacity={0.35} />
      </mesh>

      {/* 7. Subtle Shadow Continent Watermark Labels */}
      <Text
        position={[-3.5, 0.01, -3.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.42}
        fontWeight={800}
        color='#475569'
        fillOpacity={0.25}
        letterSpacing={0.2}
        anchorX='center'
        anchorY='middle'
      >
        AFRICAN CONTINENT
      </Text>

      <Text
        position={[7.5, 0.01, -3.8]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.28}
        fontWeight={700}
        color='#475569'
        fillOpacity={0.25}
        letterSpacing={0.15}
        anchorX='center'
        anchorY='middle'
      >
        ARABIAN PENINSULA
      </Text>

      <Text
        position={[0, 0.01, -0.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.14}
        fontWeight={700}
        color='#38bdf8'
        fillOpacity={0.4}
        letterSpacing={0.12}
        anchorX='center'
        anchorY='middle'
      >
        EQUATOR 0° 00' 00"
      </Text>
    </group>
  );
}

// 3D Kenya Geographic Landmass Highlight & Pipeline Corridor
function KenyaTerrainPlane() {
  const { kenyaShape, borderPoints } = useMemo(() => {
    const shape = new THREE.Shape();

    // Kenya Geographic Boundary Coordinates mapped into 3D scene (x: East-West, y: North-South in 2D shape -> maps to x, z in 3D)
    // 1. South Coast / Mombasa / Shimoni
    shape.moveTo(3.9, -2.4);
    // 2. Indian Ocean Coastline (Mombasa -> Malindi -> Lamu -> Kiunga)
    shape.lineTo(4.4, -1.6);
    shape.lineTo(4.7, -0.6);
    shape.lineTo(4.9, 0.4);
    shape.lineTo(4.8, 1.4);
    // 3. Somalia Eastern Border (Garissa -> Wajir -> Mandera tri-point)
    shape.lineTo(4.6, 2.2);
    shape.lineTo(4.2, 3.1);
    shape.lineTo(3.6, 3.4);
    // 4. Northern Border (Ethiopia & South Sudan: Moyale -> Lake Turkana North)
    shape.lineTo(1.8, 3.5);
    shape.lineTo(0.2, 3.4);
    shape.lineTo(-1.6, 3.5);
    shape.lineTo(-3.2, 3.3);
    shape.lineTo(-4.3, 2.8);
    // 5. Uganda Western Border (Lodwar -> Mt. Elgon -> Busia)
    shape.lineTo(-4.5, 1.6);
    shape.lineTo(-4.6, 0.5);
    shape.lineTo(-4.4, -0.3);
    // 6. Lake Victoria Shoreline (Kisumu -> Homa Bay -> Muhuru Bay)
    shape.lineTo(-4.3, -0.7);
    shape.lineTo(-3.8, -1.2);
    // 7. Tanzania Southern Border (Isebania -> Serengeti -> Namanga / Amboseli -> Taveta / Tsavo -> Shimoni)
    shape.lineTo(-2.2, -1.4);
    shape.lineTo(-0.6, -1.6);
    shape.lineTo(1.2, -1.8);
    shape.lineTo(2.6, -2.1);
    shape.lineTo(3.9, -2.4);

    // Convert shape points to 3D Vector3 array for neon border line
    const points2D = shape.getPoints();
    const points3D = points2D.map(
      (p) => new THREE.Vector3(p.x, 0.02, -p.y)
    );

    return { kenyaShape: shape, borderPoints: points3D };
  }, []);

  const borderLineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(borderPoints);
  }, [borderPoints]);

  return (
    <group position={[0, -0.01, 0]}>
      {/* 1. Full Earth / Africa Global Shadow Background */}
      <EarthGlobalShadowCurvature />

      {/* 2. Highlighted Kenya Country Landmass Shape */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <shapeGeometry args={[kenyaShape]} />
        <meshStandardMaterial
          color='#172554'
          emissive='#1d4ed8'
          emissiveIntensity={0.7}
          roughness={0.35}
          metalness={0.65}
        />
      </mesh>

      {/* 3. Glowing Neon Kenya Frontier Border Line */}
      <lineLoop geometry={borderLineGeometry}>
        <lineBasicMaterial color='#60a5fa' linewidth={3} />
      </lineLoop>

      {/* 4. Raised Outer Halo Glow for Kenya Border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <shapeGeometry args={[kenyaShape]} />
        <meshBasicMaterial
          color='#38bdf8'
          transparent
          opacity={0.22}
          wireframe
        />
      </mesh>

      {/* 5. Indian Ocean Region Shimmer (South-East) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5.4, 0.006, 1.2]}>
        <planeGeometry args={[2.5, 4.2]} />
        <meshStandardMaterial
          color='#0369a1'
          emissive='#0284c7'
          emissiveIntensity={0.45}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.45}
        />
      </mesh>

      {/* 6. Lake Victoria Water Basin (West) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.7, 0.006, 0.6]}>
        <circleGeometry args={[1.1, 24]} />
        <meshStandardMaterial
          color='#0284c7'
          emissive='#0369a1'
          emissiveIntensity={0.55}
          roughness={0.2}
          metalness={0.7}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* 7. 3D Regional Geographic Text Labels */}
      <Text
        position={[0, 0.025, 0.9]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.34}
        fontWeight={900}
        color='#93c5fd'
        fillOpacity={0.6}
        letterSpacing={0.18}
        anchorX='center'
        anchorY='middle'
      >
        KENYA PIPELINE CORRIDOR
      </Text>

      <Text
        position={[5.3, 0.025, 1.8]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.17}
        fontWeight={800}
        color='#38bdf8'
        fillOpacity={0.75}
        letterSpacing={0.12}
        anchorX='center'
        anchorY='middle'
      >
        INDIAN OCEAN (KIPEVU)
      </Text>

      <Text
        position={[-4.7, 0.025, 0.8]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.16}
        fontWeight={800}
        color='#38bdf8'
        fillOpacity={0.75}
        letterSpacing={0.1}
        anchorX='center'
        anchorY='middle'
      >
        LAKE VICTORIA
      </Text>
    </group>
  );
}

export function NetworkMap3D() {
  const [selectedTank, setSelectedTank] = useState<TerminalNode3D>(KENYA_TERMINALS[0]);
  const [activeProduct, setActiveProduct] = useState<string>('all');

  // Fetch real Oil Tank records from Frappe if available
  const { data: dbTanks } = useFrappeGetDocList('Oil Tank', {
    fields: ['name', 'tank_name', 'terminal', 'safe_fill_capacity_kl', 'current_state'],
    limit: 20,
  });

  // Merge live Frappe tank counts & capacities with 3D geo nodes
  const terminals = useMemo(() => {
    return KENYA_TERMINALS.map((t) => {
      if (dbTanks && dbTanks.length > 0) {
        const matchingDb = dbTanks.find(
          (db: any) =>
            db.name === t.id || db.terminal === t.terminal || db.tank_name?.includes(t.code)
        );
        if (matchingDb) {
          const cap = Number(matchingDb.safe_fill_capacity_kl) || t.capacityKL;
          return {
            ...t,
            capacityKL: cap,
          };
        }
      }
      return t;
    });
  }, [dbTanks]);

  return (
    <Card className='w-full border-[#e6edf7] bg-white shadow-sm dark:border-[#233252] dark:bg-[#0f1728]'>
      <CardHeader className='flex flex-wrap items-center justify-between gap-3 border-b border-[#e6edf7] pb-3 dark:border-[#233252]'>
        <div>
          <div className='flex items-center gap-2'>
            <CardTitle className='text-base font-bold text-[#132038] dark:text-foreground'>
              Kenya 3D Pipeline Network & Tank Farm
            </CardTitle>
            <Badge
              variant='outline'
              className='gap-1 border-blue-200 bg-blue-50 text-[#4361ee] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300'
            >
              <Radio className='size-3 animate-pulse text-emerald-500' />
              Live 3D SCADA Flow
            </Badge>
          </div>
          <p className='mt-0.5 text-xs text-[#5c6b85] dark:text-muted-foreground'>
            Real-time oil transit via 3D pipelines from Mombasa Kipevu Port across Nairobi, Nakuru,
            Eldoret & Kisumu
          </p>
        </div>

        {/* Action Controls & Legend */}
        <div className='flex flex-wrap items-center gap-2'>
          <div className='flex items-center gap-1.5 rounded-lg border border-[#e6edf7] bg-slate-50 px-2.5 py-1 text-xs font-medium text-[#5c6b85] dark:border-[#233252] dark:bg-[#131d31] dark:text-slate-300'>
            <Waves className='size-3.5 text-[#4361ee]' />
            Active Trunk: <b className='text-[#132038] dark:text-white'>Line 5 (Mombasa–Nairobi)</b>
          </div>
          <div className='flex items-center gap-1.5 rounded-lg border border-[#e6edf7] bg-slate-50 px-2.5 py-1 text-xs font-medium text-[#5c6b85] dark:border-[#233252] dark:bg-[#131d31] dark:text-slate-300'>
            <Gauge className='size-3.5 text-emerald-500' />
            Main Flow: <b className='text-[#132038] dark:text-white'>1,240 m³/h</b>
          </div>
        </div>
      </CardHeader>

      <CardContent className='p-4'>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
          {/* Main 3D Canvas Viewport */}
          <div className='relative h-[380px] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0e1628] via-[#090e18] to-[#04070d] shadow-inner lg:col-span-8'>
            <Canvas
              dpr={[1, 2]}
              camera={{ position: [0, 6.2, 7.5], fov: 42 }}
              gl={{ antialias: true }}
            >
              <ambientLight intensity={0.7} />
              <directionalLight position={[6, 8, 5]} intensity={2.2} />
              <directionalLight position={[-6, 4, -4]} intensity={0.9} color='#6a8bff' />
              <pointLight position={[0, 3, 0]} intensity={1.8} color='#4361ee' />

              {/* Ambient atmospheric particles */}
              <Sparkles
                count={40}
                scale={12}
                size={2.5}
                speed={0.3}
                color='#60a5fa'
                opacity={0.6}
              />

              <Suspense fallback={null}>
                {/* 1. Kenya Topographic Ground */}
                <KenyaTerrainPlane />

                {/* 2. 3D Oil Pipeline Tubes with Active Flow Streams */}
                <Pipeline3DTube
                  start={terminals[0].pos} // Mombasa
                  end={terminals[1].pos} // Mtito Andei
                  color='#10b981'
                  active={true}
                />
                <Pipeline3DTube
                  start={terminals[1].pos} // Mtito Andei
                  end={terminals[2].pos} // Sultan Hamud
                  color='#10b981'
                  active={true}
                />
                <Pipeline3DTube
                  start={terminals[2].pos} // Sultan Hamud
                  end={terminals[3].pos} // Nairobi
                  color='#f43f5e' // Watch segment
                  active={true}
                />
                <Pipeline3DTube
                  start={terminals[3].pos} // Nairobi
                  end={terminals[4].pos} // Nakuru
                  color='#10b981'
                  active={true}
                />
                <Pipeline3DTube
                  start={terminals[4].pos} // Nakuru
                  end={terminals[5].pos} // Eldoret
                  color='#f59e0b'
                  active={false} // Standby
                />
                <Pipeline3DTube
                  start={terminals[4].pos} // Nakuru
                  end={terminals[6].pos} // Kisumu
                  color='#06b6d4'
                  active={true}
                />

                {/* 3. 3D Oil Tanks with Liquid Levels and Floating Tags */}
                {terminals.map((tank) => (
                  <OilTank3D
                    key={tank.id}
                    tank={tank}
                    isSelected={selectedTank?.id === tank.id}
                    onSelect={(t) => setSelectedTank(t)}
                  />
                ))}
              </Suspense>

              {/* Orbital Camera Navigation */}
              <OrbitControls
                enableZoom={true}
                enablePan={true}
                minDistance={3.5}
                maxDistance={14}
                maxPolarAngle={Math.PI / 2.1}
                dampingFactor={0.08}
                enableDamping
              />
            </Canvas>

            {/* Bottom 3D Canvas Overlay Controls & Tips */}
            <div className='pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 text-xs'>
              <div className='pointer-events-auto flex items-center gap-2 rounded-lg bg-black/70 px-3 py-1.5 text-white/85 backdrop-blur-md border border-white/10'>
                <span className='flex items-center gap-1.5'>
                  <span className='size-2 rounded-full bg-emerald-500 animate-pulse' />
                  Line 5 / Line 4 (Active Oil Stream)
                </span>
                <span className='text-white/40'>•</span>
                <span className='flex items-center gap-1.5'>
                  <span className='size-2 rounded-full bg-rose-500' />
                  Sultan Hamud (Loss Watch)
                </span>
              </div>

              <div className='pointer-events-auto hidden rounded-lg bg-black/70 px-3 py-1.5 text-[11px] text-white/70 backdrop-blur-md border border-white/10 sm:inline'>
                ✦ Left-click &amp; drag to orbit in 3D • Scroll to zoom • Click any tank
              </div>
            </div>
          </div>

          {/* Right Selected Tank & Flow Inspector Panel */}
          <div className='flex flex-col justify-between rounded-2xl border border-[#e6edf7] bg-slate-50/70 p-4 dark:border-[#233252] dark:bg-[#0a101d] lg:col-span-4'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between border-b border-[#e6edf7] pb-3 dark:border-[#233252]'>
                <div>
                  <span className='text-[10.5px] font-bold uppercase tracking-wider text-[#5c6b85] dark:text-slate-400'>
                    Selected Tank &amp; Terminal
                  </span>
                  <h4 className='text-base font-extrabold text-[#132038] dark:text-foreground'>
                    {selectedTank.name}
                  </h4>
                </div>
                <Badge
                  className='font-mono font-bold'
                  style={{ backgroundColor: selectedTank.color, color: '#ffffff' }}
                >
                  {selectedTank.id}
                </Badge>
              </div>

              {/* Product & Tank Capacity Specs */}
              <div className='grid grid-cols-2 gap-2 text-xs'>
                <div className='rounded-xl border border-[#e6edf7] bg-white p-2.5 dark:border-[#233252] dark:bg-[#0f1728]'>
                  <span className='text-[10px] font-semibold text-[#5c6b85] dark:text-slate-400'>
                    Designated Product
                  </span>
                  <p className='mt-0.5 font-bold text-[#132038] dark:text-foreground'>
                    {selectedTank.product}
                  </p>
                </div>
                <div className='rounded-xl border border-[#e6edf7] bg-white p-2.5 dark:border-[#233252] dark:bg-[#0f1728]'>
                  <span className='text-[10px] font-semibold text-[#5c6b85] dark:text-slate-400'>
                    Current State
                  </span>
                  <p className='mt-0.5 flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400'>
                    <span className='size-2 rounded-full bg-emerald-500' />
                    Active In-Service
                  </p>
                </div>
              </div>

              {/* Tank Fill Level Progress Bar */}
              <div className='space-y-1.5 rounded-xl border border-[#e6edf7] bg-white p-3 dark:border-[#233252] dark:bg-[#0f1728]'>
                <div className='flex items-center justify-between text-xs'>
                  <span className='font-semibold text-[#5c6b85] dark:text-slate-400'>
                    Current Stock Fill ({selectedTank.fillPct}%)
                  </span>
                  <span className='font-mono font-bold text-[#132038] dark:text-foreground'>
                    {selectedTank.currentStockKL.toLocaleString()} /{' '}
                    {selectedTank.capacityKL.toLocaleString()} m³
                  </span>
                </div>
                <div className='h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800'>
                  <div
                    className='h-full rounded-full transition-all duration-500'
                    style={{
                      width: `${selectedTank.fillPct}%`,
                      backgroundColor: selectedTank.color,
                    }}
                  />
                </div>
                <div className='flex items-center justify-between pt-1 text-[11px] text-[#5c6b85] dark:text-slate-400'>
                  <span>
                    Ullage:{' '}
                    {(selectedTank.capacityKL - selectedTank.currentStockKL).toLocaleString()} m³
                  </span>
                  <span>Safe Fill Limit: 95%</span>
                </div>
              </div>

              {/* Geographic Coordinates */}
              <div className='flex items-center justify-between rounded-xl border border-[#e6edf7] bg-white px-3 py-2 text-xs dark:border-[#233252] dark:bg-[#0f1728]'>
                <span className='font-medium text-[#5c6b85] dark:text-slate-400'>
                  Geo Coordinates
                </span>
                <span className='font-mono text-[11.5px] font-bold text-[#132038] dark:text-foreground'>
                  {selectedTank.lat.toFixed(4)}° S, {selectedTank.lng.toFixed(4)}° E
                </span>
              </div>
            </div>

            {/* Quick Terminal Switching List */}
            <div className='mt-3 border-t border-[#e6edf7] pt-3 dark:border-[#233252]'>
              <span className='text-[10px] font-bold uppercase tracking-wider text-[#5c6b85] dark:text-slate-400'>
                Quick Select Terminal Node
              </span>
              <div className='mt-1.5 flex flex-wrap gap-1.5'>
                {terminals.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTank(t)}
                    className={`rounded-lg px-2 py-1 text-[11px] font-bold transition-all ${
                      selectedTank.id === t.id
                        ? 'bg-[#4361ee] text-white shadow-xs'
                        : 'bg-white border border-[#e6edf7] text-[#5c6b85] hover:bg-slate-100 dark:bg-[#0f1728] dark:border-[#233252] dark:text-slate-300'
                    }`}
                  >
                    {t.id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
