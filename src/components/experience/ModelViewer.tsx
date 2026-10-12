"use client";

/**
 * Optional WebGL viewer. Only imported (next/dynamic, ssr: false) when
 * /public/models/novra-x01.glb exists and is a valid binary glTF, and only
 * mounted once THE EXPERIENCE is about to enter the viewport.
 */

import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Finish } from "@/content/finishes";
import { gsap } from "@/lib/gsap";
import { MQ } from "@/lib/motion";

/** Materials or meshes whose name matches this are treated as body paint. */
const PAINT_NAME = /paint|body|carpaint|exterior|shell/i;
/** Local Draco decoder (copied from three/examples) — no third-party CDN. */
const DRACO_PATH = "/draco/";

type PaintMaterial = THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;

function isPaintable(m: THREE.Material): m is PaintMaterial {
  return (m as PaintMaterial).isMeshStandardMaterial === true;
}

function disposeScene(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) value.dispose();
      });
      material.dispose();
    });
  });
}

function Car({ url, finish, onReady }: { url: string; finish: Finish; onReady: () => void }) {
  const { scene } = useGLTF(url, DRACO_PATH);

  // Normalise any export to a ~4.6 m car standing on the floor, and find its paint.
  const { scale, offset, paints } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = 4.6 / Math.max(size.x, size.z, 0.001);

    const named = new Set<PaintMaterial>();
    let largest: { material: PaintMaterial; volume: number } | null = null;
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const meshBox = new THREE.Box3().setFromObject(mesh).getSize(new THREE.Vector3());
      const volume = meshBox.x * meshBox.y * meshBox.z;
      materials.forEach((material) => {
        if (!isPaintable(material)) return;
        if (PAINT_NAME.test(material.name) || PAINT_NAME.test(mesh.name)) named.add(material);
        if (!largest || volume > largest.volume) largest = { material, volume };
      });
    });
    const fallback = largest as { material: PaintMaterial } | null;
    const found = named.size ? [...named] : fallback ? [fallback.material] : [];
    return {
      scale: s,
      offset: [-center.x * s, -box.min.y * s, -center.z * s] as [number, number, number],
      paints: found,
    };
  }, [scene]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  useEffect(() => {
    const target = new THREE.Color(finish.paint.color);
    const tweens = paints.flatMap((material) => {
      if ("clearcoat" in material) material.clearcoat = finish.paint.clearcoat;
      return [
        gsap.to(material.color, { r: target.r, g: target.g, b: target.b, duration: 0.9, ease: "cine.inOut" }),
        gsap.to(material, {
          metalness: finish.paint.metalness,
          roughness: finish.paint.roughness,
          duration: 0.9,
          ease: "cine.inOut",
        }),
      ];
    });
    return () => tweens.forEach((t) => t.kill());
  }, [finish, paints]);

  useEffect(
    () => () => {
      disposeScene(scene);
      useGLTF.clear(url);
    },
    [scene, url],
  );

  return (
    <group scale={scale} position={offset}>
      <primitive object={scene} />
    </group>
  );
}

type ModelViewerProps = { url: string; finish: Finish; onReady: () => void; label: string };

export default function ModelViewer({ url, finish, onReady, label }: ModelViewerProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [prefs] = useState(() => ({
    reduce: window.matchMedia(MQ.reduce).matches,
    fine: window.matchMedia("(pointer: fine)").matches,
  }));

  // Stop rendering entirely while the viewer is off screen.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0" role="img" aria-label={label} data-cursor="drag">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [5.4, 1.45, 5.8], fov: 27, near: 0.1, far: 60 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <color attach="background" args={["#0b0c0f"]} />
        <fog attach="fog" args={["#0b0c0f", 10, 24]} />

        <Suspense fallback={null}>
          <Car url={url} finish={finish} onReady={onReady} />
          <ContactShadows position={[0, 0.002, 0]} opacity={0.8} scale={14} blur={2.4} far={3} resolution={512} frames={1} />
        </Suspense>

        {/* Studio built from light panels: no HDR download, no external host. */}
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={2.2} color="#f5f5f3" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 4, 1]} />
          <Lightformer form="rect" intensity={4} color="#ff5a1f" position={[-6, 1.2, 0]} rotation-y={Math.PI / 2} scale={[14, 0.35, 1]} />
          <Lightformer form="rect" intensity={4} color="#ff5a1f" position={[6, 1.2, 0]} rotation-y={-Math.PI / 2} scale={[14, 0.35, 1]} />
          <Lightformer form="rect" intensity={1.2} color="#b8bec2" position={[0, 1.6, 7]} scale={[10, 2, 1]} />
        </Environment>

        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={false}
          enableRotate={prefs.fine}
          enableDamping
          dampingFactor={0.06}
          minPolarAngle={Math.PI * 0.3}
          maxPolarAngle={Math.PI * 0.49}
          autoRotate={!prefs.reduce}
          autoRotateSpeed={0.35}
          target={[0, 0.6, 0]}
        />
      </Canvas>
    </div>
  );
}
