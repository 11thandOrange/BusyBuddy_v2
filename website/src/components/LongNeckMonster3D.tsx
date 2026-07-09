import { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { LucideIcon } from 'lucide-react';

interface LongNeckMonster3DProps {
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

function furTufts(count: number, radiusX: number, radiusY: number, radiusZ: number, seed: number) {
  const pts: [number, number, number][] = [];
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < count; i++) {
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    const x = radiusX * Math.sin(phi) * Math.cos(theta);
    const y = radiusY * Math.cos(phi);
    const z = radiusZ * Math.sin(phi) * Math.sin(theta);
    if (z < -radiusZ * 0.3) continue;
    pts.push([x, y, z]);
  }
  return pts;
}

// An original creature distinct from any reference: a stout coral-toned
// body, a short-segmented curved neck (three angled capsule links, not one
// smooth bent tube), three eyes in a triangular cluster (not stacked), a
// mottled two-tone fur pattern via scattered tufts, four stubby legs, and a
// short curled tail - a different silhouette, proportion set, and color
// story throughout.
const BASE_SCALE = 0.56;

function MonsterMesh({ color, icon: Icon }: Omit<LongNeckMonster3DProps, 'size'>) {
  const groupRef = useRef<THREE.Group>(null);
  const neckRef = useRef<THREE.Group>(null);
  const eye1Ref = useRef<THREE.Mesh>(null);
  const eye2Ref = useRef<THREE.Mesh>(null);
  const [entered, setEntered] = useState(false);

  const dark = useMemo(() => shade(color, -0.42), [color]);
  const light = useMemo(() => shade(color, 0.3), [color]);
  const bodyTufts = useMemo(() => furTufts(30, 0.62, 0.5, 0.55, 11), []);
  const neckTufts = useMemo(() => furTufts(14, 0.24, 0.4, 0.24, 33), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.4) * 0.05;
      if (!entered) {
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.15);
        groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, BASE_SCALE, 0.15));
        if (Math.abs(groupRef.current.rotation.z) < 0.01) setEntered(true);
      }
    }
    if (neckRef.current) neckRef.current.rotation.z = -0.08 + Math.sin(t * 0.9) * 0.05;
    const blink = Math.sin(t * 1.1) > 0.985 ? 0.1 : 1;
    if (eye1Ref.current) eye1Ref.current.scale.y = blink;
    if (eye2Ref.current) eye2Ref.current.scale.y = blink;
  });

  const bodyMat = { color, roughness: 0.94, metalness: 0 };
  const lightMat = { color: light, roughness: 0.94, metalness: 0 };
  const darkMat = { color: dark, roughness: 0.9, metalness: 0 };

  return (
    <group ref={groupRef} rotation={[0, 0, -0.5]} scale={BASE_SCALE} position={[0, -0.6, 0]}>
      {/* tail */}
      <mesh position={[-0.75, -0.55, -0.15]} rotation={[0.3, 0, 1.1]} castShadow>
        <capsuleGeometry args={[0.14, 0.55, 6, 14]} />
        <meshStandardMaterial {...bodyMat} />
      </mesh>
      <mesh position={[-1.05, -0.15, -0.15]} castShadow>
        <sphereGeometry args={[0.13, 14, 14]} />
        <meshStandardMaterial {...bodyMat} />
      </mesh>

      {/* four stubby legs */}
      {[
        [-0.42, -0.98, 0.32],
        [0.42, -0.98, 0.32],
        [-0.42, -0.98, -0.32],
        [0.42, -0.98, -0.32],
      ].map((p, i) => (
        <group key={i}>
          <mesh position={p as [number, number, number]} castShadow>
            <capsuleGeometry args={[0.15, 0.22, 6, 12]} />
            <meshStandardMaterial {...darkMat} />
          </mesh>
          <mesh position={[p[0], p[1] - 0.22, p[2] + 0.06]} castShadow>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshStandardMaterial color="white" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* body */}
      <mesh position={[0, -0.5, 0]} scale={[1, 0.85, 1.05]} castShadow>
        <sphereGeometry args={[0.68, 36, 36]} />
        <meshStandardMaterial {...bodyMat} />
      </mesh>
      {bodyTufts.map((p, i) => (
        <mesh key={`bt-${i}`} position={[p[0], p[1] - 0.5, p[2]]} scale={0.6} castShadow>
          <sphereGeometry args={[0.1, 7, 7]} />
          <meshStandardMaterial {...(i % 3 === 0 ? lightMat : bodyMat)} />
        </mesh>
      ))}

      {/* right arm holding the icon */}
      <group position={[0.6, -0.35, 0.1]} rotation={[0, 0, -0.5]}>
        <mesh position={[0.22, 0.15, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.3, 6, 14]} />
          <meshStandardMaterial {...bodyMat} />
        </mesh>
        <mesh position={[0.36, 0.32, 0]} castShadow>
          <sphereGeometry args={[0.17, 16, 16]} />
          <meshStandardMaterial {...darkMat} />
        </mesh>
        <Html position={[0.36, 0.32, 0]} center distanceFactor={4.4} transform occlude={false}>
          <div
            className="flex items-center justify-center rounded-full bg-white shadow-lg"
            style={{ width: 30, height: 30, color }}
          >
            <Icon size={16} strokeWidth={2.4} />
          </div>
        </Html>
      </group>
      <mesh position={[-0.55, -0.4, 0.15]} rotation={[0, 0, 0.5]} castShadow>
        <capsuleGeometry args={[0.13, 0.3, 6, 14]} />
        <meshStandardMaterial {...bodyMat} />
      </mesh>

      {/* segmented curved neck: three angled links, not a smooth tube */}
      <group ref={neckRef} position={[0.1, 0.1, 0.05]} rotation={[0, 0, -0.08]}>
        <mesh position={[0.05, 0.42, 0]} rotation={[0, 0, -0.12]} scale={[0.85, 1, 0.85]} castShadow>
          <capsuleGeometry args={[0.26, 0.32, 8, 18]} />
          <meshStandardMaterial {...bodyMat} />
        </mesh>
        <mesh position={[0.14, 0.86, 0]} rotation={[0, 0, 0.05]} scale={[0.72, 1, 0.72]} castShadow>
          <capsuleGeometry args={[0.22, 0.3, 8, 18]} />
          <meshStandardMaterial {...bodyMat} />
        </mesh>
        <mesh position={[0.16, 1.28, 0]} rotation={[0, 0, 0.22]} scale={[0.6, 1, 0.6]} castShadow>
          <capsuleGeometry args={[0.18, 0.26, 8, 18]} />
          <meshStandardMaterial {...bodyMat} />
        </mesh>
        {neckTufts.map((p, i) => (
          <mesh key={`nt-${i}`} position={[p[0] + 0.12, p[1] * 1.9 + 0.6, p[2]]} scale={0.4} castShadow>
            <sphereGeometry args={[0.09, 6, 6]} />
            <meshStandardMaterial {...(i % 2 === 0 ? lightMat : bodyMat)} />
          </mesh>
        ))}

        {/* head */}
        <group position={[0.2, 1.62, 0]} rotation={[0, 0, 0.3]}>
          <mesh scale={[0.85, 0.75, 0.85]} castShadow>
            <sphereGeometry args={[0.34, 28, 28]} />
            <meshStandardMaterial {...bodyMat} />
          </mesh>

          {/* two eyes */}
          <mesh ref={eye1Ref} position={[-0.16, 0.13, 0.26]}>
            <sphereGeometry args={[0.13, 20, 20]} />
            <meshStandardMaterial color="white" roughness={0.15} />
          </mesh>
          <mesh position={[-0.16, 0.13, 0.37]}>
            <sphereGeometry args={[0.062, 14, 14]} />
            <meshStandardMaterial color="#1F2430" />
          </mesh>
          <mesh ref={eye2Ref} position={[0.17, 0.13, 0.24]}>
            <sphereGeometry args={[0.13, 20, 20]} />
            <meshStandardMaterial color="white" roughness={0.15} />
          </mesh>
          <mesh position={[0.17, 0.13, 0.35]}>
            <sphereGeometry args={[0.062, 14, 14]} />
            <meshStandardMaterial color="#1F2430" />
          </mesh>

          {/* two small ear tufts */}
          <mesh position={[-0.28, 0.3, -0.05]} rotation={[0, 0, -0.4]} castShadow>
            <coneGeometry args={[0.06, 0.18, 10]} />
            <meshStandardMaterial {...darkMat} />
          </mesh>
          <mesh position={[0.28, 0.3, -0.05]} rotation={[0, 0, 0.4]} castShadow>
            <coneGeometry args={[0.06, 0.18, 10]} />
            <meshStandardMaterial {...darkMat} />
          </mesh>
        </group>
      </group>

      <mesh position={[0, -1.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 32]} />
        <meshBasicMaterial color="black" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

export function LongNeckMonster3D({ color, icon, size = 260 }: LongNeckMonster3DProps) {
  return (
    <div style={{ width: size, height: size }}>
      <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 0.35, 6.4], fov: 30 }} gl={{ alpha: true, antialias: true }}>
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
