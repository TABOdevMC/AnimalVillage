import * as THREE from 'three';

export function installSky(scene: THREE.Scene, camera: THREE.Camera) {
  const sky = new THREE.Group();
  sky.name = '3DCloudSky';
  scene.add(sky);

  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xf3f5f0, roughness: 1, transparent: true, opacity: .92 });
  const shadowMat = new THREE.MeshStandardMaterial({ color: 0xcbd2d0, roughness: 1, transparent: true, opacity: .78 });
  const cloudGeo = new THREE.SphereGeometry(1, 8, 6);
  const clusters: THREE.Group[] = [];

  for (let i = 0; i < 14; i++) {
    const c = new THREE.Group();
    const x = (i * 37 % 140) - 70;
    const z = (i * 61 % 140) - 70;
    c.position.set(x, 25 + (i % 4) * 3, z);
    c.scale.setScalar(1.4 + (i % 3) * .35);

    const puffs = 4 + (i % 4);
    for (let p = 0; p < puffs; p++) {
      const puff = new THREE.Mesh(cloudGeo, p % 4 === 0 ? shadowMat : cloudMat);
      puff.position.set((p - (puffs - 1) / 2) * 1.15, (p % 2) * .45 + (p % 3 === 0 ? .2 : 0), (p % 2) * .35);
      puff.scale.set(1.3 + (p % 3) * .25, .65 + (p % 2) * .25, .9 + (p % 2) * .18);
      puff.castShadow = false;
      puff.receiveShadow = false;
      c.add(puff);
    }
    sky.add(c);
    clusters.push(c);
  }

  let last = performance.now();
  const animate = (now: number) => {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    for (let i = 0; i < clusters.length; i++) {
      const c = clusters[i];
      c.position.x += (.35 + (i % 3) * .08) * dt;
      if (c.position.x > 85) c.position.x = -85;
    }
    sky.position.x = camera.position.x * .035;
    sky.position.z = camera.position.z * .035;
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}
