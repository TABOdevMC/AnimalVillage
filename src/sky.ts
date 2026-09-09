import * as THREE from 'three';

export function installSky(scene: THREE.Scene, camera: THREE.Camera) {
  const sky = new THREE.Group();
  sky.name = '3DClouds';

  const cloudGeo = new THREE.SphereGeometry(1, 8, 6);
  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xf3f5f0, roughness: 1 });
  const cloudPositions = [
    [-28,22,-18,5.5,.9],[4,27,-34,6.5,1.1],[30,20,-8,5,.8],
    [-12,24,28,7,1],[38,29,30,6,1.2],[-42,19,8,5,.75]
  ];
  const clouds: THREE.Group[] = [];

  for(let i=0;i<cloudPositions.length;i++){
    const [x,y,z,size,stretch]=cloudPositions[i];
    const cloud=new THREE.Group();cloud.position.set(x,y,z);
    const puffs=5+(i%3);
    for(let j=0;j<puffs;j++){
      const puff=new THREE.Mesh(cloudGeo,cloudMat);const t=j/Math.max(1,puffs-1);
      puff.position.set((t-.5)*size*1.15,Math.sin(j*1.7)*.35,(j%2?.25:-.2)*size);
      puff.scale.set(size*(.48+(j%3)*.08),size*(.28+(j%2)*.08)*stretch,size*(.34+((j+1)%3)*.06));
      puff.castShadow=true;puff.receiveShadow=true;cloud.add(puff);
    }
    clouds.push(cloud);sky.add(cloud);
  }

  const sunGroup=new THREE.Group();sunGroup.name='3DSun';sunGroup.position.set(38,38,-55);
  const sunCore=new THREE.Mesh(new THREE.SphereGeometry(3.2,20,14),new THREE.MeshBasicMaterial({color:0xffef9a}));
  const sunHalo=new THREE.Mesh(new THREE.SphereGeometry(5.8,16,12),new THREE.MeshBasicMaterial({color:0xffe58a,transparent:true,opacity:.16,depthWrite:false,blending:THREE.AdditiveBlending}));
  const sunHalo2=new THREE.Mesh(new THREE.SphereGeometry(9,16,12),new THREE.MeshBasicMaterial({color:0xffd76a,transparent:true,opacity:.045,depthWrite:false,blending:THREE.AdditiveBlending}));
  sunCore.renderOrder=5;sunHalo.renderOrder=4;sunHalo2.renderOrder=3;sunGroup.add(sunCore,sunHalo,sunHalo2);sky.add(sunGroup);

  const lightningGroup=new THREE.Group();lightningGroup.name='3DLightning';lightningGroup.visible=false;
  const boltMat=new THREE.MeshBasicMaterial({color:0xeaf7ff});const glowMat=new THREE.MeshBasicMaterial({color:0x8fdcff,transparent:true,opacity:.45});
  const boltLight=new THREE.PointLight(0xbfe9ff,0,60,2);boltLight.castShadow=false;lightningGroup.add(boltLight);
  const makeBolt=(mat:THREE.Material,radius:number)=>{const g=new THREE.Group();const points=[new THREE.Vector3(0,0,0),new THREE.Vector3(-.45,-2.1,.12),new THREE.Vector3(.3,-4.2,-.1),new THREE.Vector3(-.2,-6.2,.15),new THREE.Vector3(.1,-8.7,0)];for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],dir=b.clone().sub(a),len=dir.length();const seg=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius*.72,len,5),mat);seg.position.copy(a).add(b).multiplyScalar(.5);seg.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());g.add(seg)}return g};
  lightningGroup.add(makeBolt(glowMat,.13),makeBolt(boltMat,.055));scene.add(lightningGroup);

  let flashTimer=2+Math.random()*5,flashTime=0,last=performance.now();
  const weatherEl=document.getElementById('weather');
  const triggerLightning=()=>{lightningGroup.position.set(camera.position.x+(Math.random()-.5)*30,29+Math.random()*4,camera.position.z+(Math.random()-.5)*30);lightningGroup.rotation.y=Math.random()*Math.PI*2;lightningGroup.visible=true;flashTime=.24;boltLight.intensity=14};

  scene.add(sky);
  const update=()=>{
    sky.position.x=camera.position.x;sky.position.z=camera.position.z;
    const now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;
    const weather=weatherEl?.textContent||'';
    const storm=weather.includes('Orage');

    // Couverture nuageuse dynamique selon la météo : de presque aucun nuage à ciel totalement couvert.
    let cloudCount=0;
    let cloudOpacity=1;
    if(weather.includes('Beau temps')) cloudCount=0;
    else if(weather.includes('Canicule')) cloudCount=0;
    else if(weather.includes('Éclaircies')) cloudCount=2;
    else if(weather.includes('Nuageux')) cloudCount=4;
    else if(weather.includes('Pluie torrentielle')) cloudCount=6;
    else if(weather.includes('Pluie')) cloudCount=5;
    else if(weather.includes('Orage')) cloudCount=6;
    else if(weather.includes('Ouragan')) cloudCount=6;
    else if(weather.includes('Tempête de neige')) cloudCount=5;
    else if(weather.includes('Neige')) cloudCount=4;
    else cloudCount=2;

    clouds.forEach((cloud,i)=>{cloud.visible=i<cloudCount;cloud.children.forEach((puff:any)=>{puff.material.opacity=cloudOpacity})});

    const clear=weather.includes('Beau temps')||weather.includes('Canicule');
    sunGroup.visible=clear;
    if(storm){flashTimer-=dt;if(flashTimer<=0){triggerLightning();flashTimer=4+Math.random()*8}}else{flashTimer=2+Math.random()*5;lightningGroup.visible=false;boltLight.intensity=0}
    if(flashTime>0){flashTime-=dt;boltLight.intensity=Math.max(0,14*(flashTime/.24));if(flashTime<=0){lightningGroup.visible=false;boltLight.intensity=0}}
  };
  update();
  return update;
}
