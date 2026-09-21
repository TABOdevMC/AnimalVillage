import * as THREE from 'three';

export function installSky(scene: THREE.Scene, camera: THREE.Camera) {
  const sky = new THREE.Group();
  sky.name = '3DWeatherSky';

  const cloudGeo = new THREE.SphereGeometry(1, 10, 7);
  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xf1f3f1, roughness: 1 });
  const stormCloudMat = new THREE.MeshStandardMaterial({ color: 0x5c6870, roughness: 1 });
  const cloudPositions = [
    [-28,22,-18,5.5,.9],[4,27,-34,6.5,1.1],[30,20,-8,5,.8],
    [-12,24,28,7,1],[38,29,30,6,1.2],[-42,19,8,5,.75]
  ];
  const clouds: THREE.Group[] = [];
  for(let i=0;i<cloudPositions.length;i++){
    const [x,y,z,size,stretch]=cloudPositions[i];
    const cloud=new THREE.Group(); cloud.position.set(x,y,z);
    const puffs=5+(i%3);
    for(let j=0;j<puffs;j++){
      const puff=new THREE.Mesh(cloudGeo,cloudMat);
      const t=j/Math.max(1,puffs-1);
      puff.position.set((t-.5)*size*1.15,Math.sin(j*1.7)*.35,(j%2?.25:-.2)*size);
      puff.scale.set(size*(.48+(j%3)*.08),size*(.28+(j%2)*.08)*stretch,size*(.34+((j+1)%3)*.06));
      // Les nuages restent éclairés en 3D mais ne projettent pas d'ombres
      // sur le terrain : cela évite les artefacts de shadow-map rayés au sol.
      puff.castShadow=false; puff.receiveShadow=false; cloud.add(puff);
    }
    clouds.push(cloud); sky.add(cloud);
  }

  const sunGroup=new THREE.Group(); sunGroup.name='3DSun'; sunGroup.position.set(38,38,-55);
  const sunCore=new THREE.Mesh(new THREE.SphereGeometry(3.2,20,14),new THREE.MeshBasicMaterial({color:0xffef9a}));
  const sunHalo=new THREE.Mesh(new THREE.SphereGeometry(5.8,16,12),new THREE.MeshBasicMaterial({color:0xffe58a,transparent:true,opacity:.16,depthWrite:false,blending:THREE.AdditiveBlending}));
  const sunHalo2=new THREE.Mesh(new THREE.SphereGeometry(9,16,12),new THREE.MeshBasicMaterial({color:0xffd76a,transparent:true,opacity:.045,depthWrite:false,blending:THREE.AdditiveBlending}));
  sunGroup.add(sunCore,sunHalo,sunHalo2); sky.add(sunGroup);

  const precipitation=new THREE.Group(); precipitation.name='3DPrecipitation';
  const rainCount=700, rainPositions=new Float32Array(rainCount*3), rainVelocities=new Float32Array(rainCount*3);
  for(let i=0;i<rainCount;i++){const k=i*3;rainPositions[k]=(Math.random()-.5)*90;rainPositions[k+1]=4+Math.random()*42;rainPositions[k+2]=(Math.random()-.5)*90;rainVelocities[k]=-.6-Math.random()*.4;rainVelocities[k+1]=-18-Math.random()*18;rainVelocities[k+2]=.4+Math.random()*.7;}
  const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPositions,3));
  const rainMat=new THREE.PointsMaterial({color:0xb8d9ef,size:.13,transparent:true,opacity:.72,depthWrite:false,sizeAttenuation:true});
  const rain=new THREE.Points(rainGeo,rainMat);rain.name='RainParticles';precipitation.add(rain);
  const snowPositions=new Float32Array(320*3);
  for(let i=0;i<320;i++){const k=i*3;snowPositions[k]=(Math.random()-.5)*90;snowPositions[k+1]=4+Math.random()*40;snowPositions[k+2]=(Math.random()-.5)*90;}
  const snowGeo=new THREE.BufferGeometry();snowGeo.setAttribute('position',new THREE.BufferAttribute(snowPositions,3));
  const snowMat=new THREE.PointsMaterial({color:0xffffff,size:.25,transparent:true,opacity:.9,depthWrite:false,sizeAttenuation:true});
  const snow=new THREE.Points(snowGeo,snowMat);snow.name='SnowParticles';precipitation.add(snow);precipitation.visible=false;sky.add(precipitation);

  // Effet de vent : longues particules translucides, plus rapides pendant l'ouragan.
  const windCount=150,windPos=new Float32Array(windCount*3),windVel=new Float32Array(windCount);
  for(let i=0;i<windCount;i++){const k=i*3;windPos[k]=(Math.random()-.5)*90;windPos[k+1]=1+Math.random()*25;windPos[k+2]=(Math.random()-.5)*90;windVel[i]=10+Math.random()*16;}
  const windGeo=new THREE.BufferGeometry();windGeo.setAttribute('position',new THREE.BufferAttribute(windPos,3));
  const windMat=new THREE.PointsMaterial({color:0xe1eef0,size:.09,transparent:true,opacity:.32,depthWrite:false,sizeAttenuation:true});
  const wind=new THREE.Points(windGeo,windMat);wind.name='WindGusts';wind.visible=false;sky.add(wind);

  // Vortex 3D de l'ouragan, discret mais clairement visible depuis le sol.
  const hurricane=new THREE.Group();hurricane.name='3DHurricaneVortex';hurricane.visible=false;
  const vortexMat=new THREE.MeshBasicMaterial({color:0x71858c,transparent:true,opacity:.24,depthWrite:false,side:THREE.DoubleSide});
  const vortexCore=new THREE.Mesh(new THREE.CylinderGeometry(.7,4.8,18,28,1,true),vortexMat);vortexCore.position.y=10;
  const vortexTop=new THREE.Mesh(new THREE.TorusGeometry(5.2,.42,10,36),new THREE.MeshBasicMaterial({color:0x9eafb3,transparent:true,opacity:.32,depthWrite:false}));vortexTop.rotation.x=Math.PI/2;vortexTop.position.y=19;
  hurricane.add(vortexCore,vortexTop);sky.add(hurricane);

  // Éclairs ramifiés + flash lumineux.
  const lightningGroup=new THREE.Group();lightningGroup.name='3DLightning';lightningGroup.visible=false;
  const boltMat=new THREE.MeshBasicMaterial({color:0xeaf7ff});const glowMat=new THREE.MeshBasicMaterial({color:0x8fdcff,transparent:true,opacity:.45});
  const boltLight=new THREE.PointLight(0xbfe9ff,0,65,2);lightningGroup.add(boltLight);
  const makeBolt=(mat:THREE.Material,radius:number,branch=false)=>{const g=new THREE.Group();const points=[new THREE.Vector3(0,0,0),new THREE.Vector3(-.45,-2.1,.12),new THREE.Vector3(.3,-4.2,-.1),new THREE.Vector3(-.2,-6.2,.15),new THREE.Vector3(.1,-8.7,0)];for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],dir=b.clone().sub(a),len=dir.length();const seg=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius*.72,len,5),mat);seg.position.copy(a).add(b).multiplyScalar(.5);seg.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());g.add(seg);if(branch&&i===1){const bd=new THREE.Vector3(.9,-2.2,-.2);const bl=bd.length();const bs=new THREE.Mesh(new THREE.CylinderGeometry(radius*.65,radius*.35,bl,5),mat);bs.position.copy(a).add(bd).multiplyScalar(.5);bs.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),bd.normalize());g.add(bs);}}return g;};
  lightningGroup.add(makeBolt(glowMat,.14,true),makeBolt(boltMat,.055,true));scene.add(lightningGroup);

  let flashTimer=2+Math.random()*5,flashTime=0,last=performance.now(),cloudTime=0;
  const weatherEl=document.getElementById('weather');
  const triggerLightning=()=>{lightningGroup.position.set(camera.position.x+(Math.random()-.5)*30,29+Math.random()*4,camera.position.z+(Math.random()-.5)*30);lightningGroup.rotation.y=Math.random()*Math.PI*2;lightningGroup.visible=true;flashTime=.24;boltLight.intensity=18;};
  scene.add(sky);

  const update=()=>{
    sky.position.x=camera.position.x;sky.position.z=camera.position.z;
    const now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;cloudTime+=dt;
    const weather=weatherEl?.textContent||'';
    const storm=weather.includes('Orage'), hurricaneWeather=weather.includes('Ouragan');
    const heavyRain=weather.includes('Pluie torrentielle');
    const blizzard=weather.includes('Tempête de neige');

    let cloudCount=0;
    if(weather.includes('Beau temps')||weather.includes('Canicule'))cloudCount=0;
    else if(weather.includes('Éclaircies'))cloudCount=2;
    else if(weather.includes('Nuageux'))cloudCount=4;
    else if(weather.includes('Pluie torrentielle'))cloudCount=6;
    else if(weather.includes('Pluie'))cloudCount=5;
    else if(weather.includes('Orage')||weather.includes('Ouragan'))cloudCount=6;
    else if(weather.includes('Tempête de neige'))cloudCount=6;
    else if(weather.includes('Neige'))cloudCount=4; else cloudCount=2;
    clouds.forEach((cloud,i)=>{cloud.visible=i<cloudCount;const speed=hurricaneWeather?.08:heavyRain?.04:.012;cloud.position.x=cloudPositions[i][0]+Math.sin(cloudTime*speed+i)*1.8;cloud.position.z=cloudPositions[i][2]+Math.cos(cloudTime*speed*.8+i*.7)*1.2;cloud.children.forEach((p:any)=>p.material=storm||hurricaneWeather||heavyRain?stormCloudMat:cloudMat);});
    sunGroup.visible=weather.includes('Beau temps')||weather.includes('Canicule');

    const rainy=weather.includes('Pluie')||weather.includes('Torrentielle')||storm||hurricaneWeather;const snowy=weather.includes('Neige')||blizzard;
    precipitation.visible=rainy||snowy;rain.visible=rainy;snow.visible=snowy;
    const windStrength=hurricaneWeather?4.5:storm?2.5:heavyRain?1.8:1;
    if(rainy){const pos=rainGeo.attributes.position.array as Float32Array;for(let i=0;i<rainCount;i++){const k=i*3;pos[k]+=rainVelocities[k]*dt*windStrength;pos[k+1]+=rainVelocities[k+1]*dt*(hurricaneWeather?1.25:1);pos[k+2]+=rainVelocities[k+2]*dt*windStrength;if(pos[k+1]<1||Math.abs(pos[k])>55){pos[k]=(Math.random()-.5)*90;pos[k+1]=38+Math.random()*10;pos[k+2]=(Math.random()-.5)*90;}}rainGeo.attributes.position.needsUpdate=true;rainMat.opacity=hurricaneWeather?.86:heavyRain?.8:.72;}
    if(snowy){const pos=snowGeo.attributes.position.array as Float32Array;for(let i=0;i<320;i++){const k=i*3;pos[k]+=Math.sin(cloudTime+i)*.018*windStrength;pos[k+1]-=dt*(blizzard?2.1:1.1+((i%7)*.08));pos[k+2]+=Math.cos(cloudTime*.7+i)*.012*windStrength;if(pos[k+1]<1){pos[k]=(Math.random()-.5)*90;pos[k+1]=38+Math.random()*7;pos[k+2]=(Math.random()-.5)*90;}}snowGeo.attributes.position.needsUpdate=true;snowMat.opacity=blizzard?.98:.9;}

    wind.visible=hurricaneWeather||storm||heavyRain;windMat.opacity=hurricaneWeather?.52:storm?.38:.25;
    if(wind.visible){const pos=windGeo.attributes.position.array as Float32Array;for(let i=0;i<windCount;i++){const k=i*3;pos[k]+=windVel[i]*dt*(hurricaneWeather?3.2:1);pos[k+2]+=windVel[i]*dt*(hurricaneWeather?.55:.12);if(pos[k]>48||pos[k+1]<1){pos[k]=-48-Math.random()*12;pos[k+1]=1+Math.random()*25;pos[k+2]=(Math.random()-.5)*90;}}windGeo.attributes.position.needsUpdate=true;}

    hurricane.visible=hurricaneWeather;
    if(hurricaneWeather){hurricane.position.set(camera.position.x+Math.sin(cloudTime*.08)*18,0,camera.position.z-18+Math.cos(cloudTime*.07)*12);hurricane.rotation.y+=dt*.35;hurricane.scale.setScalar(1+.08*Math.sin(cloudTime*2));}

    if(storm||hurricaneWeather){flashTimer-=dt;if(flashTimer<=0){triggerLightning();flashTimer=(hurricaneWeather?2.5:4)+Math.random()*(hurricaneWeather?5:8);}}else{flashTimer=2+Math.random()*5;lightningGroup.visible=false;boltLight.intensity=0;}
    if(flashTime>0){flashTime-=dt;boltLight.intensity=Math.max(0,18*(flashTime/.24));if(flashTime<=0){lightningGroup.visible=false;boltLight.intensity=0;}}
  };
  update();return update;
}
