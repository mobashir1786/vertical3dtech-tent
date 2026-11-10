export default function ModelLoader() {
  return (
    <mesh>
      <icosahedronGeometry args={[0.18, 1]} />
      <meshStandardMaterial color="#315c49" wireframe />
    </mesh>
  );
}
