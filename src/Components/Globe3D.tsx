import React, { Suspense, useEffect, useMemo, useRef } from "react";
// import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  ExtrudeGeometry,
  LatheGeometry,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Shape,
  SplineCurve,
  Vector2,
} from "three";
import type { Group } from "three";

const ORBIT_R = 1.45;

useTexture.preload([
  "/textures/earth_atmos_2048.jpg",
  "/textures/earth_normal_2048.jpg",
  "/textures/earth_specular_2048.jpg",
  "/textures/earth_clouds_1024.png",
]);

import type { MeshStandardMaterial } from "three";

// define outside the component so it isn't recreated every render
const addRim = (m: MeshStandardMaterial) => {
  m.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <opaque_fragment>",
      `float rim = pow(1.0 - saturate(dot(normalize(vNormal), normalize(vViewPosition))), 3.0);
       outgoingLight += vec3(0.3, 0.6, 1.0) * rim * 0.9;
       #include <opaque_fragment>`,
    );
  };
};

// Fresnel glow: bright at the planet's rim, fading outward
const ATMOSPHERE = {
  vertexShader: `varying vec3 vN;
    void main(){ vN = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `varying vec3 vN;
    void main(){ float i = pow(0.45 - dot(vN, vec3(0.0, 0.0, 1.0)), 4.0);
      gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * i * 1.8; }`,
};

const Earth: React.FC = () => {
  const earth = useRef<Mesh>(null);
  const clouds = useRef<Mesh>(null);
  // Files live in /public/textures. R3F marks colour maps as sRGB for us.
  const [day, normal, specular, cloudMap] = useTexture([
    "/textures/earth_atmos_2048.jpg",
    "/textures/earth_normal_2048.jpg",
    "/textures/earth_specular_2048.jpg",
    "/textures/earth_clouds_1024.png",
  ]);

  useFrame((_, dt) => {
    if (earth.current) earth.current.rotation.y += dt * 0.06;
    if (clouds.current) clouds.current.rotation.y += dt * 0.075; // clouds drift faster
  });

  return (
    <group rotation={[0, 0, 0.41]}>
      {/* 23.4° axial tilt */}
      <mesh ref={earth}>
        <sphereGeometry args={[1, 96, 96]} />
        <meshPhongMaterial
          map={day}
          normalMap={normal}
          normalScale={[0.85, 0.85]}
          specularMap={specular}
          specular="#334155"
          shininess={18}
        />
      </mesh>
      <mesh ref={clouds}>
        <sphereGeometry args={[1.012, 96, 96]} />
        <meshPhongMaterial
          map={cloudMap}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>
      <mesh scale={1.14}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          {...ATMOSPHERE}
          side={BackSide}
          blending={AdditiveBlending}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

// ---------- Airliner: built from smooth procedural shapes, nose along +z, up +y ----------
const PROFILE = [
  [0, -0.5],
  [0.012, -0.49],
  [0.03, -0.44],
  [0.048, -0.34],
  [0.058, -0.22],
  [0.058, 0.2],
  [0.054, 0.33],
  [0.04, 0.43],
  [0.018, 0.49],
  [0, 0.5],
].map(([r, y]) => new Vector2(r, y)); // (radius, position along the body)

const outline = (pts: [number, number][]) => {
  const s = new Shape();
  s.moveTo(...pts[0]);
  pts.slice(1).forEach((p) => s.lineTo(...p));
  s.closePath();
  return s;
};
const extrude = (pts: [number, number][], depth: number) =>
  new ExtrudeGeometry(outline(pts), { depth, bevelEnabled: false });

const BODY = {
  color: "#f1f5f9",
  roughness: 0.35,
  metalness: 0.2,
  emissive: "#94a3b8",
  emissiveIntensity: 0.25,
} as const;
const GREY = { ...BODY, color: "#cbd5e1" } as const;

const Airliner: React.FC = () => {
  const g = useMemo(() => {
    const curve = new SplineCurve(PROFILE)
      .getPoints(48)
      .map((p) => new Vector2(Math.max(0, p.x), p.y));
    return {
      body: new LatheGeometry(curve, 28),
      // (span, chord): swept-back wing, tapered toward the tip
      wing: extrude(
        [
          [0.05, 0.06],
          [0.48, -0.16],
          [0.48, -0.23],
          [0.05, -0.14],
        ],
        0.014,
      ),
      stab: extrude(
        [
          [0.03, 0.05],
          [0.2, -0.03],
          [0.2, -0.07],
          [0.03, -0.06],
        ],
        0.01,
      ),
      // (position along body, height): swept vertical fin
      fin: extrude(
        [
          [-0.3, 0],
          [-0.44, 0.16],
          [-0.5, 0.16],
          [-0.47, 0],
        ],
        0.012,
      ),
    };
  }, []);

  return (
    <group scale={0.55}>
      <mesh geometry={g.body} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial {...BODY} onBeforeCompile={addRim as never} />
      </mesh>
      <mesh
        geometry={g.fin}
        rotation={[0, -Math.PI / 2, 0]}
        position={[0.006, 0.02, 0]}
      >
        <meshStandardMaterial {...BODY} color="#2563eb" emissive="#1d4ed8" />
      </mesh>
      {[1, -1].map((s) => (
        <group key={s} scale={[s, 1, 1]}>
          <mesh
            geometry={g.wing}
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, -0.03, 0]}
          >
            <meshStandardMaterial {...GREY} side={DoubleSide} />
          </mesh>
          <mesh
            geometry={g.stab}
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, 0, -0.4]}
          >
            <meshStandardMaterial {...GREY} side={DoubleSide} />
          </mesh>
          <mesh position={[0.2, -0.075, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.026, 0.13, 16]} />
            <meshStandardMaterial
              color="#475569"
              roughness={0.4}
              metalness={0.4}
            />
          </mesh>
          {/* navigation lights: red on the left wingtip, green on the right */}
          <mesh position={[0.485, -0.03, -0.19]}>
            <sphereGeometry args={[0.014, 8, 8]} />
            <meshBasicMaterial color={s === 1 ? "#ef4444" : "#22c55e"} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ---------- Contrail: a tapering ribbon that fades out (additive blending on dark space) ----------
const TRAIL_N = 48,
  TRAIL_SPAN = 1.3,
  TRAIL_W = 0.05;

const makeTrail = () => {
  const pos = new Float32Array(TRAIL_N * 6);
  const col = new Float32Array(TRAIL_N * 6);
  const idx: number[] = [];
  for (let i = 0; i < TRAIL_N; i++) {
    const k = (i / (TRAIL_N - 1)) ** 2 * 0.9; // brightness: 0 at the tail, strongest at the plane
    for (let j = 0; j < 2; j++)
      col.set([0.55 * k, 0.75 * k, k], (i * 2 + j) * 3);
    if (i < TRAIL_N - 1)
      idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(pos, 3));
  geo.setAttribute("color", new BufferAttribute(col, 3));
  geo.setIndex(idx);
  const mesh = new Mesh(
    geo,
    new MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide,
    }),
  );
  mesh.frustumCulled = false;
  return mesh;
};

const Orbit: React.FC<{ onPlaneClick: () => void }> = ({ onPlaneClick }) => {
  const plane = useRef<Group>(null);
  const angle = useRef(0);
  const paused = useRef(false);
  const trail = useMemo(makeTrail, []);

  useEffect(
    () => () => {
      document.body.style.cursor = "";
    },
    [],
  );

  useFrame((_, dt) => {
    if (!paused.current) angle.current += dt * 0.4;
    const a = angle.current;
    plane.current?.position.set(
      Math.cos(a) * ORBIT_R,
      0,
      Math.sin(a) * ORBIT_R,
    );
    plane.current?.rotation.set(0, -a, 0); // nose follows the orbit tangent

    const pos = trail.geometry.attributes.position as BufferAttribute;
    for (let i = 0; i < TRAIL_N; i++) {
      const f = i / (TRAIL_N - 1);
      const t = a - 0.2 - TRAIL_SPAN * (1 - f); // starts just behind the tail
      const r1 = ORBIT_R - (TRAIL_W * f) / 2,
        r2 = ORBIT_R + (TRAIL_W * f) / 2;
      pos.setXYZ(i * 2, Math.cos(t) * r1, 0, Math.sin(t) * r1);
      pos.setXYZ(i * 2 + 1, Math.cos(t) * r2, 0, Math.sin(t) * r2);
    }
    pos.needsUpdate = true;
  });

  const hover = (on: boolean) => {
    paused.current = on;
    document.body.style.cursor = on ? "pointer" : "";
  };

  return (
    <group rotation={[0.45, 0, -0.35]}>
      {/* tilt the whole orbit */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[ORBIT_R, 0.002, 8, 160]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.25} />
      </mesh>
      <primitive object={trail} />

      <group
        ref={plane}
        onClick={onPlaneClick}
        onPointerOver={() => hover(true)}
        onPointerOut={() => hover(false)}
      >
        <mesh>
          {/* invisible, bigger hit area */}
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        {/* roll 90° so the belly faces the Earth */}
        <group rotation={[0, 0, -Math.PI / 2]}>
          <Airliner />
        </group>
      </group>
    </group>
  );
};

const Scene: React.FC<{
  onPlaneClick: () => void;
  progress: React.MutableRefObject<number>;
}> = ({ onPlaneClick, progress }) => {
  const group = useRef<Group>(null);
  const grow = useRef(0.55);

  useFrame((state, dt) => {
    if (!group.current) return;
    const fit = Math.min(1, state.viewport.width / 3.4);
    const t = MathUtils.clamp((progress.current - 0.08) / 0.5, 0, 1);
    grow.current = MathUtils.damp(grow.current, 0.55 + 0.45 * t, 6, dt);
    group.current.scale.setScalar(fit * grow.current);

    group.current.rotation.x = MathUtils.lerp(
      group.current.rotation.x,
      -state.pointer.y * 0.12,
      0.05,
    );
    group.current.rotation.y = MathUtils.lerp(
      group.current.rotation.y,
      state.pointer.x * 0.2,
      0.05,
    );
  });

  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight position={[5, 2, 4]} intensity={2.4} />
      <group ref={group}>
        {/* no scale prop anymore */}
        <Earth />
        <Orbit onPlaneClick={onPlaneClick} />
      </group>
    </>
  );
};

const Globe3D: React.FC<{
  onPlaneClick: () => void;
  active?: boolean;
  progress: React.MutableRefObject<number>;
}> = ({ onPlaneClick, active = true, progress }) => (
  <Canvas
    camera={{ position: [0, 0, 4], fov: 45 }}
    dpr={[1, 1.75]}
    frameloop={active ? "always" : "never"}
    gl={{ powerPreference: "high-performance" }}
  >
    <Suspense fallback={null}>
      <Scene onPlaneClick={onPlaneClick} progress={progress} />
    </Suspense>
  </Canvas>
);

export default Globe3D;
