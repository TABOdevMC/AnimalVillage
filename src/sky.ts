import * as THREE from 'three';

// Nuages 3D légers : ils restent dans le ciel et projettent de vraies ombres
// sur le terrain grâce à la DirectionalLight configurée dans main.ts.
export function installSky(scene: THREE.Scene, camera: THREE.Camera) {
  const sky = new THREE.Group();
  sky.name = '3DClouds';

  const cloudGeo = new THREE.SphereGeometry(1, 8, 6);
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xf3f5f0,
    roughness: 1,
    metalness: 0
  });

  const cloudPositions = [
    [-28, 22, -18, 5.5, 0.9],
    [4, 27, -34, 6.5, 1.1],
    [30, 20, -8, 5, 0.8],
    [-12, 24, 28, 7, 1],
    [38, 29, 30, 6, 1.2],
    [-42, 19, 8, 5, 0.75]
  ];

  for (let i = 0; i < cloudPositions.length; i++) {
    const [x, y, z, size, stretch] = cloudPositions[i];
    const cloud = new THREE.Group();
    cloud.position.set(x, y, z);

    const puffs = 5 + (i % 3);
    for (let j = 0; j < puffs; j++) {
      const puff = new THREE.Mesh(cloudGeo, cloudMat);
      const t = j / Math.max(1, puffs - 1);
      puff.position.set((t - .5) * size * 1.15, Math.sin(j * 1.7) * .35, (j % 2 ? .25 : -.2) * size);
      puff.scale.set(
        size * (.48 + (j % 3) * .08),
        size * (.28 + (j % 2) * .08) * stretch,
        size * (.34 + ((j + 1) % 3) * .06)
      );
      puff.castShadow = true;
      puff.receiveShadow = true;
      cloud.add(puff);
    }

    sky.add(cloud);
  }

  scene.add(sky);

  // Les nuages suivent la caméra horizontalement pour rester visibles,
  // sans être collés à l'interface ni apparaître devant le terrain.
  const update = () => {
    sky.position.x = Math.round(camera.position.x / 24) * 24;
    sky.position.z = Math.round(camera.position.z / 24) * 24;
  };

  update();
  return update;
}
