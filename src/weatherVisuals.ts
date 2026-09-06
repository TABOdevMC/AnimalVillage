const weatherEl = document.getElementById('weather');

if (weatherEl) {
  const canvas = document.createElement('canvas');
  canvas.id = 'weatherCanvas';
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '2'
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas météo indisponible');

  type Particle = { x:number; y:number; vx:number; vy:number; size:number; life:number; maxLife:number };
  let particles: Particle[] = [];
  let weather = '';
  let lightning = 0;
  let last = performance.now();
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    canvas.width = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  addEventListener('resize', resize);
  resize();

  function resetParticles(kind: string) {
    const count = kind === 'snow' ? 150 : kind === 'rain' ? 190 : 0;
    particles = Array.from({length: count}, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: kind === 'snow' ? (Math.random() - .5) * .8 : -2 - Math.random() * 2,
      vy: kind === 'snow' ? 1 + Math.random() * 2 : 14 + Math.random() * 13,
      size: kind === 'snow' ? 1.5 + Math.random() * 3 : 8 + Math.random() * 12,
      life: Math.random() * 100,
      maxLife: 100
    }));
  }

  function setWeather(next: string) {
    if (next === weather) return;
    weather = next;
    if (weather.includes('Neige') || weather.includes('Tempête de neige')) resetParticles('snow');
    else if (weather.includes('Pluie') || weather.includes('Orage') || weather.includes('Ouragan')) resetParticles('rain');
    else resetParticles('none');
  }

  function overlay(alpha: number, color: string) {
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fillRect(0, 0, innerWidth, innerHeight);
    ctx.globalAlpha = 1;
  }

  function drawClouds(strength: number) {
    ctx.fillStyle = 'rgba(45,55,65,.28)';
    for (let i = 0; i < 7; i++) {
      const x = ((i * 210 + performance.now() * .008 * (i % 2 ? 1 : -.5)) % (innerWidth + 320)) - 160;
      const y = 55 + (i % 3) * 55;
      ctx.beginPath();
      ctx.ellipse(x, y, 105 * strength, 30 * strength, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 55 * strength, y - 12, 65 * strength, 35 * strength, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawSun() {
    const g = ctx.createRadialGradient(innerWidth - 120, 110, 8, innerWidth - 120, 110, 115);
    g.addColorStop(0, 'rgba(255,235,130,.55)');
    g.addColorStop(1, 'rgba(255,235,130,0)');
    ctx.fillStyle = g;
    ctx.fillRect(innerWidth - 240, 0, 240, 230);
  }

  function drawParticles(dt: number, kind: 'rain'|'snow') {
    for (const p of particles) {
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      if (p.y > innerHeight + 20) { p.y = -20; p.x = Math.random() * innerWidth; }
      if (p.x < -30) p.x = innerWidth + 20;

      if (kind === 'rain') {
        ctx.strokeStyle = 'rgba(180,210,235,.62)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx * .45, p.y + p.size);
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function frame(now: number) {
    const dt = Math.min(.05, (now - last) / 1000);
    last = now;
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    const label = weatherEl.textContent || '';
    setWeather(label);

    if (label.includes('Beau temps')) {
      drawSun();
      overlay(.035, '#fff4c2');
    } else if (label.includes('Éclaircies')) {
      drawSun();
      drawClouds(.75);
      overlay(.045, '#dce8e8');
    } else if (label.includes('Nuageux')) {
      drawClouds(1.15);
      overlay(.14, '#65727a');
    } else if (label.includes('Pluie torrentielle')) {
      drawClouds(1.35);
      drawParticles(dt, 'rain');
      overlay(.17, '#44596a');
    } else if (label.includes('Pluie')) {
      drawClouds(1.05);
      drawParticles(dt, 'rain');
      overlay(.09, '#5c7180');
    } else if (label.includes('Orage')) {
      drawClouds(1.4);
      drawParticles(dt, 'rain');
      overlay(.24, '#263545');
      if (Math.random() < .004) lightning = .9;
    } else if (label.includes('Ouragan')) {
      drawClouds(1.5);
      drawParticles(dt, 'rain');
      overlay(.28, '#26313b');
      if (Math.random() < .006) lightning = .9;
    } else if (label.includes('Tempête de neige')) {
      drawClouds(1.2);
      drawParticles(dt, 'snow');
      overlay(.18, '#b9c7d1');
    } else if (label.includes('Neige')) {
      drawClouds(.9);
      drawParticles(dt, 'snow');
      overlay(.08, '#dbe5eb');
    } else if (label.includes('Canicule')) {
      drawSun();
      overlay(.12, '#f2b45b');
    }

    if (lightning > 0) {
      overlay(lightning * .85, '#ffffff');
      lightning = Math.max(0, lightning - dt * 5);
    }

    requestAnimationFrame(frame);
  }

  setInterval(() => setWeather(weatherEl.textContent || ''), 250);
  requestAnimationFrame(frame);
}
