const weatherEl = document.getElementById('weather');
if (weatherEl) {
  const canvas = document.createElement('canvas');
  canvas.id = 'weatherCanvas';
  Object.assign(canvas.style, { position:'fixed', inset:'0', width:'100%', height:'100%', pointerEvents:'none', zIndex:'2' });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas météo indisponible');
  let particles=[], weather='', lightning=0, last=performance.now(), dpr=1;
  function resize(){ dpr=Math.min(devicePixelRatio||1,1.25); canvas.width=Math.floor(innerWidth*dpr); canvas.height=Math.floor(innerHeight*dpr); ctx.setTransform(dpr,0,0,dpr,0,0); }
  addEventListener('resize',resize); resize();
  function resetParticles(kind){ const count=kind==='snow'?150:kind==='rain'?190:0; particles=Array.from({length:count},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:kind==='snow'?(Math.random()-.5)*.8:-2-Math.random()*2,vy:kind==='snow'?1+Math.random()*2:14+Math.random()*13,size:kind==='snow'?1.5+Math.random()*3:8+Math.random()*12})); }
  function setWeather(next){ if(next===weather)return; weather=next; if(weather.includes('Neige')||weather.includes('Tempête de neige'))resetParticles('snow'); else if(weather.includes('Pluie')||weather.includes('Orage')||weather.includes('Ouragan'))resetParticles('rain'); else resetParticles('none'); }
  function overlay(a,c){ctx.fillStyle=c;ctx.globalAlpha=a;ctx.fillRect(0,0,innerWidth,innerHeight);ctx.globalAlpha=1;}
  function drawSun(){const g=ctx.createRadialGradient(innerWidth-120,110,8,innerWidth-120,110,115);g.addColorStop(0,'rgba(255,235,130,.55)');g.addColorStop(1,'rgba(255,235,130,0)');ctx.fillStyle=g;ctx.fillRect(innerWidth-240,0,240,230);}
  function drawParticles(dt,kind){for(const p of particles){p.x+=p.vx*dt*60;p.y+=p.vy*dt*60;if(p.y>innerHeight+20){p.y=-20;p.x=Math.random()*innerWidth;}if(p.x<-30)p.x=innerWidth+20;if(kind==='rain'){ctx.strokeStyle='rgba(180,210,235,.62)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+p.vx*.45,p.y+p.size);ctx.stroke();}else{ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();}}}
  function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;ctx.clearRect(0,0,innerWidth,innerHeight);const label=weatherEl.textContent||'';setWeather(label);
    if(label.includes('Beau temps')){drawSun();overlay(.035,'#fff4c2');}
    else if(label.includes('Éclaircies')){overlay(.045,'#dce8e8');}
    else if(label.includes('Nuageux')){overlay(.14,'#65727a');}
    else if(label.includes('Pluie torrentielle')){drawParticles(dt,'rain');overlay(.17,'#44596a');}
    else if(label.includes('Pluie')){drawParticles(dt,'rain');overlay(.09,'#5c7180');}
    else if(label.includes('Orage')){drawParticles(dt,'rain');overlay(.24,'#263545');if(Math.random()<.004)lightning=.9;}
    else if(label.includes('Ouragan')){drawParticles(dt,'rain');overlay(.28,'#26313b');if(Math.random()<.006)lightning=.9;}
    else if(label.includes('Tempête de neige')){drawParticles(dt,'snow');overlay(.18,'#b9c7d1');}
    else if(label.includes('Neige')){drawParticles(dt,'snow');overlay(.08,'#dbe5eb');}
    else if(label.includes('Canicule')){overlay(.12,'#f2b45b');}
    if(lightning>0){overlay(lightning*.85,'#ffffff');lightning=Math.max(0,lightning-dt*5);}requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
}
