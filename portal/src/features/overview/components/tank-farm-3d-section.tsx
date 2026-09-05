import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { OIL_TANK_DOCTYPE, TANK_MEASUREMENT_DOCTYPE } from '@/constants/doctype.string';
import { cn } from '@/lib/utils';
import { Html, OrbitControls, Sparkles } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { Boxes, Pause, Play, RotateCcw, Thermometer } from 'lucide-react';
import { Suspense, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

interface OilTankDoc {
  name: string;
  tank_name?: string;
  tank_code?: string;
  terminal?: string;
  product?: string;
  current_state?: 'Active' | 'Maintenance' | 'Quarantine' | 'Decommissioned' | string;
  capacity_kl?: number;
  safe_fill_capacity_kl?: number;
  reference_height_mm?: number;
}

interface TankMeasurementDoc {
  name: string;
  tank: string;
  observed_level_mm?: number;
  observed_temperature_c?: number;
  net_standard_volume_kl?: number;
  measurement_datetime?: string;
}

interface ProcessedTank {
  id: string;
  code: string;
  name: string;
  terminal: string;
  product: string;
  level: number;
  levelPercent: number;
  temp: string;
  status: 'active' | 'maint' | 'quarantine' | 'other';
  statusLabel: string;
  color: string;
  volumeKl?: number;
  capacityKl?: number;
}

const STATUS_CONFIG: Record<
  string,
  {
    color: string;
    badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
    label: string;
    statusKey: 'active' | 'maint' | 'quarantine' | 'other';
  }
> = {
  active: {
    color: '#33C9B7',
    badgeVariant: 'default',
    label: 'Active',
    statusKey: 'active',
  },
  maint: {
    color: '#F0A83C',
    badgeVariant: 'outline',
    label: 'Maintenance',
    statusKey: 'maint',
  },
  quarantine: {
    color: '#E5555C',
    badgeVariant: 'destructive',
    label: 'Quarantined',
    statusKey: 'quarantine',
  },
  other: {
    color: '#5A6D8C',
    badgeVariant: 'secondary',
    label: 'Idle',
    statusKey: 'other',
  },
};

function Tank3D({
  data,
  position,
  isSelected,
  onSelect,
}: {
  data: ProcessedTank;
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const liquidRef = useRef<THREE.Mesh>(null);
  const liquidTopRef = useRef<THREE.Mesh>(null);
  const height = 3.0;
  const radius = 0.85;

  const clampedLevel = Math.max(0, Math.min(1, data.level));
  const liquidHeight = clampedLevel > 0 ? Math.max(0.12, (height - 0.08) * clampedLevel) : 0.04;
  const baseLiquidY = -height / 2 + liquidHeight / 2 + 0.04;

  useFrame((state) => {
    const wave = Math.sin(state.clock.elapsedTime * 1.6 + position[0] * 2) * 0.012;
    if (liquidRef.current) {
      liquidRef.current.position.y = baseLiquidY + wave;
    }
    if (liquidTopRef.current) {
      liquidTopRef.current.position.y = -height / 2 + liquidHeight + wave;
    }
  });

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Base Pedestal */}
      <mesh position={[0, -height / 2 - 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius + 0.18, radius + 0.28, 0.3, 36]} />
        <meshStandardMaterial color='#141F35' roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Selected Ground Glow Ring */}
      {isSelected && (
        <mesh position={[0, -height / 2 - 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius + 0.35, radius + 0.58, 36]} />
          <meshBasicMaterial
            color={data.color}
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Liquid Body & Top Surface */}
      {clampedLevel > 0 && (
        <group>
          <mesh ref={liquidRef} position={[0, baseLiquidY, 0]}>
            <cylinderGeometry args={[radius - 0.06, radius - 0.06, liquidHeight, 36]} />
            <meshStandardMaterial
              color={data.color}
              emissive={data.color}
              emissiveIntensity={isSelected ? 0.9 : 0.65}
              roughness={0.15}
              metalness={0.1}
            />
          </mesh>

          <mesh
            ref={liquidTopRef}
            position={[0, -height / 2 + liquidHeight, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[radius - 0.07, 36]} />
            <meshStandardMaterial
              color={data.color}
              emissive={data.color}
              emissiveIntensity={isSelected ? 1.1 : 0.85}
              roughness={0.1}
            />
          </mesh>
        </group>
      )}

      {/* Semi-Transparent Glass Outer Shell */}
      <mesh renderOrder={1}>
        <cylinderGeometry args={[radius, radius, height, 36, 1, true]} />
        <meshStandardMaterial
          color='#9db8d9'
          transparent
          opacity={isSelected ? 0.32 : 0.22}
          depthWrite={false}
          roughness={0.1}
          metalness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Tank Top Cap */}
      <mesh position={[0, height / 2 + 0.04, 0]}>
        <cylinderGeometry args={[radius + 0.06, radius + 0.06, 0.08, 36]} />
        <meshStandardMaterial color='#1c2b4a' roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Status Beacon Sphere */}
      <mesh position={[radius + 0.02, height / 2 + 0.04, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={2.0} />
      </mesh>

      {/* 2D Floating Tag */}
      <Html position={[0, height / 2 + 0.58, 0]} center distanceFactor={10} zIndexRange={[10, 0]}>
        <div
          style={{
            fontSize: '11px',
            color: '#EAF1FA',
            background: isSelected ? 'rgba(15, 23, 42, 0.98)' : 'rgba(12, 19, 34, 0.92)',
            border: isSelected ? `2px solid ${data.color}` : `1px solid ${data.color}77`,
            boxShadow: isSelected ? `0 0 16px ${data.color}cc` : '0 2px 8px rgba(0, 0, 0, 0.45)',
            borderRadius: '6px',
            padding: '5px 10px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            textAlign: 'center',
            transform: isSelected ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 0.2s ease',
          }}
        >
          <div
            style={{
              fontWeight: 700,
              letterSpacing: '0.02em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
            }}
          >
            {isSelected && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: data.color,
                }}
              />
            )}
            {data.code || data.name}
          </div>
          <div
            style={{
              color: data.color,
              fontSize: '10.5px',
              marginTop: '2px',
              fontWeight: 600,
            }}
          >
            {data.levelPercent}% · {data.product}
          </div>
        </div>
      </Html>
    </group>
  );
}

