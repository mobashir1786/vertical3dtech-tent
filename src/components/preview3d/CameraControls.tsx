
import { OrbitControls } from "@react-three/drei";

export default function CameraControls() {
    return (
        <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.05}
            enablePan={true}
            enableZoom={true}
            minDistance={2}
            maxDistance={20}
            minPolarAngle={0}
            maxPolarAngle={Math.PI * 0.85}
        />
    );
}
