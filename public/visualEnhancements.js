(() => {
  const canvas=document.createElement('canvas');
  canvas.id='ambientCanvas';
  Object.assign(canvas.style,{position:'fixed',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'1',mixBlendMode:'screen'});
  document.body.appendChild(canvas);
  const ctx=canvas.getContext('2d'); if(!ctx)return;
  let w=0,h=0,dpr=1,particles=[],last=performance.now();
  const resize=()=>{dpr=Math.min(devicePixelRatio||1,1.25);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);particles=Array.from({length:Math.min(70,Math.floor(w*h/18000))},()=>({x:Math.random()*w,y:Math.random()*h,r:.5+Math.random()*1.8,v:.08+Math.random()*.22,a:.15+Math.random()*.35}));};
  addEventListener('resize',resize);resize();
  function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;ctx.clearRect(0,0,w,h);
    const g=ctx.createRadialGradient(w*.52,h*.35,20,w*.52,h*.35,Math.max(w,h)*.75);g.addColorStop(0,'rgba(255,236,165,.035)');g.addColorStop(1,'rgba(0,0,0,.22)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    for(const p of particles){p.y-=p.v*60*dt;p.x+=Math.sin(now*.0005+p.y)*.08;if(p.y<0){p.y=h;p.x=Math.random()*w}ctx.globalAlpha=p.a;ctx.fillStyle='#e8dca4';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
    requestAnimationFrame(frame);
  }requestAnimationFrame(frame);
})();