function Scene3D({
  tanks,
  selectedTankId,
  onSelectTank,
  autoRotate,
}: {
  tanks: ProcessedTank[];
  selectedTankId: string | null;
  onSelectTank: (id: string) => void;
  autoRotate: boolean;
}) {
  const count = tanks.length;

  const positions: [number, number, number][] = useMemo(() => {
    if (count <= 4) {
      const dx = count > 1 ? Math.min(3.4, 11 / (count - 1)) : 0;
      return tanks.map((_, i) => {
        const x = (i - (count - 1) / 2) * dx;
        const z = i % 2 === 1 ? 0.8 : -0.6;
        return [x, 0, z] as [number, number, number];
      });
    }

    const cols = Math.ceil(count / 2);
    const spacingX = Math.min(3.2, 16 / (cols - 1 || 1));
    return tanks.map((_, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const colsInThisRow = row === 0 ? cols : count - cols;
      const x = (col - (colsInThisRow - 1) / 2) * spacingX;
      const z = row === 0 ? -1.6 : 1.6;
      return [x, 0, z] as [number, number, number];
    });
  }, [count, tanks]);

  const selectedPos = useMemo(() => {
    if (!selectedTankId) return null;
    const idx = tanks.findIndex((t) => t.id === selectedTankId);
    if (idx === -1 || !positions[idx]) return null;
    return positions[idx];
  }, [selectedTankId, tanks, positions]);

  return (
    <>
      <fog attach='fog' args={['#080D16', 10, 30]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 8, 5]} intensity={1.2} castShadow />
      <pointLight position={[-6, 3, -4]} intensity={0.65} color='#F0A83C' />
      <pointLight position={[6, 3, 4]} intensity={0.65} color='#33C9B7' />

      <Sparkles
        count={count > 4 ? 80 : 50}
        scale={[24, 6, 16]}
        size={2}
        speed={0.25}
        color='#33C9B7'
        opacity={0.35}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.65, 0]} receiveShadow>
        <planeGeometry args={[44, 32]} />
        <shadowMaterial opacity={0.35} />
      </mesh>
      <gridHelper args={[36, 36, '#1a2540', '#101a2c']} position={[0, -1.64, 0]} />

      {tanks.map((tank, idx) => (
        <Tank3D
          key={tank.id}
          data={tank}
          position={positions[idx]}
          isSelected={selectedTankId === tank.id}
          onSelect={() => onSelectTank(tank.id)}
        />
      ))}

      <OrbitControls
        enablePan={true}
        minDistance={5}
        maxDistance={25}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate={autoRotate && !selectedTankId}
        autoRotateSpeed={0.35}
        enableDamping
        dampingFactor={0.08}
        target={selectedPos ? [selectedPos[0], 0.2, selectedPos[2]] : [0, 0.1, 0]}
      />
    </>
  );
}

