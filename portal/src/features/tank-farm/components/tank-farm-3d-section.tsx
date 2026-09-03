import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Html, OrbitControls, Sparkles } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

interface OilTankDoc {
  name: string;
  tank_name?: string;
  tank_code?: string;
  terminal?: string;
  product?: string;
  current_state?:
    | 'Active'
    | 'Maintenance'
    | 'Quarantine'
    | 'Decommissioned'
    | string;
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
}: {
  data: ProcessedTank;
  position: [number, number, number];
}) {
  const liquidRef = useRef<THREE.Mesh>(null);
  const liquidTopRef = useRef<THREE.Mesh>(null);
  const height = 3.0;
  const radius = 0.85;

  const clampedLevel = Math.max(0, Math.min(1, data.level));
  const liquidHeight =
    clampedLevel > 0 ? Math.max(0.12, (height - 0.08) * clampedLevel) : 0.04;
  const baseLiquidY = -height / 2 + liquidHeight / 2 + 0.04;

  useFrame((state) => {
    const wave =
      Math.sin(state.clock.elapsedTime * 1.6 + position[0] * 2) * 0.012;
    if (liquidRef.current) {
      liquidRef.current.position.y = baseLiquidY + wave;
    }
    if (liquidTopRef.current) {
      liquidTopRef.current.position.y = -height / 2 + liquidHeight + wave;
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, -height / 2 - 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius + 0.18, radius + 0.28, 0.3, 36]} />
        <meshStandardMaterial color='#141F35' roughness={0.7} metalness={0.3} />
      </mesh>

      {clampedLevel > 0 && (
        <group>
          <mesh ref={liquidRef} position={[0, baseLiquidY, 0]}>
            <cylinderGeometry
              args={[radius - 0.06, radius - 0.06, liquidHeight, 36]}
            />
            <meshStandardMaterial
              color={data.color}
              emissive={data.color}
              emissiveIntensity={0.65}
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
              emissiveIntensity={0.85}
              roughness={0.1}
            />
          </mesh>
        </group>
      )}

      <mesh renderOrder={1}>
        <cylinderGeometry args={[radius, radius, height, 36, 1, true]} />
        <meshStandardMaterial
          color='#9db8d9'
          transparent
          opacity={0.22}
          depthWrite={false}
          roughness={0.1}
          metalness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {false &&
        [0.25, 0.5, 0.75].map((level, i) => (
          <mesh key={i} position={[0, -height / 2 + height * level, 0]}>
            <torusGeometry args={[radius + 0.015, 0.018, 16, 36]} />
            <meshStandardMaterial
              color='#233252'
              roughness={0.4}
              metalness={0.6}
            />
          </mesh>
        ))}

      <mesh position={[0, height / 2 + 0.04, 0]}>
        <cylinderGeometry args={[radius + 0.06, radius + 0.06, 0.08, 36]} />
        <meshStandardMaterial color='#1c2b4a' roughness={0.4} metalness={0.6} />
      </mesh>

      <mesh position={[radius + 0.02, height / 2 + 0.04, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial
          color={data.color}
          emissive={data.color}
          emissiveIntensity={1.8}
        />
      </mesh>

      <Html position={[0, height / 2 + 0.52, 0]} center distanceFactor={9}>
        <div
          style={{
            fontSize: '11px',
            color: '#EAF1FA',
            background: 'rgba(12, 19, 34, 0.92)',
            border: `1px solid ${data.color}77`,
            borderRadius: '5px',
            padding: '5px 10px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            textAlign: 'center',
          }}
        >
          <div style={{ fontWeight: 700, letterSpacing: '0.02em' }}>
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

function Pipeline3D() {
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.4, -0.3, -0.4),
      new THREE.Vector3(-1.5, 0.5, 0.6),
      new THREE.Vector3(1.5, 0.5, 0.6),
      new THREE.Vector3(4.4, -0.3, -0.4),
    ]);
  }, []);

  const tubeGeo = useMemo(
    () => new THREE.TubeGeometry(curve, 64, 0.13, 12, false),
    [curve],
  );
  const particleCount = 14;
  const particleRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const t0 = (state.clock.elapsedTime * 0.12) % 1;
    for (let i = 0; i < particleCount; i++) {
      const mesh = particleRefs.current[i];
      if (!mesh) continue;
      const t = (t0 + i / particleCount) % 1;
      const point = curve.getPointAt(t);
      mesh.position.copy(point);
    }
  });

  return (
    <group>
      <mesh geometry={tubeGeo} castShadow receiveShadow>
        <meshStandardMaterial color='#26314f' roughness={0.35} metalness={0.75} />
      </mesh>
      {Array.from({ length: particleCount }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            particleRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial
            color='#33C9B7'
            emissive='#33C9B7'
            emissiveIntensity={1.8}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene3D({ tanks }: { tanks: ProcessedTank[] }) {
  const count = tanks.length;

  const positions: [number, number, number][] = useMemo(() => {
    if (count <= 4) {
      const dx = count > 1 ? Math.min(2.8, 8.5 / (count - 1)) : 0;
      return tanks.map((_, i) => {
        const x = (i - (count - 1) / 2) * dx;
        const z = i % 2 === 1 ? 0.6 : -0.4;
        return [x, 0, z] as [number, number, number];
      });
    }

    const cols = Math.ceil(count / 2);
    const spacingX = 2.8;
    return tanks.map((_, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const colsInThisRow = row === 0 ? cols : count - cols;
      const x = (col - (colsInThisRow - 1) / 2) * spacingX;
      const z = row === 0 ? -1.4 : 1.3;
      return [x, 0, z] as [number, number, number];
    });
  }, [count, tanks]);

  return (
    <>
      <fog attach='fog' args={['#080D16', 10, 26]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 8, 5]} intensity={1.2} castShadow />
      <pointLight position={[-6, 3, -4]} intensity={0.65} color='#F0A83C' />
      <pointLight position={[6, 3, 4]} intensity={0.65} color='#33C9B7' />

      <Sparkles
        count={count > 4 ? 75 : 50}
        scale={[18, 6, 14]}
        size={2}
        speed={0.25}
        color='#33C9B7'
        opacity={0.35}
      />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.65, 0]}
        receiveShadow
      >
        <planeGeometry args={[40, 30]} />
        <shadowMaterial opacity={0.35} />
      </mesh>
      <gridHelper
        args={[32, 32, '#1a2540', '#101a2c']}
        position={[0, -1.64, 0]}
      />

      {false && <Pipeline3D />}

      {tanks.map((tank, idx) => (
        <Tank3D key={tank.id} data={tank} position={positions[idx]} />
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={22}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate
        autoRotateSpeed={0.35}
        enableDamping
        dampingFactor={0.08}
        target={[0, 0.1, 0]}
      />
    </>
  );
}

export function TankFarm3DSection() {
  const { data: rawTanks, isLoading: tanksLoading } =
    useFrappeGetDocList<OilTankDoc>('Oil Tank', {
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
    });

  const { data: measurements, isLoading: measurementsLoading } =
    useFrappeGetDocList<TankMeasurementDoc>('Tank Measurement', {
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
              Math.round(
                (measurement.observed_level_mm / tank.reference_height_mm) *
                  100,
              ),
            ),
          );
        } else if (tank.capacity_kl && measurement.net_standard_volume_kl) {
          levelPercent = Math.min(
            100,
            Math.max(
              0,
              Math.round(
                (measurement.net_standard_volume_kl / tank.capacity_kl) * 100,
              ),
            ),
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
      };
    });
  }, [rawTanks, latestMeasurementMap]);

  const isLoading = tanksLoading || measurementsLoading;

  return (
    <section id='tanks' className='scroll-mt-24 space-y-4'>
      <div>
        <h2 className='text-foreground text-lg font-medium'>Tank farm</h2>
        <p className='text-muted-foreground text-sm'>
          Live fill levels rendered in 3D across Mombasa and Nairobi. Drag to
          orbit, scroll to zoom.
        </p>
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader className='border-border border-b'>
            <div className='flex items-center justify-between gap-2'>
              <CardTitle>Tank farm — live render</CardTitle>
              <Badge variant='outline'>R3F · WebGL</Badge>
            </div>
            <CardDescription>
              Interactive 3D view of tank inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='bg-muted/30 relative min-h-[480px] overflow-hidden rounded-lg'>
              {isLoading ? (
                <div className='text-muted-foreground flex min-h-[480px] items-center justify-center text-sm'>
                  Loading 3D scene…
                </div>
              ) : tanks.length === 0 ? (
                <div className='text-muted-foreground flex min-h-[480px] items-center justify-center text-sm'>
                  No tanks available in database
                </div>
              ) : (
                <div className='absolute inset-0'>
                  <Canvas
                    shadows
                    dpr={[1, 2]}
                    camera={{
                      position:
                        tanks.length > 4 ? [0, 4.2, 11.2] : [0, 3.2, 9.5],
                      fov: 42,
                    }}
                    gl={{ antialias: true }}
                  >
                    <Suspense fallback={null}>
                      <Scene3D tanks={tanks} />
                    </Suspense>
                  </Canvas>
                </div>
              )}
              <div className='text-muted-foreground pointer-events-none absolute right-3 bottom-3 text-xs'>
                Drag to orbit · scroll to zoom
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='flex flex-col'>
          <CardHeader className='border-border border-b'>
            <div className='flex items-center justify-between gap-2'>
              <CardTitle>Readouts</CardTitle>
              <Badge variant='secondary'>{tanks.length} tanks</Badge>
            </div>
          </CardHeader>
          <CardContent className='min-h-0 flex-1 p-0'>
            <ScrollArea className='h-[520px]'>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className='border-border flex animate-pulse items-start gap-3 border-b px-6 py-4 opacity-60'
                  >
                    <div className='bg-muted h-3 w-3 shrink-0 rounded-full' />
                    <div className='flex-1 space-y-2'>
                      <div className='bg-muted h-3.5 w-1/2 rounded' />
                      <div className='bg-muted h-2.5 w-1/3 rounded' />
                    </div>
                    <div className='bg-muted h-[18px] w-9 rounded' />
                  </div>
                ))
              ) : tanks.length === 0 ? (
                <div className='text-muted-foreground p-6 text-center text-sm'>
                  No tank records found.
                </div>
              ) : (
                tanks.map((tank) => {
                  const cfg = STATUS_CONFIG[tank.status] || STATUS_CONFIG.other;
                  return (
                    <div
                      key={tank.id}
                      className='border-border flex items-start gap-3 border-b px-6 py-4 last:border-b-0'
                    >
                      <div
                        className='mt-1 h-3 w-3 shrink-0 rounded-full'
                        style={{ background: tank.color }}
                      />
                      <div className='min-w-0 flex-1'>
                        <div
                          className='text-foreground truncate text-sm font-medium'
                          title={tank.name}
                        >
                          {tank.name}
                        </div>
                        <div className='text-muted-foreground mt-0.5 text-xs'>
                          {tank.terminal} · {tank.product} ·{' '}
                          <span className='font-mono'>{tank.temp}</span>
                        </div>
                        <div className='mt-2'>
                          <Badge variant={cfg.badgeVariant}>
                            {tank.statusLabel}
                          </Badge>
                        </div>
                        <div className='bg-muted mt-2 h-1 w-full overflow-hidden rounded-full'>
                          <div
                            className='h-full rounded-full transition-[width] duration-300'
                            style={{
                              width: `${tank.levelPercent}%`,
                              background: tank.color,
                            }}
                          />
                        </div>
                      </div>
                      <div
                        className='shrink-0 font-mono text-sm font-semibold'
                        style={{ color: tank.color }}
                      >
                        {tank.levelPercent}%
                      </div>
                    </div>
                  );
                })
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
