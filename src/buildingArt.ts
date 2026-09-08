import * as THREE from 'three';

const mats={
  wood:new THREE.MeshStandardMaterial({color:0x4b3022,roughness:.92}),
  woodLight:new THREE.MeshStandardMaterial({color:0x795334,roughness:.9}),
  stone:new THREE.MeshStandardMaterial({color:0x77766d,roughness:.96}),
  stoneLight:new THREE.MeshStandardMaterial({color:0x9a9788,roughness:.95}),
  dark:new THREE.MeshStandardMaterial({color:0x2e2924,roughness:.9}),
  iron:new THREE.MeshStandardMaterial({color:0x41413d,roughness:.72,metalness:.25}),
  roof:new THREE.MeshStandardMaterial({color:0x50332c,roughness:.88}),
  roofWarm:new THREE.MeshStandardMaterial({color:0x76503b,roughness:.88}),
  gold:new THREE.MeshStandardMaterial({color:0xb78a3f,roughness:.55,metalness:.35}),
  glass:new THREE.MeshStandardMaterial({color:0x6f9693,roughness:.28,metalness:.05}),
  canvas:new THREE.MeshStandardMaterial({color:0x8a5f42,roughness:1}),
};

const boxGeo=new THREE.BoxGeometry(1,1,1);
const trimGeo=new THREE.BoxGeometry(1,.12,.12);
const beamGeo=new THREE.BoxGeometry(.14,.14,1);
const lanternGeo=new THREE.BoxGeometry(.16,.24,.16);

