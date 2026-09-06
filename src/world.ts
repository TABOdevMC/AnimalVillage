import * as THREE from 'three';

const CHUNK_SIZE = 24;
const VIEW_RADIUS = 2;
const CLEARING_RADIUS = 11;

const trunkGeo = new THREE.CylinderGeometry(0.16, 0.22, 1.7, 6);
const leafGeo = new THREE.ConeGeometry(1.05, 2.5, 7);
const rockGeo = new THREE.DodecahedronGeometry(0.55, 0);
const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5b3925 });
const leafMat = new THREE.MeshStandardMaterial({ color: 0x2f6b32 });
const rockMat = new THREE.MeshStandardMaterial({ color: 0x72777a, roughness: 1 });

export function installChunkedWorld(scene: THREE.Scene, camera: THREE.Camera): () => void {
  const root = new THREE.Group();
  root.name = 'ProceduralWorld';
  scene.add(root);

  const chunks = new Map<string, THREE.Group>();
  const seed = Math.floor(Math.random() * 2147483647);

  const hash = (x: number, z: number) => {
    let n = (Math.imul(x, 374761393) ^ Math.imul(z, 668265263) ^ seed) >>> 0;
    n = Math.imul(n ^ (n >>> 13), 1274126177) >>> 0;
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  };

  const addTree = (group: THREE.Group, x: number, z: number, scale: number) => {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    const leaves = new THREE.Mesh(leafGeo, leafMat);
    trunk.position.y = 0.85;
    leaves.position.y = 2.15;
    tree.add(trunk, leaves);
    tree.position.set(x, 0, z);
    tree.scale.setScalar(scale);
    tree.rotation.y = hash(Math.floor(x * 10), Math.floor(z * 10)) * Math.PI * 2;
    trunk.castShadow = leaves.castShadow = true;
    trunk.receiveShadow = leaves.receiveShadow = true;
    group.add(tree);
  };

  const addRock = (group: THREE.Group, x: number, z: number, scale: number) => {
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.set(x, 0.42 * scale, z);
    rock.scale.set(scale, 0.65 * scale, scale);
    rock.rotation.y = hash(Math.floor(x * 10), Math.floor(z * 10)) * Math.PI * 2;
    rock.castShadow = rock.receiveShadow = true;
    group.add(rock);
  };

  const generateChunk = (cx: number, cz: number) => {
    const key = `${cx},${cz}`;
    if (chunks.has(key)) return;

    const group = new THREE.Group();
    group.name = `WorldChunk ${key}`;

    for (let lx = 0; lx < CHUNK_SIZE; lx += 3) {
      for (let lz = 0; lz < CHUNK_SIZE; lz += 3) {
        const x = cx * CHUNK_SIZE + lx - CHUNK_SIZE / 2;
        const z = cz * CHUNK_SIZE + lz - CHUNK_SIZE / 2;
        if (Math.hypot(x, z) < CLEARING_RADIUS) continue;

        const density = hash(x, z);
        const cluster = hash(Math.floor(x / 9), Math.floor(z / 9));
        const ox = (hash(x + 1, z) - 0.5) * 2;
        const oz = (hash(x, z + 1) - 0.5) * 2;

        if (cluster > 0.48 && density > 0.48) {
          addTree(group, x + ox, z + oz, 0.75 + hash(x + 3, z + 2) * 0.55);
        } else if (cluster < 0.3 && density > 0.58) {
          addRock(group, x + ox, z + oz, 0.55 + hash(x + 4, z + 7) * 0.65);
        } else if (density > 0.99) {
          addTree(group, x, z, 0.7 + hash(x + 2, z + 2) * 0.4);
        }
      }
    }

    root.add(group);
    chunks.set(key, group);
  };

  const update = () => {
    const cx = Math.floor(camera.position.x / CHUNK_SIZE);
    const cz = Math.floor(camera.position.z / CHUNK_SIZE);

    for (let x = cx - VIEW_RADIUS; x <= cx + VIEW_RADIUS; x++) {
      for (let z = cz - VIEW_RADIUS; z <= cz + VIEW_RADIUS; z++) {
        generateChunk(x, z);
      }
    }

    for (const [key, group] of chunks) {
      const [x, z] = key.split(',').map(Number);
      if (Math.abs(x - cx) > VIEW_RADIUS + 1 || Math.abs(z - cz) > VIEW_RADIUS + 1) {
        root.remove(group);
        chunks.delete(key);
      }
    }
  };

  update();
  return update;
}
