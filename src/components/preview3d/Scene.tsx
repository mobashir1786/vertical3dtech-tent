
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
    Bounds,
    ContactShadows,
} from "@react-three/drei";

import TentModel from "./TentModel";
import CameraControls from "./CameraControls";
import ModelLoader from "./ModelLoader";

export default function Scene() {
    return (
        <Canvas
            gl={{ preserveDrawingBuffer: true }}
            camera={{
                position: [5, 4, 6],
                fov: 45,
            }}
        >
            <color attach="background" args={["#f8fafc"]} />

            <ambientLight intensity={1.5} />

            <directionalLight
                position={[5, 8, 5]}
                intensity={2}
                castShadow
            />

            <directionalLight
                position={[-5, 5, -5]}
                intensity={1}
            />

            <Suspense fallback={<ModelLoader />}>
                <Bounds fit clip observe margin={1.3}>
                    <TentModel />
                </Bounds>

                <ContactShadows
                    position={[0, -0.01, 0]}
                    opacity={0.4}
                    scale={15}
                    blur={2}
                    far={5}
                />
            </Suspense>

            <CameraControls />
        </Canvas>
    );
}