function part(g:THREE.Group,geo:THREE.BufferGeometry,mat:THREE.Material,pos:THREE.Vector3,scale=new THREE.Vector3(1,1,1)){
  const m=new THREE.Mesh(geo,mat);m.position.copy(pos);m.scale.copy(scale);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;
}
function box(g:THREE.Group,mat:THREE.Material,x:number,y:number,z:number,sx:number,sy:number,sz:number){return part(g,boxGeo,mat,new THREE.Vector3(x,y,z),new THREE.Vector3(sx,sy,sz))}
function roof(g:THREE.Group,mat:THREE.Material,y:number,w:number,d:number){
  const r=new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*.72,Math.max(1,w*.42),4),mat);r.rotation.y=Math.PI/4;r.position.y=y;r.scale.z=d/w;r.castShadow=true;r.receiveShadow=true;g.add(r);return r;
}
function windowFrame(g:THREE.Group,x:number,y:number,z:number){
  box(g,mats.wood,x-.32,y,z,.08,.62,.12);box(g,mats.wood,x+.32,y,z,.08,.62,.12);box(g,mats.wood,x,y-.27,z,.72,.08,.12);box(g,mats.wood,x,y+.27,z,.72,.08,.12);box(g,mats.glass,x,y,z,.5,.45,.06);
}
function foundation(g:THREE.Group,w:number,d:number){box(g,mats.stoneLight,0,.12,0,w+.18,.24,d+.18)}
function chimney(g:THREE.Group,x:number,z:number,y=2.3){box(g,mats.stone,x,y,z,.38,.9,.38);box(g,mats.dark,x,y+.47,z,.48,.08,.48)}
function sign(g:THREE.Group,x:number,y:number,z:number,textColor:number){box(g,new THREE.MeshStandardMaterial({color:textColor,roughness:.9}),x,y,z,.72,.42,.08);box(g,mats.wood,x,y-.3,z,.07,.65,.07)}
function lantern(g:THREE.Group,x:number,y:number,z:number){box(g,mats.iron,x,y,z,.1,.5,.1);box(g,mats.gold,x,y-.02,z,.18,.24,.18)}
function crates(g:THREE.Group,count=2){for(let i=0;i<count;i++)box(g,mats.woodLight,-.8+i*.55,.38,.85,.42,.42,.42)}
function detail(g:THREE.Group,type:string){
  const t=type;
  foundation(g,2.7,2.6);
  if(['house','tavern','bakery'].includes(t)){
    roof(g,t==='bakery'?mats.roofWarm:mats.roof,2.75,3.2,3.0);
    windowFrame(g,-.82,1.18,1.42);windowFrame(g,.82,1.18,1.42);chimney(g,-.9,-.75,2.35);lantern(g,.82,1.55,1.46);
  } else if(t==='market'){
    roof(g,mats.canvas,2.25,3.2,3.0);sign(g,0,1.45,1.48,0xd0a44f);crates(g,3);lantern(g,-1.05,1.55,1.45);lantern(g,1.05,1.55,1.45);
  } else if(t==='farm'){
    for(let i=-1;i<=1;i++)box(g,mats.wood,i*1.15,.62,-1.62,.1,1.2,.1);for(let i=-1;i<=1;i++)box(g,mats.wood,i*1.15,.62,1.62,.1,1.2,.1);box(g,mats.wood,0,1.18,-1.62,3.0,.1,.1);box(g,mats.wood,0,1.18,1.62,3.0,.1,.1);
  } else if(t==='lumber'){
    roof(g,mats.roofWarm,2.3,3.1,2.9);crates(g,3);for(let i=0;i<3;i++)box(g,mats.woodLight,-.7+i*.7,.62,-.9,.55,.32,.55);lantern(g,1.05,1.45,1.4);
  } else if(t==='quarry'){
    crates(g,2);for(let i=0;i<4;i++)box(g,mats.stoneLight,-.9+(i%2)*.65,.45,.75+Math.floor(i/2)*.45,.42,.45,.42);lantern(g,.9,1.55,-.95);
  } else if(t==='mine'){
    roof(g,mats.roof,2.05,3.0,2.8);for(const x of [-1.05,1.05]){box(g,mats.wood,x,.95,1.3,.16,1.55,.16)}box(g,mats.wood,0,1.7,1.3,2.3,.16,.16);lantern(g,0,1.25,1.48);
  } else if(t==='granary'){
    roof(g,mats.roofWarm,2.75,3.1,2.9);for(let i=-1;i<=1;i++)box(g,mats.wood,i*.72,1.1,-1.4,.12,1.8,.12);crates(g,3);
  } else if(t==='warehouse'){
    roof(g,mats.roof,2.7,3.9,3.4);for(let i=-1;i<=1;i++)box(g,mats.wood,i*1.05,1.0,-1.72,.14,1.9,.14);crates(g,3);lantern(g,1.45,1.55,1.72);
  } else if(t==='vault'){
    for(let i=-1;i<=1;i++)box(g,mats.stoneLight,i*.85,2.3,-1.4,.62,.18,.18);box(g,mats.gold,0,1.05,1.43,1.15,1.55,.1);lantern(g,-1.1,1.55,1.35);lantern(g,1.1,1.55,1.35);
  } else if(t==='blacksmith'){
    roof(g,mats.roof,2.25,3.15,3.0);chimney(g,.9,-.8,2.2);box(g,mats.iron,-.7,.65,.65,.65,.32,.55);box(g,mats.woodLight,.8,.85,-.65,.25,1.15,.25);lantern(g,-1.05,1.45,1.4);
  } else if(t==='mill'||t==='windmill'){
    roof(g,mats.roofWarm,3.0,3.1,3.0);box(g,mats.wood,0,2.05,1.35,.18,3.5,.18);for(let i=0;i<4;i++){const b=box(g,mats.woodLight,0,3.15,1.45,.16,1.65,.16);b.rotation.z=i*Math.PI/2+.2}lantern(g,1.0,1.55,1.35);
  } else if(t==='bakery'){
    chimney(g,-.8,-.7,2.2);crates(g,2);lantern(g,1.0,1.45,1.4);
  } else if(t==='barracks'){
    roof(g,mats.roof,2.35,3.9,3.8);for(let i=-1;i<=1;i++)windowFrame(g,i*1.05,1.18,1.78);sign(g,0,1.6,1.82,0x80603e);lantern(g,-1.55,1.5,1.8);lantern(g,1.55,1.5,1.8);
  } else if(t==='tower'){
    for(let i=0;i<4;i++){const a=i*Math.PI/2;box(g,mats.wood,Math.sin(a)*.88,3.0,Math.cos(a)*.88,.18,5.4,.18)}roof(g,mats.roof,4.65,2.8,2.8);lantern(g,0,3.15,1.3);
  } else if(t==='wall'){
    for(let i=-1;i<=1;i++){box(g,mats.stoneLight,i*.92,2.85,0,.7,.18,.95);box(g,mats.wood,i*.92,2.98,0,.78,.1,.12)}
  } else if(t==='university'){
    roof(g,mats.roof,3.35,4.0,3.9);for(let i=-1;i<=1;i++)windowFrame(g,i*1.05,1.45,1.86);chimney(g,-1.15,-1.1,2.9);box(g,mats.gold,0,4.1,0,.14,.8,.14);lantern(g,1.5,1.7,1.85);
  }
  g.userData.artEnhanced=true;
}

const originalAdd=THREE.Scene.prototype.add;
THREE.Scene.prototype.add=function(...objects:THREE.Object3D[]){
  const result=originalAdd.apply(this,objects as any);
  queueMicrotask(()=>{for(const obj of objects){const b=(obj as any).userData?.building;if(b&&!obj.userData.artEnhanced){detail(obj as THREE.Group,b.type)}}});
  return result;
};
