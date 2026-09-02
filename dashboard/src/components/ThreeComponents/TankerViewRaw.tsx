import { useEffect, useRef } from "react";
import * as THREE from "three";

export function Tank3DViewRaw() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // dark slate

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 3, 7);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight,
    );
    mountRef.current.appendChild(renderer.domElement);

    // 2. Add a 3D Storage Tank (Cylinder)
    const geometry = new THREE.CylinderGeometry(1.5, 1.5, 3, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.6,
      roughness: 0.3,
    });
    const tank = new THREE.Mesh(geometry, material);
    scene.add(tank);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // 4. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      tank.rotation.y += 0.01;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // 5. Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "400px",
        borderRadius: 12,
        overflow: "hidden",
      }}
    />
  );
}
