import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Float, Html } from "@react-three/drei";
import { useRef, useState, Suspense } from "react";
import * as THREE from "three";

interface TankProps {
  id?: string;
  name?: string;
  capacity?: number;
  currentVolume?: number;
  product?: string;
  temperature?: number;
  fillPercent?: number;
  status?: "Filling" | "Discharging" | "Idle" | "Maintenance";
}

function StorageTank({
  name = "TK-101",
  fillPercent = 78,
  product = "PMS (Premium Motor Spirit)",
  temperature = 28.4,
  status = "Filling",
}: TankProps) {
  const tankGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const tankHeight = 3.6;
  const tankRadius = 2.0;

  const clampedFill = Math.max(8, Math.min(95, fillPercent)) / 100;
  const liquidHeight = (tankHeight - 0.2) * clampedFill;
  const liquidY = -tankHeight / 2 + liquidHeight / 2 + 0.1;

  const liquidColor = product.includes("AGO") || product.includes("Diesel")
    ? "#10b981"
    : product.includes("DPK") || product.includes("Jet")
    ? "#06b6d4"
    : "#f59e0b";

  useFrame((state) => {
    if (tankGroupRef.current && !hovered) {
      tankGroupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.25) * 0.15;
    }
  });

  return (
    <group ref={tankGroupRef}>
      {/* Base Concrete Foundation */}
      <mesh position={[0, -tankHeight / 2 - 0.15, 0]}>
        <cylinderGeometry args={[tankRadius + 0.5, tankRadius + 0.6, 0.3, 48]} />
        <meshStandardMaterial color="#334155" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Outer Translucent Tank Shell */}
      <mesh
        position={[0, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[tankRadius, tankRadius, tankHeight, 48, 1, true]} />
        <meshPhysicalMaterial
          color="#94a3b8"
          transmission={0.6}
          opacity={0.85}
          transparent
          roughness={0.2}
          metalness={0.5}
          ior={1.2}
          thickness={0.6}
        />
      </mesh>

      {/* Tank Roof Dome */}
      <mesh position={[0, tankHeight / 2 + 0.25, 0]}>
        <coneGeometry args={[tankRadius + 0.05, 0.5, 48]} />
        <meshStandardMaterial color="#475569" roughness={0.35} metalness={0.7} />
      </mesh>

      {/* Tank Floor */}
      <mesh position={[0, -tankHeight / 2, 0]}>
        <cylinderGeometry args={[tankRadius, tankRadius, 0.08, 48]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Liquid Volume */}
      <mesh position={[0, liquidY, 0]}>
        <cylinderGeometry args={[tankRadius - 0.06, tankRadius - 0.06, liquidHeight, 48]} />
        <meshStandardMaterial
          color={liquidColor}
          emissive={liquidColor}
          emissiveIntensity={0.3}
          roughness={0.15}
          metalness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Liquid Top Surface */}
      <mesh position={[0, liquidY + liquidHeight / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[tankRadius - 0.07, 48]} />
        <meshStandardMaterial
          color={liquidColor}
          emissive={liquidColor}
          emissiveIntensity={0.45}
          roughness={0.1}
          metalness={0.4}
        />
      </mesh>

      {/* Structural Rings */}
      {[0.25, 0.5, 0.75].map((level, i) => (
        <mesh key={i} position={[0, -tankHeight / 2 + tankHeight * level, 0]}>
          <torusGeometry args={[tankRadius + 0.02, 0.025, 16, 48]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* Vertical Piping */}
      <mesh position={[tankRadius + 0.16, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, tankHeight + 0.4, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Floating 3D Badge */}
      <Float speed={2} rotationIntensity={0.05} floatIntensity={0.2}>
        <Html position={[0, tankHeight / 2 + 1.1, 0]} center distanceFactor={10}>
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              borderRadius: "12px",
              padding: "10px 16px",
              textAlign: "center",
              whiteSpace: "nowrap",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            <div style={{ color: "#f8fafc", fontWeight: 700, fontSize: "14px", letterSpacing: "0.5px" }}>
              {name}
            </div>
            <div style={{ color: fillPercent > 85 ? "#f87171" : "#38bdf8", fontSize: "12px", fontWeight: 600, marginTop: "2px" }}>
              {fillPercent}% Filled • {temperature}°C
            </div>
            <div style={{ color: "#94a3b8", fontSize: "11px", marginTop: "2px" }}>
              {product} [{status}]
            </div>
          </div>
        </Html>
      </Float>
    </group>
  );
}

export function TankarView(props: TankProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "560px",
        position: "relative",
        borderRadius: "16px",
        overflow: "hidden",
        backgroundColor: "#030712",
        border: "1px solid #1e293b",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
      }}
    >
      {/* Top Left HUD */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "16px",
          zIndex: 10,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            fontWeight: 700,
            color: "#38bdf8",
          }}
        >
          3D Digital Twin • Live SCADA
        </span>
        <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#f8fafc" }}>
          {props.name || "TK-101"} Storage Tank
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
          <span
            style={{
              height: "8px",
              width: "8px",
              borderRadius: "50%",
              backgroundColor: "#10b981",
              display: "inline-block",
              boxShadow: "0 0 10px #10b981",
            }}
          />
          <span style={{ fontSize: "12px", color: "#cbd5e1", fontFamily: "monospace" }}>
            {props.status || "Filling"} @ {props.fillPercent || 78}%
          </span>
        </div>
      </div>

      {/* Bottom Right Controls Info */}
      <div
        style={{
          position: "absolute",
          bottom: "16px",
          right: "16px",
          zIndex: 10,
          pointerEvents: "none",
          fontSize: "12px",
          color: "#64748b",
          fontFamily: "monospace",
        }}
      >
        Left-Click + Drag: Rotate | Scroll: Zoom
      </div>

      {/* 3D WebGL Canvas */}
      <div style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
        <Canvas
          camera={{ position: [0, 2.5, 7.5], fov: 45 }}
          gl={{ antialias: true, alpha: false }}
          style={{ width: "100%", height: "100%", background: "#030712" }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={1.0} />
            <directionalLight position={[6, 12, 8]} intensity={1.8} />
            <directionalLight position={[-6, 6, -6]} intensity={0.8} color="#38bdf8" />
            <pointLight position={[0, -2, 4]} intensity={1.0} color="#0284c7" />

            {/* 3D Tank Component */}
            <StorageTank {...props} />

            {/* Ground Contact Shadow */}
            <ContactShadows
              position={[0, -2.1, 0]}
              opacity={0.8}
              scale={12}
              blur={2.5}
              far={4}
              color="#000000"
            />

            {/* Camera Orbit Controls */}
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={4}
              maxDistance={14}
              maxPolarAngle={Math.PI / 2 - 0.05}
              dampingFactor={0.05}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

export default TankarView;
