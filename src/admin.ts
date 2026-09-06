export type AdminApi = any;

export function installAdmin(api: AdminApi) {
  const win = document.getElementById('adminWin') as HTMLElement | null;
  const info = document.getElementById('adminInfo') as HTMLElement | null;
  const techPoints = document.getElementById('researchPoints') as HTMLElement | null;
  const gainTech = document.getElementById('gainTech') as HTMLButtonElement | null;
  if (!win || !info) return;

  const refresh = () => {
    info.innerHTML = `FPS: <b>${Math.round(api.fps?.() ?? 0)}</b><br>PNJ: <b>${api.villagers.length}</b> · Population: <b>${api.population()}</b><br>Bâtiments: <b>${api.buildings.length}</b> · Soldats: <b>${api.soldiers}</b><br>Météo: <b>${api.currentWeather}</b><br>Construction gratuite: <b>${api.freeBuild ? 'ON' : 'OFF'}</b>`;
    if (techPoints) techPoints.textContent = `🔬 Points de technologie : ${Math.floor(api.research)}`;
  };
  const bind = (id: string, fn: () => void) => document.getElementById(id)?.addEventListener('click', () => { fn(); refresh(); api.updateUI(); });
  bind('adminResources', () => { const cap = api.storage(); Object.keys(api.resources).forEach((r: string) => api.resources[r] = cap[r]); });
  bind('adminSoldiers', () => { api.soldiers += 100; });
  bind('adminTech', () => { Object.values(api.techs).forEach((t: any) => t.done = true); api.research = 9999; api.refreshTools(); api.renderTech(); });
  bind('adminFinish', () => { api.buildings.forEach((b: any) => { b.progress = 1; b.workers = 0; b.visual.scale.setScalar(1); }); });
  bind('adminRepair', () => { api.buildings.forEach((b: any) => { b.hp = b.maxHp; }); });
  bind('adminWeather', () => api.chooseWeather());
  bind('adminClear', () => { api.buildings.splice(0).forEach((b: any) => { api.scene.remove(b.visual); b.cells.forEach((c: number[]) => api.occupied.delete(c.join(','))); }); });
  bind('adminFree', () => { api.freeBuild = !api.freeBuild; });

  gainTech?.addEventListener('click', () => {
    api.research += 10;
    api.renderTech();
    refresh();
    api.updateUI();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'z' && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      win.classList.toggle('open');
      refresh();
    }
  });
  setInterval(refresh, 500);
}
