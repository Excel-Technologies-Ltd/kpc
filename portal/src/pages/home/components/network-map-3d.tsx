import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrbitControls, Sparkles, Text } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Activity, Gauge, Radio, Waves } from 'lucide-react';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { usePipelineScadaNetwork } from '../hooks/use-pipeline-scada-network';

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
  status?: string;
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
    pos: [2.2, 0, 3.79],
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
    pos: [0.68, 0, 2.52],
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
    pos: [-0.14, 0, 1.89],
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
    pos: [-0.69, 0, 1.22],
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
    pos: [-1.44, 0, 0.28],
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
    pos: [-2.26, 0, -0.48],
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
    pos: [-2.77, 0, 0.08],
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
  // World / African continent major landmass contours in accurate spatial projection
  const { africaShape, arabiaShape, madagascarShape } = useMemo(() => {
    // 1. Africa Continent Silhouette (scaled to align with Kenya and South Africa)
    const aShape = new THREE.Shape();
    // South Africa (Cape Agulhas / Cape of Good Hope)
    aShape.moveTo(-1.5, -16.5);
    // South Africa East Coast (Durban / KwaZulu-Natal)
    aShape.lineTo(0.5, -14.2);
    // Mozambique Coast (Maputo -> Beira -> Pemba)
    aShape.lineTo(1.8, -11.5);
    aShape.lineTo(2.4, -8.2);
    aShape.lineTo(2.2, -5.8);
    // Tanzania Coast (Dar es Salaam -> Tanga -> Shimoni)
    aShape.lineTo(2.1, -4.8);
    aShape.lineTo(1.93, -4.41); // Connects to Kenya South Coast (Shimoni)

    // Kenya & Horn of Africa Coastline
    aShape.lineTo(4.05, -1.5); // Kenya/Somalia Coast
    aShape.lineTo(4.8, 0.5); // Mogadishu
    aShape.lineTo(7.8, 3.8); // Ras Hafun / Horn of Africa tip

    // Red Sea / Gulf of Aden / Egypt
    aShape.lineTo(4.5, 4.2); // Bab-el-Mandeb / Djibouti
    aShape.lineTo(1.5, 7.5); // Port Sudan
    aShape.lineTo(-0.8, 11.2); // Sinai / Suez
    aShape.lineTo(-2.2, 11.8); // Alexandria / Nile Delta

    // Mediterranean Coast (Libya -> Tunisia -> Algeria -> Morocco)
    aShape.lineTo(-7.8, 12.0); // Tripoli
    aShape.lineTo(-11.5, 13.5); // Tunis / Cap Blanc
    aShape.lineTo(-16.8, 13.2); // Tangier / Strait of Gibraltar

    // West Africa Atlantic Coast
    aShape.lineTo(-20.5, 7.8); // Mauritania (Cape Blanc)
    aShape.lineTo(-21.2, 5.2); // Dakar (Senegal)
    aShape.lineTo(-18.5, 2.2); // Monrovia (Liberia)
    aShape.lineTo(-14.2, 1.8); // Ivory Coast / Ghana
    aShape.lineTo(-10.5, 1.6); // Nigeria / Niger Delta / Cameroon
    aShape.lineTo(-8.2, -2.5); // Gabon / Congo
    aShape.lineTo(-6.8, -6.5); // Angola (Luanda)
    aShape.lineTo(-5.2, -11.5); // Namibia (Walvis Bay)
    aShape.lineTo(-3.8, -14.8); // Orange River / Western Cape
    aShape.lineTo(-1.5, -16.5); // Cape Agulhas (closes loop)

    // 2. Arabian Peninsula Silhouette
    const arShape = new THREE.Shape();
    arShape.moveTo(4.8, 4.4); // Aden / Yemen
    arShape.lineTo(7.5, 4.8); // Oman
    arShape.lineTo(8.2, 8.5); // Persian Gulf / UAE
    arShape.lineTo(5.2, 10.5); // Kuwait / Iraq
    arShape.lineTo(1.8, 11.2); // Aqaba / Red Sea
    arShape.lineTo(3.2, 6.8); // Jeddah / Saudi Coast
    arShape.lineTo(4.8, 4.4);

    // 3. Madagascar Island Silhouette (Off the coast of Mozambique)
    const mShape = new THREE.Shape();
    mShape.moveTo(4.2, -6.5);
    mShape.lineTo(5.0, -8.5);
    mShape.lineTo(4.4, -12.5);
    mShape.lineTo(3.6, -11.5);
    mShape.lineTo(3.4, -7.5);
    mShape.lineTo(4.2, -6.5);

    return { africaShape: aShape, arabiaShape: arShape, madagascarShape: mShape };
  }, []);

  return (
    <group position={[0, -0.04, 0]}>
      {/* 1. Global Lat/Long Graticule Grid Lines (Equator, Meridians, Tropics) */}
      <gridHelper args={[48, 48, '#334155', '#1e293b']} position={[0, -0.01, 0]} />

      {/* 2. Deep Earth Global Horizon Shadow Plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[56, 48]} />
        <meshStandardMaterial color='#060a14' roughness={0.95} metalness={0.05} />
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
        <planeGeometry args={[48, 0.04]} />
        <meshBasicMaterial color='#38bdf8' transparent opacity={0.35} />
      </mesh>

      {/* 7. Accurate Geographic Watermark Labels */}
      <Text
        position={[-10.5, 0.01, -2.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.48}
        fontWeight={800}
        color='#475569'
        fillOpacity={0.22}
        letterSpacing={0.2}
        anchorX='center'
        anchorY='middle'
      >
        AFRICAN CONTINENT
      </Text>

      <Text
        position={[-0.5, 0.01, 15.0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.32}
        fontWeight={700}
        color='#475569'
        fillOpacity={0.22}
        letterSpacing={0.15}
        anchorX='center'
        anchorY='middle'
      >
        SOUTH AFRICA
      </Text>

      <Text
        position={[5.5, 0.01, -7.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.28}
        fontWeight={700}
        color='#475569'
        fillOpacity={0.22}
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
  const { kenyaShape, borderPoints, lakeVictoriaShape, lakeTurkanaShape } = useMemo(() => {
    const shape = new THREE.Shape();

    // Geographically mapped boundary for Kenya (scaled to 3D scene):
    // 1. South Coast / Shimoni / Vanga (Tanzania border on Indian Ocean)
    shape.moveTo(1.93, -4.41);

    // 2. Indian Ocean Coastline (Mombasa -> Malindi -> Lamu -> Kiunga)
    shape.lineTo(2.2, -3.79); // Mombasa / Diani
    shape.lineTo(2.63, -3.0); // Malindi / Watamu
    shape.lineTo(3.44, -2.16); // Lamu Archipelago
    shape.lineTo(4.05, -1.5); // Kiunga / Ras Chiamboni (Somalia coastal border)

    // 3. Somalia Eastern Border (Garissa East -> Wajir -> Mandera Horn)
    shape.lineTo(3.6, -0.7); // Kolbio
    shape.lineTo(3.35, 0.1); // Liboi / Garissa sector
    shape.lineTo(3.4, 1.4); // Dif / Wajir East
    shape.lineTo(3.44, 2.63); // El Wak
    shape.lineTo(4.46, 3.75); // Mandera Tripoint (Northeastern Horn peak)

    // 4. Northern Ethiopia Border (Mandera -> Moyale -> Lake Turkana North)
    shape.lineTo(3.0, 3.5); // Dawa River / Malkamari
    shape.lineTo(1.52, 3.29); // Moyale border
    shape.lineTo(0.5, 3.4); // Sololo / Turbi
    shape.lineTo(-0.4, 3.55); // North Marsabit / Forolle
    shape.lineTo(-1.3, 4.0); // Illeret (East Turkana shore)
    shape.lineTo(-1.52, 4.22); // Todonyang / Omo Delta (North Turkana)

    // 5. South Sudan / Northwest Ilemi Triangle Border
    shape.lineTo(-2.8, 4.15); // Kibish / Lokichogio north
    shape.lineTo(-3.55, 4.04); // Northwest tripoint (South Sudan / Uganda / Kenya)

    // 6. Uganda Western Border (Karamoja -> Mt. Elgon -> Busia)
    shape.lineTo(-3.3, 2.5); // Moroto / Turkana escarpment
    shape.lineTo(-2.94, 1.04); // Mt. Elgon summit / Kitale west
    shape.lineTo(-3.44, 0.38); // Malaba / Busia

    // 7. Lake Victoria Shoreline & Winam Gulf (Kisumu port)
    shape.lineTo(-3.3, 0.15); // Sio Port / North Winam
    shape.lineTo(-2.78, -0.1); // Winam Gulf (Kisumu Port)
    shape.lineTo(-3.4, -0.45); // Homa Bay / Mbita Point
    shape.lineTo(-3.35, -1.04); // Karungu / Muhuru Bay (Tanzania border on Lake Victoria)

    // 8. Tanzania Southern Border (Straight diagonal from Lake Victoria to Indian Ocean)
    shape.lineTo(-3.1, -1.25); // Isebania / Migori
    shape.lineTo(-2.0, -1.75); // Masai Mara / Serengeti
    shape.lineTo(-0.71, -2.35); // Namanga / Amboseli / Kilimanjaro base
    shape.lineTo(0.2, -3.19); // Taveta / Tsavo West
    shape.lineTo(1.2, -3.85); // Lunga Lunga
    shape.lineTo(1.93, -4.41); // Shimoni / Vanga (closes polygon)

    // Lake Victoria Shape (Western water basin)
    const lvShape = new THREE.Shape();
    lvShape.moveTo(-2.78, -0.1); // Winam Gulf / Kisumu
    lvShape.lineTo(-3.3, 0.15); // North Gulf
    lvShape.lineTo(-3.44, 0.38); // Busia
    lvShape.lineTo(-4.8, 0.5); // Uganda West Victoria
    lvShape.lineTo(-5.2, -0.6); // Ssesse / Entebbe offshore
    lvShape.lineTo(-4.5, -1.4); // Tanzania South Victoria
    lvShape.lineTo(-3.35, -1.04); // Muhuru Bay
    lvShape.lineTo(-3.4, -0.45); // Homa Bay
    lvShape.lineTo(-2.78, -0.1);

    // Lake Turkana Shape (Northern Great Rift Valley lake)
    const ltShape = new THREE.Shape();
    ltShape.moveTo(-1.52, 4.22); // Todonyang / Omo Delta
    ltShape.lineTo(-1.3, 4.0); // Illeret
    ltShape.lineTo(-1.35, 3.1); // Central Island / Allia Bay
    ltShape.lineTo(-1.5, 2.1); // Loiyangalani / South Island
    ltShape.lineTo(-1.75, 2.2); // Eliye Springs / Turkwell Delta
    ltShape.lineTo(-1.85, 3.3); // Kalokol / Ferguson Gulf
    ltShape.lineTo(-1.7, 4.15); // Lowarengak
    ltShape.lineTo(-1.52, 4.22);

    // Convert shape points to 3D Vector3 array for neon border line
    const points2D = shape.getPoints();
    const points3D = points2D.map((p) => new THREE.Vector3(p.x, 0.02, -p.y));

    return {
      kenyaShape: shape,
      borderPoints: points3D,
      lakeVictoriaShape: lvShape,
      lakeTurkanaShape: ltShape,
    };
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
          emissiveIntensity={0.65}
          roughness={0.35}
          metalness={0.65}
        />
      </mesh>

      {/* 3. Glowing Neon Kenya Frontier Border Line */}
      <lineLoop geometry={borderLineGeometry}>
        <lineBasicMaterial color='#60a5fa' linewidth={3} />
      </lineLoop>

      {/* 4. Raised Outer Wireframe Grid for Kenya Landmass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <shapeGeometry args={[kenyaShape]} />
        <meshBasicMaterial color='#38bdf8' transparent opacity={0.18} wireframe />
      </mesh>

      {/* 5. Indian Ocean Region Shimmer (South-East of Coastline) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.6, 0.006, 3.2]}>
        <planeGeometry args={[4.2, 5.5]} />
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <shapeGeometry args={[lakeVictoriaShape]} />
        <meshStandardMaterial
          color='#0284c7'
          emissive='#0369a1'
          emissiveIntensity={0.65}
          roughness={0.2}
          metalness={0.7}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* 7. Lake Turkana Water Body (North) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <shapeGeometry args={[lakeTurkanaShape]} />
        <meshStandardMaterial
          color='#0284c7'
          emissive='#0369a1'
          emissiveIntensity={0.65}
          roughness={0.2}
          metalness={0.7}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* 8. 3D Regional Geographic Text Labels */}
      <Text
        position={[0.2, 0.025, 0.6]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.32}
        fontWeight={900}
        color='#93c5fd'
        fillOpacity={0.65}
        letterSpacing={0.16}
        anchorX='center'
        anchorY='middle'
      >
        KENYA PIPELINE CORRIDOR
      </Text>

      <Text
        position={[4.6, 0.025, 3.6]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.16}
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
        position={[-4.2, 0.025, 0.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.15}
        fontWeight={800}
        color='#38bdf8'
        fillOpacity={0.75}
        letterSpacing={0.1}
        anchorX='center'
        anchorY='middle'
      >
        LAKE VICTORIA
      </Text>

      <Text
        position={[-1.55, 0.025, -3.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.13}
        fontWeight={800}
        color='#38bdf8'
        fillOpacity={0.7}
        letterSpacing={0.1}
        anchorX='center'
        anchorY='middle'
      >
        LAKE TURKANA
      </Text>

      <Text
        position={[4.0, 0.025, -3.6]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.12}
        fontWeight={800}
        color='#64748b'
        fillOpacity={0.6}
        letterSpacing={0.08}
        anchorX='center'
        anchorY='middle'
      >
        MANDERA TRIANGLE
      </Text>

      {/* Neighboring Country Identifiers */}
      <Text
        position={[-4.6, 0.015, -1.8]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.18}
        fontWeight={800}
        color='#475569'
        fillOpacity={0.35}
        letterSpacing={0.14}
        anchorX='center'
        anchorY='middle'
      >
        UGANDA
      </Text>

      <Text
        position={[0, 0.015, 4.8]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.18}
        fontWeight={800}
        color='#475569'
        fillOpacity={0.35}
        letterSpacing={0.14}
        anchorX='center'
        anchorY='middle'
      >
        TANZANIA
      </Text>

      <Text
        position={[1.2, 0.015, -4.4]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.18}
        fontWeight={800}
        color='#475569'
        fillOpacity={0.35}
        letterSpacing={0.14}
        anchorX='center'
        anchorY='middle'
      >
        ETHIOPIA
      </Text>

      <Text
        position={[5.0, 0.015, -0.6]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.18}
        fontWeight={800}
        color='#475569'
        fillOpacity={0.35}
        letterSpacing={0.14}
        anchorX='center'
        anchorY='middle'
      >
        SOMALIA
      </Text>
    </group>
  );
}

// Responsive Camera Controller: auto-fits the entire 3D Kenya Map whenever screen size changes
function ResponsiveCameraAdjuster() {
  const { camera, size } = useThree();

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const aspect = size.width / Math.max(size.height, 1);

      // Dynamically adjust camera height & distance to keep entire Kenya territory in view on any window width
      if (aspect < 0.85) {
        // Mobile portrait (< 600px width)
        camera.position.set(0.4, 11.5, 11.2);
        camera.fov = 56;
      } else if (aspect < 1.25) {
        // Tablet / Split screen (< 900px width)
        camera.position.set(0.4, 9.6, 9.2);
        camera.fov = 50;
      } else if (aspect < 1.65) {
        // Laptop / Small desktop (< 1300px width)
        camera.position.set(0.4, 8.2, 8.2);
        camera.fov = 46;
      } else {
        // Wide Desktop (>= 1300px width)
        camera.position.set(0.4, 7.2, 7.6);
        camera.fov = 43;
      }
      camera.lookAt(0.4, 0, 0);
      camera.updateProjectionMatrix();
    }
  }, [size.width, size.height, camera]);

  return null;
}

export function NetworkMap3D() {
  const { data: scadaData, isLoading: scadaLoading } = usePipelineScadaNetwork();

  // Merge live Frappe backend data with the calibrated 3D geo-spatial positions
  const terminals: TerminalNode3D[] = useMemo(() => {
    if (!scadaData || !scadaData.terminals || scadaData.terminals.length === 0) {
      return KENYA_TERMINALS;
    }

    // Build lookup map of backend terminals by code/name
    const backendMap = new Map<string, any>();
    scadaData.terminals.forEach((term) => {
      backendMap.set(term.terminal_code, term);
      if (term.terminal_code === 'NBO-01') {
        backendMap.set('NBI-01', term);
        backendMap.set('NBI-T01', term);
      }
    });

    return KENYA_TERMINALS.map((base) => {
      const match =
        backendMap.get(base.code) ||
        backendMap.get(base.terminal) ||
        backendMap.get(base.id);

      if (match) {
        const capacity = match.total_capacity_kl > 0 ? match.total_capacity_kl : base.capacityKL;
        const currentStock = match.current_stock_kl > 0 ? match.current_stock_kl : base.currentStockKL;
        const fillPct = match.total_capacity_kl > 0 ? match.fill_pct : base.fillPct;

        return {
          ...base,
          name: match.terminal_name || base.name,
          lat: match.latitude && Math.abs(match.latitude) > 0 ? match.latitude : base.lat,
          lng: match.longitude && Math.abs(match.longitude) > 0 ? match.longitude : base.lng,
          product: match.primary_product || base.product,
          capacityKL: capacity,
          currentStockKL: currentStock,
          fillPct: fillPct,
          status: match.status || 'Active In-Service',
        };
      }

      return base;
    });
  }, [scadaData]);

  const [selectedCode, setSelectedCode] = useState<string>('MSA-01');

  const selectedTank = useMemo(() => {
    return terminals.find((t) => t.code === selectedCode || t.id === selectedCode) || terminals[0];
  }, [terminals, selectedCode]);

  const telemetry = scadaData?.telemetry;
  const segments = scadaData?.segments;

  return (
    <Card className='w-full overflow-hidden border-[#e6edf7] bg-white shadow-sm dark:border-[#233252] dark:bg-[#0f1728]'>
      <CardHeader className='flex flex-col gap-3 border-b border-[#e6edf7] p-3.5 pb-3 sm:p-5 sm:pb-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-[#233252]'>
        <div className='min-w-0 space-y-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <CardTitle className='text-base font-bold text-[#132038] sm:text-lg dark:text-foreground'>
              Kenya 3D Pipeline Network &amp; Tank Farm
            </CardTitle>
            <Badge
              variant='outline'
              className='gap-1 border-blue-200 bg-blue-50 text-[11px] text-[#4361ee] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300'
            >
              <Radio className='size-3 animate-pulse text-emerald-500' />
              {scadaData ? 'Live Backend SCADA' : 'Live 3D SCADA Flow'}
            </Badge>
          </div>
          <p className='text-xs text-[#5c6b85] dark:text-muted-foreground'>
            Real-time oil transit via 3D pipelines from Mombasa Kipevu Port across Nairobi, Nakuru,
            Eldoret &amp; Kisumu
          </p>
        </div>

        {/* Action Controls & Legend */}
        <div className='flex flex-wrap items-center gap-2 text-xs'>
          <div className='inline-flex items-center gap-1.5 rounded-lg border border-[#e6edf7] bg-slate-50 px-2.5 py-1 font-medium text-[#5c6b85] dark:border-[#233252] dark:bg-[#131d31] dark:text-slate-300'>
            <Waves className='size-3.5 shrink-0 text-[#4361ee]' />
            <span className='whitespace-nowrap'>
              Trunk:{' '}
              <b className='text-[#132038] dark:text-white'>
                {telemetry?.trunk_name || 'Line 5'}
              </b>
            </span>
          </div>
          <div className='inline-flex items-center gap-1.5 rounded-lg border border-[#e6edf7] bg-slate-50 px-2.5 py-1 font-medium text-[#5c6b85] dark:border-[#233252] dark:bg-[#131d31] dark:text-slate-300'>
            <Gauge className='size-3.5 shrink-0 text-emerald-500' />
            <span className='whitespace-nowrap'>
              Flow:{' '}
              <b className='text-[#132038] dark:text-white'>
                {telemetry?.flow_rate_m3h
                  ? `${telemetry.flow_rate_m3h.toLocaleString()} m³/h`
                  : '1,240 m³/h'}
              </b>
            </span>
          </div>
          {telemetry?.pressure_bar ? (
            <div className='hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#e6edf7] bg-slate-50 px-2.5 py-1 font-medium text-[#5c6b85] dark:border-[#233252] dark:bg-[#131d31] dark:text-slate-300'>
              <Activity className='size-3.5 shrink-0 text-cyan-500' />
              <span className='whitespace-nowrap'>
                Pressure: <b className='text-[#132038] dark:text-white'>{telemetry.pressure_bar.toFixed(1)} bar</b>
              </span>
            </div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className='space-y-3.5 p-3 sm:p-4'>
        {/* Row 1: Fluid 4-Card Telemetry Grid (1 col on mobile, 2 cols on tablet, 4 cols on desktop) */}
        <div className='rounded-2xl border border-[#e6edf7] bg-slate-50/80 p-2.5 sm:p-3.5 dark:border-[#233252] dark:bg-[#0a101d]'>
          <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4'>
            {/* Card 1: Selected Terminal Node & Quick Selector */}
            <div className='flex min-w-0 flex-col justify-between space-y-2 rounded-xl border border-[#e6edf7] bg-white p-3 shadow-2xs dark:border-[#233252] dark:bg-[#0f1728]'>
              <div className='flex items-center justify-between gap-1.5'>
                <div className='min-w-0'>
                  <span className='text-[10px] font-bold tracking-wider uppercase text-[#5c6b85] dark:text-slate-400'>
                    Terminal Node
                  </span>
                  <h4 className='truncate text-xs font-extrabold text-[#132038] sm:text-sm dark:text-foreground'>
                    {selectedTank.name}
                  </h4>
                </div>
                <Badge
                  className='shrink-0 font-mono text-[10.5px] font-bold text-white shadow-2xs'
                  style={{ backgroundColor: selectedTank.color }}
                >
                  {selectedTank.id}
                </Badge>
              </div>

              {/* Quick Select Terminal Pills */}
              <div className='flex flex-wrap items-center gap-1 pt-0.5'>
                {terminals.map((t) => {
                  const isActive = selectedTank.code === t.code || selectedTank.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedCode(t.code)}
                      className={`cursor-pointer rounded-md px-1.5 py-0.5 text-[10.5px] font-bold transition-all ${
                        isActive
                          ? 'bg-[#4361ee] text-white shadow-2xs'
                          : 'border border-[#e6edf7] bg-slate-50 text-[#5c6b85] hover:bg-slate-100 dark:border-[#233252] dark:bg-[#131d31] dark:text-slate-300 dark:hover:bg-[#1b2842]'
                      }`}
                    >
                      {t.code}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card 2: Designated Product & Live State */}
            <div className='flex min-w-0 flex-col justify-between space-y-2 rounded-xl border border-[#e6edf7] bg-white p-3 shadow-2xs dark:border-[#233252] dark:bg-[#0f1728]'>
              <div>
                <span className='text-[10px] font-semibold text-[#5c6b85] dark:text-slate-400'>
                  Designated Product
                </span>
                <p className='mt-0.5 truncate text-sm font-extrabold text-[#132038] dark:text-foreground'>
                  {selectedTank.product}
                </p>
              </div>
              <div className='flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400'>
                <span className='size-2 rounded-full bg-emerald-500 animate-pulse' />
                {selectedTank.status || 'Active In-Service'}
              </div>
            </div>

            {/* Card 3: Live SCADA GPS Coordinates */}
            <div className='flex min-w-0 flex-col justify-between space-y-2 rounded-xl border border-[#e6edf7] bg-white p-3 shadow-2xs dark:border-[#233252] dark:bg-[#0f1728]'>
              <div>
                <span className='text-[10px] font-semibold text-[#5c6b85] dark:text-slate-400'>
                  Geo Coordinates
                </span>
                <p className='mt-0.5 font-mono text-xs font-bold text-[#132038] sm:text-sm dark:text-foreground'>
                  {Math.abs(selectedTank.lat).toFixed(4)}° {selectedTank.lat >= 0 ? 'N' : 'S'}
                </p>
              </div>
              <p className='font-mono text-xs text-[#5c6b85] dark:text-slate-400'>
                {selectedTank.lng.toFixed(4)}° E
              </p>
            </div>

            {/* Card 4: Current Stock Fill & Ullage */}
            <div className='flex min-w-0 flex-col justify-between space-y-2 rounded-xl border border-[#e6edf7] bg-white p-3 shadow-2xs dark:border-[#233252] dark:bg-[#0f1728]'>
              <div className='flex items-center justify-between text-xs'>
                <span className='font-semibold text-[#5c6b85] dark:text-slate-400'>
                  Stock Fill ({selectedTank.fillPct}%)
                </span>
                <span className='font-mono text-[11px] font-bold text-[#132038] dark:text-foreground'>
                  {selectedTank.currentStockKL.toLocaleString()} /{' '}
                  {selectedTank.capacityKL.toLocaleString()} m³
                </span>
              </div>
              <div className='h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800'>
                <div
                  className='h-full rounded-full transition-all duration-500'
                  style={{
                    width: `${Math.min(100, Math.max(0, selectedTank.fillPct))}%`,
                    backgroundColor: selectedTank.color,
                  }}
                />
              </div>
              <div className='flex items-center justify-between text-[10px] text-[#5c6b85] dark:text-slate-400'>
                <span>
                  Ullage: {Math.max(0, selectedTank.capacityKL - selectedTank.currentStockKL).toLocaleString()}{' '}
                  m³
                </span>
                <span>Safe: 95%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Full-Width 3D Kenya Pipeline SCADA Network Canvas */}
        <div className='relative h-95 w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-linear-to-b from-[#0e1628] via-[#090e18] to-[#04070d] shadow-inner sm:h-[460px] md:h-[500px] lg:h-[540px]'>
          <Canvas
            dpr={[1, 2]}
            camera={{ position: [0.4, 7.6, 7.8], fov: 46 }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            className='h-full w-full touch-none'
          >
            {/* Automatic camera framing controller that reacts to any window or container resize */}
            <ResponsiveCameraAdjuster />

            <ambientLight intensity={0.7} />
            <directionalLight position={[6, 8, 5]} intensity={2.2} />
            <directionalLight position={[-6, 4, -4]} intensity={0.9} color='#6a8bff' />
            <pointLight position={[0.4, 3, 0]} intensity={1.8} color='#4361ee' />

            {/* Ambient atmospheric particles */}
            <Sparkles count={45} scale={14} size={2.5} speed={0.3} color='#60a5fa' opacity={0.6} />

            <Suspense fallback={null}>
              {/* 1. Kenya Topographic Ground */}
              <KenyaTerrainPlane />

              {/* 2. 3D Oil Pipeline Tubes with Active Flow Streams */}
              {segments && segments.length > 0 ? (
                segments.map((seg) => {
                  const startNode = terminals.find(
                    (t) => t.code === seg.from_node || t.terminal === seg.from_node || t.id.startsWith(seg.from_node)
                  );
                  const endNode = terminals.find(
                    (t) => t.code === seg.to_node || t.terminal === seg.to_node || t.id.startsWith(seg.to_node)
                  );
                  if (!startNode || !endNode) return null;
                  return (
                    <Pipeline3DTube
                      key={seg.id}
                      start={startNode.pos}
                      end={endNode.pos}
                      color={seg.color}
                      active={seg.is_active}
                    />
                  );
                })
              ) : (
                <>
                  <Pipeline3DTube
                    start={terminals[0]?.pos || [2.2, 0, 3.79]} // Mombasa
                    end={terminals[1]?.pos || [0.68, 0, 2.52]} // Mtito Andei
                    color='#10b981'
                    active={true}
                  />
                  <Pipeline3DTube
                    start={terminals[1]?.pos || [0.68, 0, 2.52]} // Mtito Andei
                    end={terminals[2]?.pos || [-0.14, 0, 1.89]} // Sultan Hamud
                    color='#10b981'
                    active={true}
                  />
                  <Pipeline3DTube
                    start={terminals[2]?.pos || [-0.14, 0, 1.89]} // Sultan Hamud
                    end={terminals[3]?.pos || [-0.69, 0, 1.22]} // Nairobi
                    color={telemetry?.alert_active ? '#f43f5e' : '#10b981'}
                    active={true}
                  />
                  <Pipeline3DTube
                    start={terminals[3]?.pos || [-0.69, 0, 1.22]} // Nairobi
                    end={terminals[4]?.pos || [-1.44, 0, 0.28]} // Nakuru
                    color='#10b981'
                    active={true}
                  />
                  <Pipeline3DTube
                    start={terminals[4]?.pos || [-1.44, 0, 0.28]} // Nakuru
                    end={terminals[5]?.pos || [-2.26, 0, -0.48]} // Eldoret
                    color='#f59e0b'
                    active={false} // Standby
                  />
                  <Pipeline3DTube
                    start={terminals[4]?.pos || [-1.44, 0, 0.28]} // Nakuru
                    end={terminals[6]?.pos || [-2.77, 0, 0.08]} // Kisumu
                    color='#06b6d4'
                    active={true}
                  />
                </>
              )}

              {/* 3. 3D Oil Tanks with Liquid Levels and Floating Tags */}
              {terminals.map((tank) => (
                <OilTank3D
                  key={tank.id}
                  tank={tank}
                  isSelected={selectedTank?.code === tank.code || selectedTank?.id === tank.id}
                  onSelect={(t) => setSelectedCode(t.code)}
                />
              ))}
            </Suspense>

            {/* Orbital Camera Navigation */}
            <OrbitControls
              makeDefault
              target={[0.4, 0, 0]}
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
            <div className='pointer-events-auto flex items-center gap-2 rounded-xl border border-white/10 bg-black/75 px-2.5 py-1.5 text-white/85 backdrop-blur-md sm:px-3'>
              <span className='flex items-center gap-1.5 text-[11px] sm:text-xs'>
                <span className='size-2 rounded-full bg-emerald-500 animate-pulse' />
                {telemetry?.status_label || 'Line 5 / Line 4 (Active Flow)'}
              </span>
              <span className='text-white/40'>•</span>
              <span className='flex items-center gap-1.5 text-[11px] sm:text-xs'>
                <span
                  className={`size-2 rounded-full ${
                    telemetry?.alert_active ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                  }`}
                />
                {telemetry?.watch_segment || 'Sultan Hamud (Watch)'}
              </span>
            </div>

            <div className='pointer-events-auto hidden rounded-xl border border-white/10 bg-black/75 px-3 py-1.5 text-[11px] text-white/75 backdrop-blur-md sm:inline'>
              ✦ Drag to orbit • Scroll to zoom • Click any tank
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
