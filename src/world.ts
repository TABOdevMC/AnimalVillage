import * as THREE from 'three';

const CHUNK_SIZE=24,VIEW_RADIUS=1,CLEARING_RADIUS=11,WATER_LEVEL=-.35;
const trunkGeo=new THREE.CylinderGeometry(.16,.22,1.7,6),leafGeo=new THREE.ConeGeometry(1.05,2.5,7),rockGeo=new THREE.DodecahedronGeometry(.55,0);
const trunkMat=new THREE.MeshStandardMaterial({color:0x5b3925}),leafMat=new THREE.MeshStandardMaterial({color:0x2f6b32}),rockMat=new THREE.MeshStandardMaterial({color:0x72777a,roughness:1});

export function installChunkedWorld(scene:THREE.Scene,camera:THREE.Camera):()=>void{
  // Le terrain procédural est la seule surface du sol. L'ancien plan global et le
  // GridHelper étaient coplanaires avec les chunks et provoquaient du z-fighting.
  for(const obj of [...scene.children]){
    if((obj as any).isGridHelper){scene.remove(obj);continue;}
    if((obj as any).isMesh){const g=(obj as any).geometry?.parameters;const c=(obj as any).material?.color?.getHex?.();if(g?.width===120&&g?.height===120&&c===0x174d2a)scene.remove(obj);}
  }
  const root=new THREE.Group();root.name='ProceduralWorld';scene.add(root);
  const chunks=new Map<string,THREE.Group>();const seed=Math.floor(Math.random()*2147483647);let lastCx=999,lastCz=999;
  const hash=(x:number,z:number)=>{let n=(Math.imul(x,374761393)^Math.imul(z,668265263)^seed)>>>0;n=Math.imul(n^(n>>>13),1274126177)>>>0;return((n^(n>>>16))>>>0)/4294967296};
  const terrainHeight=(x:number,z:number)=>{if(Math.hypot(x,z)<CLEARING_RADIUS+4)return 0;const broad=Math.sin(x*.055+seed*.00001)*.9+Math.cos(z*.047-seed*.000013)*.75;const detail=Math.sin((x+z)*.13)*.22+Math.cos((x-z)*.11)*.18;return Math.max(WATER_LEVEL+.08,broad+detail)};
  const isBuildable=(x:number,z:number,size=3)=>{if(Math.hypot(x,z)<CLEARING_RADIUS+2)return true;const r=size*.8;const h=terrainHeight(x,z),samples=[[x-r,z-r],[x+r,z-r],[x-r,z+r],[x+r,z+r],[x,z]];return samples.every(([sx,sz])=>terrainHeight(sx,sz)>WATER_LEVEL+.08&&Math.abs(terrainHeight(sx,sz)-h)<.35)};
  (scene as any).terrainHeight=terrainHeight;(scene as any).isBuildable=isBuildable;(scene as any).waterLevel=WATER_LEVEL;
  const addTree=(g:THREE.Group,x:number,z:number,s:number)=>{const t=new THREE.Group();const tr=new THREE.Mesh(trunkGeo,trunkMat),lf=new THREE.Mesh(leafGeo,leafMat);tr.position.y=.85;lf.position.y=2.15;t.add(tr,lf);t.position.set(x,terrainHeight(x,z),z);t.scale.setScalar(s);t.rotation.y=hash(Math.floor(x*10),Math.floor(z*10))*Math.PI*2;g.add(t)};
  const addRock=(g:THREE.Group,x:number,z:number,s:number)=>{const r=new THREE.Mesh(rockGeo,rockMat);r.position.set(x,terrainHeight(x,z)+.42*s,z);r.scale.set(s,.65*s,s);r.rotation.y=hash(Math.floor(x*10),Math.floor(z*10))*Math.PI*2;g.add(r)};
  const makeTerrain=(cx:number,cz:number)=>{const seg=8,geo=new THREE.PlaneGeometry(CHUNK_SIZE,CHUNK_SIZE,seg,seg),pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const lx=pos.getX(i),lz=-pos.getY(i);pos.setZ(i,terrainHeight(cx*CHUNK_SIZE+lx,lz+cz*CHUNK_SIZE))}geo.computeVertexNormals();const mat=new THREE.MeshStandardMaterial({color:0x326b3b,roughness:1});const mesh=new THREE.Mesh(geo,mat);mesh.rotation.x=-Math.PI/2;mesh.position.set(cx*CHUNK_SIZE,0,cz*CHUNK_SIZE);mesh.receiveShadow=true;mesh.userData.terrain=true;return mesh};
  const makeWater=(cx:number,cz:number)=>{const geo=new THREE.PlaneGeometry(CHUNK_SIZE,CHUNK_SIZE),mat=new THREE.MeshStandardMaterial({color:0x3b82a0,transparent:true,opacity:.62,roughness:.18,metalness:.05});const mesh=new THREE.Mesh(geo,mat);mesh.rotation.x=-Math.PI/2;mesh.position.set(cx*CHUNK_SIZE,WATER_LEVEL,cz*CHUNK_SIZE);mesh.userData.water=true;return mesh};
  const clearAroundBuildings=()=>{
    const buildings:any[]=[];scene.traverse((obj:any)=>{if(obj.userData?.building)buildings.push(obj)});if(!buildings.length)return;
    const targets:any[]=[];root.traverse((obj:any)=>{if(obj.isMesh||obj.isGroup)targets.push(obj)});
    for(const building of buildings){const b=building.userData.building,size=Number(b?.size||3)*1.5,center=new THREE.Vector3();building.getWorldPosition(center);for(const target of targets){if(!target.parent||target===root||target===building||target.userData?.terrain||target.userData?.water)continue;const p=new THREE.Vector3();target.getWorldPosition(p);if(Math.abs(p.x-center.x)<=size&&Math.abs(p.z-center.z)<=size){const chunk=target.parent;if(chunk&&chunk.parent===root){root.remove(chunk);for(const[key,value]of chunks)if(value===chunk){chunks.delete(key);break}}}}}
  };
  const generate=(cx:number,cz:number)=>{const key=`${cx},${cz}`;if(chunks.has(key))return;const g=new THREE.Group();g.name=`WorldChunk ${key}`;g.add(makeTerrain(cx,cz));
    const waterPositions:number[][]=[];for(let lx=2;lx<CHUNK_SIZE;lx+=4)for(let lz=2;lz<CHUNK_SIZE;lz+=4){const x=cx*CHUNK_SIZE+lx-CHUNK_SIZE/2,z=cz*CHUNK_SIZE+lz-CHUNK_SIZE/2;if(Math.hypot(x,z)<CLEARING_RADIUS+5)continue;if(terrainHeight(x,z)<=WATER_LEVEL+.11&&hash(x+91,z-37)>.32)waterPositions.push([x,z])}
    for(const [x,z] of waterPositions){const w=makeWater(cx,cz);w.scale.set(.18,.18,.18);w.position.set(x,WATER_LEVEL,z);g.add(w)}
    for(let lx=0;lx<CHUNK_SIZE;lx+=4)for(let lz=0;lz<CHUNK_SIZE;lz+=4){const x=cx*CHUNK_SIZE+lx-CHUNK_SIZE/2,z=cz*CHUNK_SIZE+lz-CHUNK_SIZE/2;if(Math.hypot(x,z)<CLEARING_RADIUS)continue;const d=hash(x,z),cluster=hash(Math.floor(x/9),Math.floor(z/9)),h=terrainHeight(x,z);if(h<=WATER_LEVEL+.12)continue;const ox=(hash(x+1,z)-.5)*2,oz=(hash(x,z+1)-.5)*2;if(cluster>.48&&d>.52)addTree(g,x+ox,z+oz,.75+hash(x+3,z+2)*.55);else if(cluster<.3&&d>.62)addRock(g,x+ox,z+oz,.55+hash(x+4,z+7)*.65)}
    root.add(g);chunks.set(key,g);
  };
  const update=()=>{const cx=Math.floor(camera.position.x/CHUNK_SIZE),cz=Math.floor(camera.position.z/CHUNK_SIZE);if(cx!==lastCx||cz!==lastCz){lastCx=cx;lastCz=cz;for(let x=cx-VIEW_RADIUS;x<=cx+VIEW_RADIUS;x++)for(let z=cz-VIEW_RADIUS;z<=cz+VIEW_RADIUS;z++)generate(x,z);for(const[key,g]of chunks){const[x,z]=key.split(',').map(Number);if(Math.abs(x-cx)>VIEW_RADIUS||Math.abs(z-cz)>VIEW_RADIUS){root.remove(g);chunks.delete(key)}}}clearAroundBuildings()};update();return update;
}
