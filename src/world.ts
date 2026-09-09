import * as THREE from 'three';

const CHUNK_SIZE=24,VIEW_RADIUS=1,CLEARING_RADIUS=11;
const trunkGeo=new THREE.CylinderGeometry(.16,.22,1.7,6),leafGeo=new THREE.ConeGeometry(1.05,2.5,7),rockGeo=new THREE.DodecahedronGeometry(.55,0);
const trunkMat=new THREE.MeshStandardMaterial({color:0x5b3925}),leafMat=new THREE.MeshStandardMaterial({color:0x2f6b32}),rockMat=new THREE.MeshStandardMaterial({color:0x72777a,roughness:1});

export function installChunkedWorld(scene:THREE.Scene,camera:THREE.Camera):()=>void{
  const root=new THREE.Group();root.name='ProceduralWorld';scene.add(root);
  const chunks=new Map<string,THREE.Group>();const seed=Math.floor(Math.random()*2147483647);let lastCx=999,lastCz=999;
  const hash=(x:number,z:number)=>{let n=(Math.imul(x,374761393)^Math.imul(z,668265263)^seed)>>>0;n=Math.imul(n^(n>>>13),1274126177)>>>0;return((n^(n>>>16))>>>0)/4294967296};
  const addTree=(g:THREE.Group,x:number,z:number,s:number)=>{const t=new THREE.Group();const tr=new THREE.Mesh(trunkGeo,trunkMat),lf=new THREE.Mesh(leafGeo,leafMat);tr.position.y=.85;lf.position.y=2.15;t.add(tr,lf);t.position.set(x,0,z);t.scale.setScalar(s);t.rotation.y=hash(Math.floor(x*10),Math.floor(z*10))*Math.PI*2;g.add(t)};
  const addRock=(g:THREE.Group,x:number,z:number,s:number)=>{const r=new THREE.Mesh(rockGeo,rockMat);r.position.set(x,.42*s,z);r.scale.set(s,.65*s,s);r.rotation.y=hash(Math.floor(x*10),Math.floor(z*10))*Math.PI*2;g.add(r)};
  const generate=(cx:number,cz:number)=>{const key=`${cx},${cz}`;if(chunks.has(key))return;const g=new THREE.Group();g.name=`WorldChunk ${key}`;
    for(let lx=0;lx<CHUNK_SIZE;lx+=4)for(let lz=0;lz<CHUNK_SIZE;lz+=4){const x=cx*CHUNK_SIZE+lx-CHUNK_SIZE/2,z=cz*CHUNK_SIZE+lz-CHUNK_SIZE/2;if(Math.hypot(x,z)<CLEARING_RADIUS)continue;const d=hash(x,z),cluster=hash(Math.floor(x/9),Math.floor(z/9));const ox=(hash(x+1,z)-.5)*2,oz=(hash(x,z+1)-.5)*2;if(cluster>.48&&d>.52)addTree(g,x+ox,z+oz,.75+hash(x+3,z+2)*.55);else if(cluster<.3&&d>.62)addRock(g,x+ox,z+oz,.55+hash(x+4,z+7)*.65);}
    root.add(g);chunks.set(key,g);
  };
  const update=()=>{const cx=Math.floor(camera.position.x/CHUNK_SIZE),cz=Math.floor(camera.position.z/CHUNK_SIZE);if(cx===lastCx&&cz===lastCz)return;lastCx=cx;lastCz=cz;
    for(let x=cx-VIEW_RADIUS;x<=cx+VIEW_RADIUS;x++)for(let z=cz-VIEW_RADIUS;z<=cz+VIEW_RADIUS;z++)generate(x,z);
    for(const[key,g]of chunks){const[x,z]=key.split(',').map(Number);if(Math.abs(x-cx)>VIEW_RADIUS||Math.abs(z-cz)>VIEW_RADIUS){root.remove(g);chunks.delete(key)}}
  };update();return update;
}
