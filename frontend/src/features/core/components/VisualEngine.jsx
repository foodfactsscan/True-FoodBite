/**
 * ImmersiveWorld — True FoodBite 3D Storytelling Engine
 * 
 * Features:
 * 1. Infinite Molecular Void (Background)
 * 2. Morphing 3D Indian Product (The 'Scan Target')
 * 3. Dynamic Laser Grid (The 'Scanner')
 * 4. GSAP-powered Scroll Orchestration
 * 
 * Standard: 40+ Years UI/UX Specialist Quality
 */

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
    Float, 
    PerspectiveCamera, 
    Text, 
    MeshDistortMaterial, 
    Environment, 
    Points, 
    PointMaterial,
    Center
} from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Molecular Background Particles ──────────────────────────────────────────
function MolecularBackground() {
    const pointsRef = useRef();
    
    const count = 1200;
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 40;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
        }
        return pos;
    }, []);

    useFrame((state) => {
        const t = state.clock.elapsedTime * 0.05;
        pointsRef.current.rotation.y = t;
        pointsRef.current.rotation.x = t * 0.5;
    });

    return (
        <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#84cc16"
                size={0.06}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.4}
            />
        </Points>
    );
}

// ─── Realistic 3D Masala Pouch & Scanner ──────────────────────────────────────
function ProductBarcode() {
    const lines = useMemo(() => {
        const bars = [];
        let x = -0.5;
        // Generate pseudo-random barcode lines
        for(let i=0; i<35; i++) {
            const width = Math.random() * 0.03 + 0.005;
            if (x + width > 0.5) break; 
            bars.push({ x: x + width/2, width });
            x += width + Math.random() * 0.04 + 0.01;
        }
        return bars;
    }, []);
    
    return (
        <group position={[0, -0.6, -0.201]} rotation={[0, Math.PI, 0]}>
            {/* White barcode background */}
            <mesh>
                <planeGeometry args={[1.4, 0.8]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Barcode lines */}
            {lines.map((l, i) => (
                <mesh key={i} position={[l.x, 0, 0.01]}>
                    <planeGeometry args={[l.width, 0.65]} />
                    <meshBasicMaterial color="#000000" />
                </mesh>
            ))}
            {/* Brand text on back */}
            <Text position={[0, 0.6, 0.01]} fontSize={0.12} color="#94a3b8" anchorX="center" anchorY="middle">
                NUTRITIONAL INFORMATION PER 100g
            </Text>
            <Text position={[0, 0.8, 0.01]} fontSize={0.15} color="#e2e8f0" anchorX="center" anchorY="middle">
                TRUE FOODBITE AUTHENTIC SPICE
            </Text>
        </group>
    );
}