export function TankFarm3DSection() {
  const [selectedTerminal, setSelectedTerminal] = useState<string>('all');
  const [selectedTankId, setSelectedTankId] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [cameraKey, setCameraKey] = useState<number>(0);

  const { data: rawTanks, isLoading: tanksLoading } = useFrappeGetDocList<OilTankDoc>(
    OIL_TANK_DOCTYPE,
    {
      fields: [
        'name',
        'tank_name',
        'tank_code',
        'terminal',
        'product',
        'current_state',
        'capacity_kl',
        'safe_fill_capacity_kl',
        'reference_height_mm',
      ],
      limit: 100,
    }
  );

  const { data: measurements, isLoading: measurementsLoading } =
    useFrappeGetDocList<TankMeasurementDoc>(TANK_MEASUREMENT_DOCTYPE, {
      fields: [
        'name',
        'tank',
        'observed_level_mm',
        'observed_temperature_c',
        'net_standard_volume_kl',
        'measurement_datetime',
      ],
      orderBy: {
        field: 'measurement_datetime',
        order: 'desc',
      },
      limit: 500,
    });

  const latestMeasurementMap = useMemo(() => {
    const map = new Map<string, TankMeasurementDoc>();
    if (measurements) {
      for (const m of measurements) {
        if (m.tank && !map.has(m.tank)) {
          map.set(m.tank, m);
        }
      }
    }
    return map;
  }, [measurements]);

  const tanks: ProcessedTank[] = useMemo(() => {
    if (!rawTanks) return [];
    return rawTanks.map((tank) => {
      const measurement = latestMeasurementMap.get(tank.name);
      const state = (tank.current_state || 'Active').toLowerCase();

      let levelPercent = 0;
      if (measurement) {
        if (tank.reference_height_mm && measurement.observed_level_mm) {
          levelPercent = Math.min(
            100,
            Math.max(
              0,
              Math.round((measurement.observed_level_mm / tank.reference_height_mm) * 100)
            )
          );
        } else if (tank.capacity_kl && measurement.net_standard_volume_kl) {
          levelPercent = Math.min(
            100,
            Math.max(0, Math.round((measurement.net_standard_volume_kl / tank.capacity_kl) * 100))
          );
        }
      }

      let statusKey: 'active' | 'maint' | 'quarantine' | 'other' = 'other';
      if (state === 'active') statusKey = 'active';
      else if (state.includes('maint')) statusKey = 'maint';
      else if (state.includes('quarant')) statusKey = 'quarantine';

      const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.other;

      return {
        id: tank.name,
        code: tank.tank_code || tank.name,
        name: tank.tank_name || tank.name,
        terminal: tank.terminal || 'Terminal',
        product: tank.product || 'AGO',
        level: levelPercent / 100,
        levelPercent,
        temp:
          measurement?.observed_temperature_c !== undefined
            ? `${measurement.observed_temperature_c.toFixed(1)}°C`
            : '—',
        status: statusKey,
        statusLabel: cfg.label,
        color: cfg.color,
        volumeKl: measurement?.net_standard_volume_kl,
        capacityKl: tank.safe_fill_capacity_kl || tank.capacity_kl,
      };
    });
  }, [rawTanks, latestMeasurementMap]);

  // Terminal list for filter toolbar
  const terminals = useMemo(() => {
    const set = new Set<string>();
    tanks.forEach((t) => {
      if (t.terminal) set.add(t.terminal);
    });
    return Array.from(set);
  }, [tanks]);

  // Filtered tanks based on terminal selection
  const filteredTanks = useMemo(() => {
    if (selectedTerminal === 'all') return tanks;
    return tanks.filter((t) => t.terminal.toLowerCase() === selectedTerminal.toLowerCase());
  }, [tanks, selectedTerminal]);

  // Summary stats
  const avgFillPercent = useMemo(() => {
    if (filteredTanks.length === 0) return 0;
    const sum = filteredTanks.reduce((acc, t) => acc + t.levelPercent, 0);
    return Math.round(sum / filteredTanks.length);
  }, [filteredTanks]);

  const totalVolKl = useMemo(() => {
    return filteredTanks.reduce((acc, t) => acc + (t.volumeKl || 0), 0);
  }, [filteredTanks]);

  const selectedTank = useMemo(() => {
    if (!selectedTankId) return null;
    return tanks.find((t) => t.id === selectedTankId) || null;
  }, [selectedTankId, tanks]);

  const isLoading = tanksLoading || measurementsLoading;

  const handleTankSelect = (id: string) => {
    const newId = selectedTankId === id ? null : id;
    setSelectedTankId(newId);
    if (newId) {
      const el = document.getElementById(`readout-card-${newId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const handleCardClick = (id: string) => {
    setSelectedTankId(selectedTankId === id ? null : id);
  };

  const handleResetCamera = () => {
    setSelectedTankId(null);
    setCameraKey((prev) => prev + 1);
  };

  return (
    <section id='tanks' className='scroll-mt-24'>
      {/* Unified Single Card for 3D View & Readouts Cards */}
      <Card className='w-full overflow-hidden border-border bg-card shadow-sm p-0 py-0 gap-0 isolate'>
        {/* Header 1: 3D View */}
        <div className='flex flex-col gap-3 border-b border-border bg-muted/20 px-5 py-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'>
              <Boxes className='size-4' />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <h2 className='text-base font-bold tracking-tight text-foreground'>Tank farm</h2>
                <Badge
                  variant='outline'
                  className='gap-1 border-[#33C9B7]/40 bg-[#33C9B7]/10 text-[#33C9B7] text-[10px] py-0 h-4.5'
                >
                  <span className='size-1.5 rounded-full bg-[#33C9B7] animate-pulse' />
                  R3F · WebGL
                </Badge>
              </div>
              <p className='text-xs text-muted-foreground'>
                Interactive 3D view of tank inventory across Mombasa and Nairobi. Drag to orbit,
                scroll to zoom.
              </p>
            </div>
          </div>

          {/* Action Controls & Filters */}
          <div className='flex flex-wrap items-center gap-2'>
            {/* Terminal Filters */}
            {terminals.length > 1 && (
              <div className='flex items-center rounded-lg border border-border bg-background p-0.5 text-xs shadow-2xs'>
                <button
                  type='button'
                  onClick={() => setSelectedTerminal('all')}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer',
                    selectedTerminal === 'all'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  All ({tanks.length})
                </button>
                {terminals.map((term) => (
                  <button
                    key={term}
                    type='button'
                    onClick={() => setSelectedTerminal(term)}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-xs font-medium transition-colors capitalize cursor-pointer',
                      selectedTerminal === term
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {term}
                  </button>
                ))}
              </div>
            )}

            <Button
              variant='outline'
              size='sm'
              onClick={() => setAutoRotate(!autoRotate)}
              className='h-8 gap-1.5 text-xs shadow-2xs cursor-pointer'
              title={autoRotate ? 'Pause auto-rotation' : 'Resume auto-rotation'}
            >
              {autoRotate ? <Pause className='size-3.5' /> : <Play className='size-3.5' />}
              <span className='hidden sm:inline'>{autoRotate ? 'Rotate' : 'Paused'}</span>
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={handleResetCamera}
              className='h-8 gap-1.5 text-xs shadow-2xs cursor-pointer'
              title='Reset Camera Perspective'
            >
              <RotateCcw className='size-3.5' />
              <span className='hidden sm:inline'>Reset View</span>
            </Button>
          </div>
        </div>

        {/* 3D Viewport Body */}
        <div className='relative h-120 w-full bg-[#080d16] overflow-hidden border-b border-border isolate'>
          {isLoading ? (
            <div className='flex h-full items-center justify-center text-sm text-slate-400'>
              <div className='flex items-center gap-2'>
                <span className='size-2 rounded-full bg-emerald-500 animate-ping' />
                Loading 3D SCADA scene…
              </div>
            </div>
          ) : filteredTanks.length === 0 ? (
            <div className='flex h-full items-center justify-center text-sm text-slate-400'>
              No tanks available for the selected terminal filter.
            </div>
          ) : (
            <div className='absolute inset-0'>
              <Canvas
                key={cameraKey}
                shadows
                dpr={[1, 2]}
                camera={{
                  position: filteredTanks.length > 4 ? [0, 4.6, 12.8] : [0, 3.5, 10],
                  fov: 40,
                }}
                gl={{ antialias: true }}
              >
                <Suspense fallback={null}>
                  <Scene3D
                    tanks={filteredTanks}
                    selectedTankId={selectedTankId}
                    onSelectTank={handleTankSelect}
                    autoRotate={autoRotate}
                  />
                </Suspense>
              </Canvas>
            </div>
          )}

          {/* Canvas Floating Overlay: Status Legend */}
          <div className='pointer-events-none absolute bottom-3 left-3 flex flex-wrap items-center gap-2 rounded-lg bg-slate-950/80 backdrop-blur-md px-3 py-1.5 border border-slate-800/80 text-[11px] text-slate-300 shadow-md'>
            <span className='text-slate-400 font-medium'>Status:</span>
            <div className='flex items-center gap-1.5'>
              <span className='size-2 rounded-full bg-[#33C9B7]' />
              <span>Active</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='size-2 rounded-full bg-[#F0A83C]' />
              <span>Maintenance</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='size-2 rounded-full bg-[#E5555C]' />
              <span>Quarantined</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='size-2 rounded-full bg-[#5A6D8C]' />
              <span>Idle</span>
            </div>
          </div>

          {/* Canvas Floating Overlay: Interaction Hint */}
          <div className='pointer-events-none absolute bottom-3 right-3 rounded-lg bg-slate-950/80 backdrop-blur-md px-3 py-1.5 border border-slate-800/80 text-[11px] text-slate-400 shadow-md'>
            Drag to orbit · Scroll to zoom · Click tank to inspect
          </div>

          {/* Canvas Floating Overlay: Selected Tank Banner */}
          {selectedTank && (
            <div className='absolute top-3 left-3 flex items-center gap-3 rounded-lg bg-slate-900/95 backdrop-blur-md px-3.5 py-2 border border-slate-700/80 text-xs text-white shadow-lg animate-in fade-in zoom-in-95 duration-150'>
              <span
                className='size-2.5 rounded-full shrink-0'
                style={{ backgroundColor: selectedTank.color }}
              />
              <div>
                <span className='font-bold'>{selectedTank.code}</span>
                <span className='text-slate-400 ml-1.5'>({selectedTank.name})</span>
                <span className='mx-2 text-slate-600'>|</span>
                <span className='font-mono text-emerald-400 font-semibold'>
                  {selectedTank.levelPercent}% Fill
                </span>
                <span className='text-slate-400 ml-1.5'>
                  · {selectedTank.product} · {selectedTank.temp}
                </span>
              </div>
              <button
                type='button'
                onClick={() => setSelectedTankId(null)}
                className='ml-2 text-slate-400 hover:text-white text-xs underline cursor-pointer'
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Header 2: Readouts Cards */}
        <div className='border-b border-border bg-muted/20 px-5 py-3'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-2'>
              <h2 className='text-base font-bold tracking-tight text-foreground'>Readouts</h2>
              <Badge variant='secondary' className='font-mono text-xs'>
                {filteredTanks.length} tanks
              </Badge>
              <span className='text-xs text-muted-foreground hidden md:inline'>
                · Live fill levels and telemetry across Mombasa and Nairobi
              </span>
            </div>

            {/* Quick Summary Metrics */}
            <div className='flex items-center gap-3 text-xs'>
              <div className='rounded-md border border-border/80 bg-background/80 px-3 py-1.5'>
                <span className='text-muted-foreground'>Avg Fill: </span>
                <span className='font-mono font-bold text-foreground'>{avgFillPercent}%</span>
              </div>
              <div className='rounded-md border border-border/80 bg-background/80 px-3 py-1.5'>
                <span className='text-muted-foreground'>Total Volume: </span>
                <span className='font-mono font-bold text-foreground'>
                  {Math.round(totalVolKl).toLocaleString()} m³
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Readouts Cards Content */}
        <div className='p-4 bg-card'>
          {isLoading ? (
            <div className='flex gap-3 overflow-x-auto pb-2'>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className='w-[215px] min-w-51.25 shrink-0 rounded-xl border border-border p-3 animate-pulse space-y-2'
                >
                  <div className='h-4 w-1/2 bg-muted rounded' />
                  <div className='h-3 w-3/4 bg-muted rounded' />
                  <div className='h-4 w-1/3 bg-muted rounded' />
                </div>
              ))}
            </div>
          ) : filteredTanks.length === 0 ? (
            <div className='py-6 text-center text-sm text-muted-foreground'>
              No tank records found for the selected filter.
            </div>
          ) : (
            <div
              className='flex gap-3 overflow-x-auto pb-2 pt-0.5 scroll-smooth'
              style={{ scrollbarWidth: 'thin' }}
            >
              {filteredTanks.map((tank) => {
                const isSelected = selectedTankId === tank.id;
                const cfg = STATUS_CONFIG[tank.status] || STATUS_CONFIG.other;

                return (
                  <div
                    key={tank.id}
                    id={`readout-card-${tank.id}`}
                    onClick={() => handleCardClick(tank.id)}
                    className={cn(
                      'group relative w-[215px] min-w-[205px] shrink-0 cursor-pointer overflow-hidden rounded-xl border p-3 transition-all duration-200',
                      'bg-linear-to-b from-white via-slate-50/70 to-slate-100/50 dark:from-[#131d31] dark:via-[#0c1424] dark:to-[#080d16]',
                      'border-border/80 border-t-2.5 shadow-2xs hover:shadow-md hover:-translate-y-0.5',
                      isSelected
                        ? 'border-[#33C9B7] ring-2 ring-[#33C9B7]/50 shadow-md shadow-[#33C9B7]/15'
                        : 'hover:border-slate-400/60 dark:hover:border-slate-600'
                    )}
                    style={{
                      borderTopColor: tank.color,
                    }}
                  >
                    {/* Ambient soft glow */}
                    <div
                      className='pointer-events-none absolute -top-6 -right-6 size-20 rounded-full blur-xl opacity-20'
                      style={{ backgroundColor: tank.color }}
                    />

                    {/* Top Row: Code and Percentage Pill */}
                    <div className='relative z-10 flex items-center justify-between gap-2 mb-1.5'>
                      <div className='flex items-center gap-1.5 min-w-0'>
                        <span
                          className='size-2 rounded-full shrink-0'
                          style={{ backgroundColor: tank.color }}
                        />
                        <span className='font-mono font-bold text-xs text-foreground truncate'>
                          {tank.code}
                        </span>
                      </div>
                      <div
                        className='inline-flex items-center rounded-full px-2 py-0.5 font-mono text-xs font-bold tracking-tight shadow-2xs'
                        style={{
                          backgroundColor: `${tank.color}18`,
                          color: tank.color,
                          border: `1px solid ${tank.color}35`,
                        }}
                      >
                        {tank.levelPercent}%
                      </div>
                    </div>

                    {/* Tank Name & Terminal / Product */}
                    <div className='relative z-10 mb-2'>
                      <div
                        className='text-xs font-semibold text-foreground truncate'
                        title={tank.name}
                      >
                        {tank.name}
                      </div>
                      <div className='text-[10.5px] text-muted-foreground truncate'>
                        {tank.terminal} · {tank.product}
                      </div>
                    </div>

                    {/* Metrics Row: Status badge & Temp */}
                    <div className='relative z-10 flex items-center justify-between border-t border-border/60 pt-2 text-[11px]'>
                      <Badge
                        variant={cfg.badgeVariant}
                        className='text-[9.5px] px-1.5 py-0 h-4.5 font-medium'
                      >
                        {tank.statusLabel}
                      </Badge>
                      <div className='flex items-center gap-1 text-muted-foreground font-mono text-[10.5px]'>
                        <Thermometer className='size-3 text-muted-foreground/70' />
                        <span>{tank.temp}</span>
                      </div>
                    </div>

                    {/* Volume / Capacity */}
                    <div className='relative z-10 mt-1 flex items-center justify-between text-[10px] text-muted-foreground font-mono'>
                      <span>Vol / Cap</span>
                      <span className='font-medium text-foreground/85'>
                        {tank.volumeKl !== undefined && tank.volumeKl > 0
                          ? `${Math.round(tank.volumeKl).toLocaleString()} m³`
                          : tank.capacityKl
                            ? `Cap ${Math.round(tank.capacityKl).toLocaleString()} m³`
                            : '—'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </section>
  );
}
