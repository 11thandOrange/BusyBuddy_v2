import { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { LucideIcon } from 'lucide-react';

interface Monster3DProps {
  variant: 1 | 2 | 3 | 4 | 5 | 6;
  color: string;
  icon: LucideIcon;
  size?: number;
}

function shade(hex: string, amt: number) {
  const n = hex.replace('#', '');
  const num = parseInt(n, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const adjust = (c: number) => Math.max(0, Math.min(255, Math.round(c + (amt >= 0 ? (255 - c) * amt : c * amt))));
  return `rgb(${adjust(r)}, ${adjust(g)}, ${adjust(b)})`;
}

// Deterministic scatter of small bump-spheres over a sphere's surface, used
// to fake a plush/fuzzy silhouette (no fur shader available) - a fixed seed
// so the tufts don't reshuffle on every render.
function furTufts(count: number, radius: number, seed: number) {
  const pts: [number, number, number][] = [];
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < count; i++) {
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    // keep tufts on the upper/outer hemisphere-ish so they read as a fuzzy
    // rim rather than covering the face
    if (Math.sin(phi) * Math.sin(theta) < -0.2) continue;
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    pts.push([x, y, z]);
  }
  return pts;
}

function MonsterMesh({ color, icon: Icon }: Omit<Monster3DProps, 'size' | 'variant'>) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const eyeLRef = useRef<THREE.Mesh>(null);
  const eyeRRef = useRef<THREE.Mesh>(null);
  const armRRef = useRef<THREE.Group>(null);
  const [entered, setEntered] = useState(false);
  const dark = useMemo(() => shade(color, -0.4), [color]);
  const belly = useMemo(() => shade(color, 0.28), [color]);
  const headTufts = useMemo(() => furTufts(26, 0.62, 7), []);
  const bodyTufts = useMemo(() => furTufts(22, 0.75, 21), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.6) * 0.05;
      groupRef.current.rotation.y = Math.sin(t * 0.55) * 0.15;
      if (!entered) {
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.15);
        groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, 1, 0.15));
        if (Math.abs(groupRef.current.rotation.z) < 0.01) setEntered(true);
      }
    }
    if (headRef.current) headRef.current.rotation.z = Math.sin(t * 1.1) * 0.05;
    if (armRRef.current) armRRef.current.rotation.z = -0.35 + Math.sin(t * 2.2) * 0.06;

    const blink = Math.sin(t * 1.3) > 0.985 ? 0.1 : 1;
    if (eyeLRef.current) eyeLRef.current.scale.y = blink;
    if (eyeRRef.current) eyeRRef.current.scale.y = blink;
  });

  const bodyMat = { color, roughness: 0.92, metalness: 0 };
  const darkMat = { color: dark, roughness: 0.9, metalness: 0 };

  return (
    <group ref={groupRef} rotation={[0, 0, -0.5]} scale={0.62} position={[0, -0.3, 0]}>
      {/* legs */}
      <mesh position={[-0.32, -1.05, 0]} rotation={[0.1, 0, 0.05]} castShadow>
        <capsuleGeometry args={[0.19, 0.4, 6, 16]} />
        <meshStandardMaterial {...darkMat} />
      </mesh>
      <mesh position={[0.32, -1.05, 0]} rotation={[0.1, 0, -0.05]} castShadow>
        <capsuleGeometry args={[0.19, 0.4, 6, 16]} />
        <meshStandardMaterial {...darkMat} />
      </mesh>
      {/* feet */}
      <mesh position={[-0.32, -1.45, 0.08]} castShadow>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshStandardMaterial {...darkMat} />
      </mesh>
      <mesh position={[0.32, -1.45, 0.08]} castShadow>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshStandardMaterial {...darkMat} />
      </mesh>

      {/* torso */}
      <mesh position={[0, -0.35, 0]} scale={[1, 1.15, 0.95]} castShadow>
        <sphereGeometry args={[0.78, 40, 40]} />
        <meshStandardMaterial {...bodyMat} />
      </mesh>
      {/* belly patch */}
      <mesh position={[0, -0.35, 0.68]} scale={[0.62, 0.8, 0.3]}>
        <sphereGeometry args={[0.55, 28, 28]} />
        <meshStandardMaterial color={belly} roughness={0.95} />
      </mesh>
      {/* body fur tufts */}
      {bodyTufts.map((p, i) => (
        <mesh key={`bt-${i}`} position={[p[0], p[1] - 0.35, p[2]]} scale={0.62} castShadow>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial {...bodyMat} />
        </mesh>
      ))}

      {/* left arm (hangs, idle) */}
      <group rotation={[0, 0, 0.4]} position={[-0.62, -0.15, 0]}>
        <mesh position={[-0.28, -0.32, 0]} rotation={[0, 0, 0.15]} castShadow>
          <capsuleGeometry args={[0.16, 0.5, 6, 16]} />
          <meshStandardMaterial {...bodyMat} />
        </mesh>
        <mesh position={[-0.4, -0.62, 0]} castShadow>
          <sphereGeometry args={[0.19, 18, 18]} />
          <meshStandardMaterial {...darkMat} />
        </mesh>
      </group>

      {/* right arm (raised, holding the icon) */}
      <group ref={armRRef} position={[0.55, 0.02, 0.05]} rotation={[0, 0, -0.3]}>
        <mesh position={[0.26, 0.22, 0]} rotation={[0, 0, -0.25]} castShadow>
          <capsuleGeometry args={[0.16, 0.42, 6, 16]} />
          <meshStandardMaterial {...bodyMat} />
        </mesh>
        <mesh position={[0.42, 0.46, 0]} castShadow>
          <sphereGeometry args={[0.22, 20, 20]} />
          <meshStandardMaterial {...darkMat} />
        </mesh>
        <Html position={[0.42, 0.46, 0]} center distanceFactor={4.2} transform occlude={false}>
          <div
            className="flex items-center justify-center rounded-full bg-white shadow-lg"
            style={{ width: 32, height: 32, color }}
          >
            <Icon size={17} strokeWidth={2.4} />
          </div>
        </Html>
      </group>

      {/* head */}
      <group ref={headRef} position={[0, 0.68, 0]}>
        <mesh scale={[1, 0.95, 1]} castShadow>
          <sphereGeometry args={[0.62, 40, 40]} />
          <meshStandardMaterial {...bodyMat} />
        </mesh>

        {/* head fur tufts */}
        {headTufts.map((p, i) => (
          <mesh key={`ht-${i}`} position={p} scale={0.5} castShadow>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial {...bodyMat} />
          </mesh>
        ))}

        {/* ears */}
        <mesh position={[-0.5, 0.42, 0]} rotation={[0, 0, -0.3]} castShadow>
          <sphereGeometry args={[0.16, 18, 18]} />
          <meshStandardMaterial {...bodyMat} />
        </mesh>
        <mesh position={[0.5, 0.42, 0]} rotation={[0, 0, 0.3]} castShadow>
          <sphereGeometry args={[0.16, 18, 18]} />
          <meshStandardMaterial {...bodyMat} />
        </mesh>

        {/* eyes - sized/positioned with margin outside the head radius so
            they never sink into the mesh */}
        <mesh ref={eyeLRef} position={[-0.24, 0.05, 0.56]}>
          <sphereGeometry args={[0.155, 24, 24]} />
          <meshStandardMaterial color="white" roughness={0.15} />
        </mesh>
        <mesh position={[-0.24, 0.05, 0.68]}>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshStandardMaterial color="#1F2430" />
        </mesh>
        <mesh ref={eyeRRef} position={[0.24, 0.05, 0.56]}>
          <sphereGeometry args={[0.155, 24, 24]} />
          <meshStandardMaterial color="white" roughness={0.15} />
        </mesh>
        <mesh position={[0.24, 0.05, 0.68]}>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshStandardMaterial color="#1F2430" />
        </mesh>

        {/* small snout/muzzle for a friendlier face */}
        <mesh position={[0, -0.18, 0.58]} scale={[0.85, 0.65, 0.7]}>
          <sphereGeometry args={[0.24, 20, 20]} />
          <meshStandardMaterial color={belly} roughness={0.95} />
        </mesh>
      </group>

      {/* ground shadow */}
      <mesh position={[0, -1.66, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.85, 32]} />
        <meshBasicMaterial color="black" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

export function Monster3D({ color, icon, size = 260 }: Monster3DProps) {
  return (
    <div style={{ width: size, height: size }}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.1, 5.2], fov: 30 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[3, 4, 4]} intensity={1.05} castShadow />
        <directionalLight position={[-3, 2, -2]} intensity={0.35} />
        <Suspense fallback={null}>
          <MonsterMesh color={color} icon={icon} />
        </Suspense>
      </Canvas>
    </div>
  );
}