function IndianProduct({ scrollProgress }) {
    const groupRef = useRef();
    const laserRef = useRef();
    const packetRotation = useRef(0);

    useFrame((state, delta) => {
        const t = state.clock.elapsedTime;
        
        if (groupRef.current) {
            // Base floating animation
            const hoverY = Math.sin(t * 1.5) * 0.05;
            groupRef.current.position.y = hoverY;
            
            // Phase 1: Intro (0.0 to 0.25) -> Front showing
            // Phase 2: Rotating to Barcode (0.25 to 0.4) -> Rotates 180 degrees
            // Phase 3: Scanning (0.4 to 0.7) -> Packet stays facing back, laser moves
            // Phase 4: Data Explosion (0.7+) -> Packet scales down slightly, rotates slowly
            
            let targetRotationY = Math.sin(t * 0.5) * 0.1; // idle slight rotation
            let targetScale = 1;
            
            if (scrollProgress > 0.2) {
                // Rotate to back (Math.PI)
                targetRotationY = Math.PI; 
            }
            if (scrollProgress > 0.65) {
                targetScale = 0.85;
                targetRotationY = Math.PI + (scrollProgress - 0.65) * 2; // slow spin
            }

            // Smooth interpolation for rotation and scale
            packetRotation.current = THREE.MathUtils.damp(packetRotation.current, targetRotationY, 4, delta);
            groupRef.current.rotation.y = packetRotation.current;
            
            groupRef.current.scale.setScalar(THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 4, delta));
        }

        // Animate Laser Position
        if (laserRef.current) {
            if (scrollProgress > 0.35 && scrollProgress < 0.65) {
                laserRef.current.visible = true;
                // Map scroll progress 0.35 -> 0.65 to laser position Y from 0.8 to -0.8
                const laserProgress = (scrollProgress - 0.35) / 0.30;
                const targetY = THREE.MathUtils.lerp(0.8, -0.8, laserProgress);
                laserRef.current.position.y = THREE.MathUtils.damp(laserRef.current.position.y, targetY, 15, delta);
                
                // Pulsate laser opacity
                laserRef.current.children[0].material.opacity = 0.6 + Math.sin(t * 20) * 0.2;
            } else {
                laserRef.current.visible = false;
                laserRef.current.position.y = 0.8;
            }
        }
    });

    return (
        <group position={[0, 0, 0]}>
            {/* The Packet Body (A stylized metallic pouch) */}
            <group ref={groupRef}>
                <mesh castShadow receiveShadow>
                    {/* Width, Height, Depth, widthSegments, heightSegments, depthSegments */}
                    <boxGeometry args={[2.5, 3.8, 0.4, 4, 4, 1]} />
                    <meshStandardMaterial 
                        color="#0f172a" 
                        metalness={0.7} 
                        roughness={0.2}
                        envMapIntensity={1.5}
                    />
                </mesh>
                
                {/* Gold Trim / Seal at top and bottom */}
                <mesh position={[0, 1.85, 0]}>
                    <boxGeometry args={[2.55, 0.25, 0.45]} />
                    <meshStandardMaterial color="#ca8a04" metalness={0.8} roughness={0.3} />
                </mesh>
                <mesh position={[0, -1.85, 0]}>
                    <boxGeometry args={[2.55, 0.25, 0.45]} />
                    <meshStandardMaterial color="#ca8a04" metalness={0.8} roughness={0.3} />
                </mesh>

                {/* Front Label Design */}
                <group position={[0, 0, 0.201]}>
                    <mesh>
                        <planeGeometry args={[2.2, 3.2]} />
                        <meshStandardMaterial color="#1e293b" />
                    </mesh>
                    <Text position={[0, 1, 0.01]} fontSize={0.3} color="#facc15" fontWeight="bold">
                        PREMIUM
                    </Text>
                    <Text position={[0, 0.5, 0.01]} fontSize={0.5} color="#ffffff" fontWeight="900">
                        GARAM 
                    </Text>
                     <Text position={[0, 0.0, 0.01]} fontSize={0.5} color="#ffffff" fontWeight="900">
                        MASALA
                    </Text>
                    <Text position={[0, -1, 0.01]} fontSize={0.15} color="#cbd5e1">
                        100% Authentic Indian Spice Blend
                    </Text>
                    {/* Decorative element */}
                    <mesh position={[0, -0.5, 0.01]}>
                        <circleGeometry args={[0.3, 32]} />
                        <meshBasicMaterial color="#ef4444" />
                    </mesh>
                    <mesh position={[0, -0.5, 0.02]}>
                        <circleGeometry args={[0.2, 32]} />
                        <meshBasicMaterial color="#fff" />
                    </mesh>
                </group>

                {/* Back Barcode & Nutrition */}
                <ProductBarcode />
                
                {/* 3D Data Holograms popping out (Phase 4) */}
                {scrollProgress > 0.6 && (
                    <group>
                        <Float speed={3} floatIntensity={2} position={[2, 1, 0]}>
                            <mesh>
                                <planeGeometry args={[1.5, 0.6]} />
                                <meshBasicMaterial color="#16a34a" transparent opacity={0.8} side={THREE.DoubleSide} />
                            </mesh>
                            <Text position={[0, 0, 0.01]} fontSize={0.2} color="#fff">Safe: No Artificial Colors</Text>
                        </Float>
                        <Float speed={2.5} floatIntensity={1.5} position={[-2, -1, 0]}>
                            <mesh>
                                <planeGeometry args={[1.5, 0.6]} />
                                <meshBasicMaterial color="#ef4444" transparent opacity={0.8} side={THREE.DoubleSide} />
                            </mesh>
                            <Text position={[0, 0, 0.01]} fontSize={0.2} color="#fff">Alert: High Sodium</Text>
                        </Float>
                        <Float speed={4} floatIntensity={1} position={[1.5, -2, 0]}>
                            <mesh>
                                <planeGeometry args={[1.8, 0.5]} />
                                <meshBasicMaterial color="#0ea5e9" transparent opacity={0.8} side={THREE.DoubleSide} />
                            </mesh>
                            <Text position={[0, 0, 0.01]} fontSize={0.2} color="#fff">True Score: 78/100</Text>
                        </Float>
                    </group>
                )}
            </group>

            {/* The Laser Scanner */}
            <group ref={laserRef} position={[0, 0.8, -0.6]} visible={false}>
                <mesh>
                    <boxGeometry args={[3, 0.03, 0.03]} />
                    <meshBasicMaterial color="#ef4444" transparent opacity={0.8} />
                </mesh>
                <pointLight color="#ef4444" intensity={2} distance={2} />
            </group>
        </group>
    );
}

// ─── Integrated 3D Navbar Mockup ─────────────────────────────────────────────
function IntegratedNavbar3D({ scrollProgress }) {
    return null; // Disabled in favor of the real DOM floating navbar for better UX
}

// ─── Main Experience Scene ───────────────────────────────────────────────────
function Scene({ scrollProgress }) {
    const { viewport } = useThree();

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#84cc16" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#0ea5e9" />
            
            <Environment preset="city" />

            <MolecularBackground />
            
            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                <IndianProduct scrollProgress={scrollProgress} />
            </Float>

            <IntegratedNavbar3D scrollProgress={scrollProgress} />

            {/* Fog for depth */}
            <fog attach="fog" args={['#0a0f1e', 5, 20]} />
        </>
    );
}

export default function ImmersiveWorld({ scrollProgress = 0 }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            background: '#0a0f1e',
            pointerEvents: 'none'
        }}>
            <Canvas dpr={[1, 2]} shadows>
                <Scene scrollProgress={scrollProgress} />
            </Canvas>
        </div>
    );
}
