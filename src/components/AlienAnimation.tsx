import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

function AlienCore() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.cos(time / 4) / 2;
    meshRef.current.rotation.y = Math.sin(time / 4) / 2;
    meshRef.current.rotation.z = Math.sin(time / 4) / 2;
  });

  return (
    <Float speed={1.4} rotationIntensity={2} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 100, 100]} scale={1.2}>
        <MeshDistortMaterial
          color="#10b981"
          speed={2}
          distort={0.4}
          radius={1}
          emissive="#064e3b"
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>
      {/* Outer Glow */}
      <Sphere args={[1.1, 64, 64]} scale={1.25}>
        <meshBasicMaterial color="#10b981" transparent opacity={0.1} wireframe />
      </Sphere>
    </Float>
  );
}

export default function AlienAnimation() {
  return (
    <div className="w-full h-48 sm:h-64 relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#10b981" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <AlienCore />
      </Canvas>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full" />
      </div>
    </div>
  );
}
