import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MoonProps {
  orbitRadius: number;
  size: number;
  color: string;
  orbitSpeed: number;
  initialAngle?: number;
}

export const Moon = ({ 
  orbitRadius, 
  size, 
  color, 
  orbitSpeed,
  initialAngle = 0 
}: MoonProps) => {
  const moonRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    if (moonRef.current) {
      const angle = initialAngle + time * orbitSpeed;
      moonRef.current.position.x = Math.cos(angle) * orbitRadius;
      moonRef.current.position.z = Math.sin(angle) * orbitRadius;
    }
    
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.2;
    }
  });

  return (
    <group ref={moonRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={color}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      {/* Moon glow */}
      <mesh scale={1.2}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};
