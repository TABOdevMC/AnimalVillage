import * as THREE from 'three';

// Le ciel reste géré par le fond Three.js et la météo.
// Les nuages 3D ont été retirés : ils donnaient l'impression d'être des éléments de l'UI.
export function installSky(_scene: THREE.Scene, _camera: THREE.Camera) {
  return;
}
