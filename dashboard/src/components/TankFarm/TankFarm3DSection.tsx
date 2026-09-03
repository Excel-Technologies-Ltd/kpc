import { Html, OrbitControls, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useFrappeGetDocList } from "frappe-react-sdk";
import React, { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

interface OilTankDoc {
  name: string;
  tank_name?: string;
  tank_code?: string;
  terminal?: string;
  product?: string;
  current_state?: "Active" | "Maintenance" | "Quarantine" | "Decommissioned" | string;
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
  level: number; // 0.0 to 1.0
  levelPercent: number; // 0 to 100
  temp: string;
  status: "active" | "maint" | "quarantine" | "other";
  statusLabel: string;
  color: string;
}

const STATUS_CONFIG: Record<string, { color: string; badgeClass: string; label: string; statusKey: "active" | "maint" | "quarantine" | "other" }> = {
  active: { color: "#33C9B7", badgeClass: "badge active", label: "Active", statusKey: "active" },
  maint: { color: "#F0A83C", badgeClass: "badge maint", label: "Maintenance", statusKey: "maint" },
  quarantine: { color: "#E5555C", badgeClass: "badge quarantine", label: "Quarantined", statusKey: "quarantine" },
  other: { color: "#5A6D8C", badgeClass: "badge", label: "Idle", statusKey: "other" },
};

// ── 3D Single Tank Mesh ───────────────────────────────────────────────────────

function Tank3D({ data, position }: { data: ProcessedTank; position: [number, number, number] }) {
  const liquidRef = useRef<THREE.Mesh>(null);
  const liquidTopRef = useRef<THREE.Mesh>(null);
  const height = 3.0;
  const radius = 0.85;

  // Compute liquid height: 0% = tiny bottom sliver (0.04), 100% = full tank (height - 0.08)
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
    <group position={position}>
      {/* Base Concrete Foundation */}
      <mesh position={[0, -height / 2 - 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius + 0.18, radius + 0.28, 0.3, 36]} />
        <meshStandardMaterial color="#141F35" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Internal Liquid Volume (Always rendered first) */}
      {clampedLevel > 0 && (
        <group>
          {/* Liquid Body */}
          <mesh ref={liquidRef} position={[0, baseLiquidY, 0]}>
            <cylinderGeometry args={[radius - 0.06, radius - 0.06, liquidHeight, 36]} />
            <meshStandardMaterial
              color={data.color}
              emissive={data.color}
              emissiveIntensity={0.65}
              roughness={0.15}
              metalness={0.1}
            />
          </mesh>

          {/* Liquid Top Surface Disk */}
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

      {/* Outer Glass / Translucent Cylinder Shell */}
      <mesh renderOrder={1}>
        <cylinderGeometry args={[radius, radius, height, 36, 1, true]} />
        <meshStandardMaterial
          color="#9db8d9"
          transparent
          opacity={0.22}
          depthWrite={false}
          roughness={0.1}
          metalness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Structural Glass Ring Ribs */}
      {false && [0.25, 0.5, 0.75].map((level, i) => (
        <mesh key={i} position={[0, -height / 2 + height * level, 0]}>
          <torusGeometry args={[radius + 0.015, 0.018, 16, 36]} />
          <meshStandardMaterial color="#233252" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}

      {/* Top Roof / Dome */}
      <mesh position={[0, height / 2 + 0.04, 0]}>
        <cylinderGeometry args={[radius + 0.06, radius + 0.06, 0.08, 36]} />
        <meshStandardMaterial color="#1c2b4a" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Status LED Indicator on Rim */}
      <mesh position={[radius + 0.02, height / 2 + 0.04, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={1.8} />
      </mesh>

      {/* Floating 3D HUD Tag */}
      <Html position={[0, height / 2 + 0.52, 0]} center distanceFactor={9}>
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "11px",
            color: "#EAF1FA",
            background: "rgba(12, 19, 34, 0.92)",
            border: `1px solid ${data.color}77`,
            borderRadius: "5px",
            padding: "5px 10px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            textAlign: "center",
            boxShadow: `0 4px 16px rgba(0,0,0,0.6), 0 0 12px ${data.color}33`,
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ fontWeight: 700, letterSpacing: "0.02em" }}>{data.code || data.name}</div>
          <div style={{ color: data.color, fontSize: "10.5px", marginTop: "2px", fontWeight: 600 }}>
            {data.levelPercent}% · {data.product}
          </div>
        </div>
      </Html>
    </group>
  );
}

// ── 3D Connecting Pipeline & Flow Particles ───────────────────────────────────

function Pipeline3D() {
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.4, -0.3, -0.4),
      new THREE.Vector3(-1.5, 0.5, 0.6),
      new THREE.Vector3(1.5, 0.5, 0.6),
      new THREE.Vector3(4.4, -0.3, -0.4),
    ]);
  }, []);

  const tubeGeo = useMemo(() => new THREE.TubeGeometry(curve, 64, 0.13, 12, false), [curve]);
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
        <meshStandardMaterial color="#26314f" roughness={0.35} metalness={0.75} />
      </mesh>
      {Array.from({ length: particleCount }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            particleRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color="#33C9B7" emissive="#33C9B7" emissiveIntensity={1.8} />
        </mesh>
      ))}
    </group>
  );
}

