/* UI polish: compact HUD inspired by a modern city-builder layout. Keeps all game mechanics unchanged. */
(() => {
  const style = document.createElement('style');
  style.id = 'animalVillageUiPolish';
  style.textContent = `
    /* --- HUD compact --- */
    #ui{inset:10px;pointer-events:none}
    #panel{position:static;width:100%;height:100%;min-width:0;padding:0;background:none;border:0;box-shadow:none;backdrop-filter:none;pointer-events:none}
    #panel>.title{position:absolute;left:6px;top:4px;width:185px;height:42px;align-items:center;padding:0 10px;font-size:18px;pointer-events:auto;background:linear-gradient(145deg,rgba(18,35,26,.96),rgba(0,0,0,.72));border:1px solid rgba(255,255,255,.12);border-radius:12px;box-shadow:0 8px 24px #0007}
    #panel>.titleBadge{display:none}
    #res{position:absolute;left:205px;right:355px;top:0;margin:0;display:grid;grid-template-columns:repeat(5,minmax(72px,1fr));gap:5px;pointer-events:auto}
    #res .res{min-height:42px;padding:4px 3px;background:linear-gradient(180deg,rgba(16,34,25,.94),rgba(7,20,14,.84));border:1px solid rgba(255,255,255,.1);border-radius:9px;box-shadow:0 7px 20px #0005;font-size:9px}
    #res .res b{font-size:14px;line-height:17px}
    #stats{position:absolute;right:10px;top:2px;width:335px;height:40px;margin:0;padding:5px 9px;display:flex;align-items:center;background:rgba(7,20,14,.9);border:1px solid rgba(255,255,255,.1);border-radius:10px;box-shadow:0 7px 20px #0005;pointer-events:auto;font-size:10px;white-space:nowrap;overflow:hidden}
    #researchPoints{position:absolute;left:6px;top:51px;margin:0;padding:5px 9px;background:rgba(7,20,14,.78);border:1px solid rgba(255,255,255,.08);border-radius:8px;pointer-events:auto;font-size:10px}
    #weather{position:absolute;left:6px;top:88px;padding:3px 9px;font-size:18px;background:rgba(7,20,14,.72);border-radius:8px;pointer-events:auto}
    #climate{display:none!important}
    #panel>button{position:absolute;left:6px;width:218px;height:38px;margin:0 0 6px;padding:7px 12px;text-align:left;font-size:14px;background:linear-gradient(180deg,rgba(26,48,38,.94),rgba(8,23,16,.94));border-color:rgba(255,255,255,.11);border-radius:10px;box-shadow:0 7px 18px #0006;pointer-events:auto}
    #marketBtn{top:132px}#armyBtn{top:176px}#techBtn{top:220px}#peopleBtn{top:264px}#weatherBtn{top:308px}#wikiBtn{top:352px}#settingsBtn{top:396px}
    #panel>button:hover{transform:translateX(2px);background:linear-gradient(180deg,rgba(46,69,53,.98),rgba(10,28,19,.98))}
    #wikiBtn{background:linear-gradient(180deg,rgba(116,91,35,.78),rgba(54,43,17,.9))!important;border-color:rgba(220,184,92,.42)!important}

    /* --- Building palette: bottom-right instead of blocking the centre --- */
    #tools{left:auto;right:10px;bottom:10px;transform:none;width:min(540px,46vw);max-width:540px;max-height:170px;overflow:auto;display:grid;grid-template-columns:repeat(4,minmax(100px,1fr));gap:5px;padding:9px;border-radius:14px;background:rgba(5,18,12,.9);border:1px solid rgba(255,255,255,.12);box-shadow:0 12px 34px #0009;pointer-events:auto}
    #tools button{width:100%;min-height:38px;margin:0;font-size:12px;padding:7px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

    /* --- Windows stay compact on the right --- */
    .window{top:62px;right:10px;width:min(390px,calc(100vw - 250px));max-height:72vh;padding:10px}
    #wikiWin,#settingsWin{left:auto;right:10px;transform:none;width:min(560px,calc(100vw - 250px));max-height:76vh}
    #adminWin{left:10px;right:auto;width:330px;max-height:72vh}

    @media(max-width:900px){
      #res{left:195px;right:10px;top:0}
      #stats{right:10px;top:50px;width:auto;max-width:calc(100vw - 215px)}
      #researchPoints{top:50px}
      #weather{top:88px}
      #tools{width:min(470px,55vw);grid-template-columns:repeat(3,minmax(95px,1fr))}
      .window{width:min(360px,calc(100vw - 245px))}
    }
    @media(max-width:650px){
      #ui{inset:6px}
      #panel>.title{width:155px;font-size:15px}
      #res{left:160px;right:0;grid-template-columns:repeat(5,minmax(48px,1fr));gap:2px}
      #res .res{min-height:38px;font-size:7px;padding:2px}
      #res .res b{font-size:12px}
      #stats{left:0;right:auto;top:50px;max-width:100%;font-size:9px}
      #researchPoints{left:0;top:84px}
      #weather{left:0;top:118px;font-size:15px}
      #panel>button{left:0;width:170px;height:34px;font-size:12px}
      #marketBtn{top:155px}#armyBtn{top:195px}#techBtn{top:235px}#peopleBtn{top:275px}#weatherBtn{top:315px}#wikiBtn{top:355px}#settingsBtn{top:395px}
      #tools{right:6px;bottom:6px;width:calc(100vw - 185px);max-height:155px;grid-template-columns:repeat(2,minmax(88px,1fr));padding:7px}
      #tools button{font-size:11px;min-height:34px}
      .window,#wikiWin,#settingsWin{left:180px;right:6px;width:auto;top:48px;max-height:70vh}
      #adminWin{left:6px;width:300px}
    }
  `;
  document.head.appendChild(style);
})();

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
  function drawClouds(s){ctx.fillStyle='rgba(45,55,65,.28)';for(let i=0;i<7;i++){const x=((i*210+performance.now()*.008*(i%2?1:-.5))%(innerWidth+320))-160,y=55+(i%3)*55;ctx.beginPath();ctx.ellipse(x,y,105*s,30*s,0,0,Math.PI*2);ctx.ellipse(x+55*s,y-12,65*s,35*s,0,0,Math.PI*2);ctx.fill();}}
  function drawSun(){const g=ctx.createRadialGradient(innerWidth-120,110,8,innerWidth-120,110,115);g.addColorStop(0,'rgba(255,235,130,.55)');g.addColorStop(1,'rgba(255,235,130,0)');ctx.fillStyle=g;ctx.fillRect(innerWidth-240,0,240,230);}
  function drawParticles(dt,kind){for(const p of particles){p.x+=p.vx*dt*60;p.y+=p.vy*dt*60;if(p.y>innerHeight+20){p.y=-20;p.x=Math.random()*innerWidth;}if(p.x<-30)p.x=innerWidth+20;if(kind==='rain'){ctx.strokeStyle='rgba(180,210,235,.62)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+p.vx*.45,p.y+p.size);ctx.stroke();}else{ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();}}}
  function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;ctx.clearRect(0,0,innerWidth,innerHeight);const label=weatherEl.textContent||'';setWeather(label);
    if(label.includes('Beau temps')){drawSun();overlay(.035,'#fff4c2');}
    else if(label.includes('Éclaircies')){drawSun();drawClouds(.75);overlay(.045,'#dce8e8');}
    else if(label.includes('Nuageux')){drawClouds(1.15);overlay(.14,'#65727a');}
    else if(label.includes('Pluie torrentielle')){drawClouds(1.35);drawParticles(dt,'rain');overlay(.17,'#44596a');}
    else if(label.includes('Pluie')){drawClouds(1.05);drawParticles(dt,'rain');overlay(.09,'#5c7180');}
    else if(label.includes('Orage')){drawClouds(1.4);drawParticles(dt,'rain');overlay(.24,'#263545');if(Math.random()<.004)lightning=.9;}
    else if(label.includes('Ouragan')){drawClouds(1.5);drawParticles(dt,'rain');overlay(.28,'#26313b');if(Math.random()<.006)lightning=.9;}
    else if(label.includes('Tempête de neige')){drawClouds(1.2);drawParticles(dt,'snow');overlay(.18,'#b9c7d1');}
    else if(label.includes('Neige')){drawClouds(.9);drawParticles(dt,'snow');overlay(.08,'#dbe5eb');}
    else if(label.includes('Canicule')){drawSun();overlay(.12,'#f2b45b');}
    if(lightning>0){overlay(lightning*.85,'#ffffff');lightning=Math.max(0,lightning-dt*5);}requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
}
