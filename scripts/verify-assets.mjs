import fs from 'node:fs';
import path from 'node:path';

const models = [
  'public/models/Tent_5_5.glb',
  'public/models/Tent 6.5_6.5.glb',
  'public/models/Tent_8_8.glb',
];
const requiredMaterials = ['fabric_Mat', 'Inner_fabric', 'Metal_mat'];
let failed = false;

for (const modelPath of models) {
  if (!fs.existsSync(modelPath)) {
    console.error(`FAIL missing model: ${modelPath}`);
    failed = true;
    continue;
  }
  const buffer = fs.readFileSync(modelPath);
  if (buffer.toString('ascii', 0, 4) !== 'glTF') {
    console.error(`FAIL invalid GLB header: ${modelPath}`);
    failed = true;
    continue;
  }
  let offset = 12;
  let document;
  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32LE(offset);
    const type = buffer.readUInt32LE(offset + 4);
    offset += 8;
    const chunk = buffer.subarray(offset, offset + length);
    offset += length;
    if (type === 0x4e4f534a) {
      document = JSON.parse(chunk.toString('utf8').replace(/\0+$/, ''));
      break;
    }
  }
  const materialNames = (document?.materials ?? []).map((item) => item.name);
  const nodeNames = (document?.nodes ?? []).map((item) => item.name);
  const hasUv = (document?.meshes ?? []).some((mesh) =>
    (mesh.primitives ?? []).some((primitive) => primitive.attributes?.TEXCOORD_0 !== undefined)
  );
  const missingMaterials = requiredMaterials.filter((name) => !materialNames.includes(name));
  const ok = Boolean(document) && nodeNames.includes('fabric') && hasUv && missingMaterials.length === 0;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${path.basename(modelPath)} | fabric node | UVs | materials`);
  if (!ok) {
    if (!nodeNames.includes('fabric')) console.error('  missing fabric node');
    if (!hasUv) console.error('  missing TEXCOORD_0');
    if (missingMaterials.length) console.error(`  missing materials: ${missingMaterials.join(', ')}`);
    failed = true;
  }
}
if (failed) process.exitCode = 1;