// ── Dynamic 3D Scene Environment for N Tanks ─────────────────────────────────

function Scene3D({ tanks }: { tanks: ProcessedTank[] }) {
  const count = tanks.length;

  // Calculate layout coordinates for all tanks dynamically
  const positions: [number, number, number][] = useMemo(() => {
    if (count <= 4) {
      const dx = count > 1 ? Math.min(2.8, 8.5 / (count - 1)) : 0;
      return tanks.map((_, i) => {
        const x = (i - (count - 1) / 2) * dx;
        const z = i % 2 === 1 ? 0.6 : -0.4;
        return [x, 0, z] as [number, number, number];
      });
    }

    // 2-row layout for 5+ tanks
    const cols = Math.ceil(count / 2);
    const spacingX = 2.8;
    return tanks.map((_, i) => {
      const row = Math.floor(i / cols); // 0 = back, 1 = front
      const col = i % cols;
      const colsInThisRow = row === 0 ? cols : count - cols;
      const x = (col - (colsInThisRow - 1) / 2) * spacingX;
      const z = row === 0 ? -1.4 : 1.3;
      return [x, 0, z] as [number, number, number];
    });
  }, [count, tanks]);

  return (
    <>
      <fog attach="fog" args={["#080D16", 10, 26]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 8, 5]} intensity={1.2} castShadow />
      <pointLight position={[-6, 3, -4]} intensity={0.65} color="#F0A83C" />
      <pointLight position={[6, 3, 4]} intensity={0.65} color="#33C9B7" />

      <Sparkles count={count > 4 ? 75 : 50} scale={[18, 6, 14]} size={2} speed={0.25} color="#33C9B7" opacity={0.35} />

      {/* Ground Shadow Plane & Grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.65, 0]} receiveShadow>
        <planeGeometry args={[40, 30]} />
        <shadowMaterial opacity={0.35} />
      </mesh>
      <gridHelper args={[32, 32, "#1a2540", "#101a2c"]} position={[0, -1.64, 0]} />

     {false && <Pipeline3D />}

      {/* Render all tanks dynamically */}
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

// ── Main Component ────────────────────────────────────────────────────────────

export const TankFarm3DSection: React.FC = () => {
  const { data: rawTanks, isLoading: tanksLoading } = useFrappeGetDocList<OilTankDoc>(
    "Oil Tank",
    {
      fields: [
        "name",
        "tank_name",
        "tank_code",
        "terminal",
        "product",
        "current_state",
        "capacity_kl",
        "safe_fill_capacity_kl",
        "reference_height_mm",
      ],
      limit: 100,
    },
  );

  const { data: measurements, isLoading: measurementsLoading } = useFrappeGetDocList<TankMeasurementDoc>(
    "Tank Measurement",
    {
      fields: [
        "name",
        "tank",
        "observed_level_mm",
        "observed_temperature_c",
        "net_standard_volume_kl",
        "measurement_datetime",
      ],
      orderBy: {
        field: "measurement_datetime",
        order: "desc",
      },
      limit: 500,
    },
  );

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
      const state = (tank.current_state || "Active").toLowerCase();

      let levelPercent = 0;
      if (measurement) {
        if (tank.reference_height_mm && measurement.observed_level_mm) {
          levelPercent = Math.min(100, Math.max(0, Math.round((measurement.observed_level_mm / tank.reference_height_mm) * 100)));
        } else if (tank.capacity_kl && measurement.net_standard_volume_kl) {
          levelPercent = Math.min(100, Math.max(0, Math.round((measurement.net_standard_volume_kl / tank.capacity_kl) * 100)));
        }
      }

      let statusKey: "active" | "maint" | "quarantine" | "other" = "other";
      if (state === "active") statusKey = "active";
      else if (state.includes("maint")) statusKey = "maint";
      else if (state.includes("quarant")) statusKey = "quarantine";

      const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.other;

      return {
        id: tank.name,
        code: tank.tank_code || tank.name,
        name: tank.tank_name || tank.name,
        terminal: tank.terminal || "Terminal",
        product: tank.product || "AGO",
        level: levelPercent / 100,
        levelPercent,
        temp: measurement?.observed_temperature_c !== undefined ? `${measurement.observed_temperature_c.toFixed(1)}°C` : "—",
        status: statusKey,
        statusLabel: cfg.label,
        color: cfg.color,
      };
    });
  }, [rawTanks, latestMeasurementMap]);

  const isLoading = tanksLoading || measurementsLoading;

  return (
    <section id="tanks" className="scroll-mt-24 mb-12">
      <div className="section-head">
        <div>
          <div className="section-title">Tank farm</div>
          <div className="section-note">
            Live fill levels rendered in 3D across Mombasa and Nairobi. Drag to orbit, scroll to zoom.
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Left: 3D Scene Viewport */}
        <div className="panel" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div className="panel-head">
            <div className="panel-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 15, height: 15, color: "var(--flow)" }}>
                <path d="M6 3h12l2 7c0 5.5-4.5 11-8 11S4 15.5 4 10z" />
              </svg>
              Tank farm — live render
            </div>
            <span className="panel-tag">R3F · WebGL</span>
          </div>

          <div className="scene-wrap" style={{ flex: 1, minHeight: "480px" }}>
            {isLoading ? (
              <div className="scene-loading">Loading 3D scene…</div>
            ) : tanks.length === 0 ? (
              <div className="scene-loading">No tanks available in database</div>
            ) : (
              <div id="scene3d-root" style={{ width: "100%", height: "100%", position: "relative" }}>
                <Canvas
                  shadows
                  dpr={[1, 2]}
                  camera={{ position: tanks.length > 4 ? [0, 4.2, 11.2] : [0, 3.2, 9.5], fov: 42 }}
                  gl={{ antialias: true }}
                >
                  <Suspense fallback={null}>
                    <Scene3D tanks={tanks} />
                  </Suspense>
                </Canvas>
              </div>
            )}

            <div className="scene-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}>
                <path d="M12 2a10 10 0 1 0 10 10" />
              </svg>
              Drag to orbit · scroll to zoom
            </div>
          </div>
        </div>

        {/* Right: Tank Readouts List */}
        <div className="panel tank-list" style={{ display: "flex", flexDirection: "column" }}>
          <div className="panel-head">
            <div className="panel-title">Readouts</div>
            <span className="panel-tag">{tanks.length} tanks</span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="tank-row animate-pulse opacity-60">
                  <div className="tank-swatch" style={{ background: "var(--line)" }} />
                  <div className="tank-row-info">
                    <div style={{ height: 14, width: "50%", background: "rgba(255,255,255,0.1)", borderRadius: 3, marginBottom: 4 }} />
                    <div style={{ height: 10, width: "35%", background: "rgba(255,255,255,0.06)", borderRadius: 3 }} />
                  </div>
                  <div className="tank-row-right">
                    <div style={{ height: 18, width: 36, background: "rgba(255,255,255,0.1)", borderRadius: 3 }} />
                  </div>
                </div>
              ))
            ) : tanks.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-faint)" }}>
                No tank records found.
              </div>
            ) : (
              tanks.map((tank) => (
                <div key={tank.id} className="tank-row">
                  <div className="tank-swatch" style={{ background: tank.color, boxShadow: `0 0 10px ${tank.color}88` }} />
                  <div className="tank-row-info">
                    <div className="tank-row-name" title={tank.name}>{tank.name}</div>
                    <div className="tank-row-sub">
                      {tank.terminal} · {tank.product} · <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{tank.temp}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                      <span className={STATUS_CONFIG[tank.status]?.badgeClass || "badge"}>
                        <span className="bdot" />
                        {tank.statusLabel}
                      </span>
                    </div>
                    {/* Mini progress level bar */}
                    <div style={{ height: "3px", width: "100%", background: "rgba(255,255,255,0.08)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${tank.levelPercent}%`, background: tank.color, borderRadius: "2px", transition: "width 0.4s ease" }} />
                    </div>
                  </div>
                  <div className="tank-row-right">
                    <div className="tank-row-level" style={{ color: tank.color }}>{tank.levelPercent}%</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TankFarm3DSection;

