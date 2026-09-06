export type AdminApi = any;

const HELP = [
  '/help — affiche toutes les commandes',
  '/give <bois|nourriture|pierre|metaux|monnaie> <quantite> — ajoute une ressource',
  '/max — met toutes les ressources à leur capacité',
  '/soldiers <quantite> — ajoute des soldats',
  '/tech all — débloque toutes les technologies',
  '/research <quantite> — ajoute des points de recherche',
  '/finish — termine toutes les constructions',
  '/repair — répare tous les bâtiments',
  '/weather <beau|eclaircies|nuageux|pluie|torrentielle|neige|tempete|orage|ouragan|canicule> — change la météo',
  '/freebuild <on|off> — active/désactive la construction gratuite',
  '/clear — supprime tous les bâtiments',
  '/stats — affiche les statistiques',
  '/clearconsole — efface la console',
  '/close — ferme la console'
];

export function installAdmin(api: AdminApi) {
  const win = document.getElementById('adminWin') as HTMLElement | null;
  const log = document.getElementById('adminLog') as HTMLElement | null;
  const input = document.getElementById('adminInput') as HTMLInputElement | null;
  const prompt = document.getElementById('adminPrompt') as HTMLElement | null;
  if (!win || !log || !input) return;

  const print = (text: string, cls = '') => {
    const line = document.createElement('div');
    line.className = `consoleLine ${cls}`;
    line.textContent = text;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  };

  const refresh = () => {
    if (prompt) prompt.textContent = `admin@animalvillage:~ ${api.currentWeather ? `[${api.currentWeather}]` : ''}`;
  };

  const resources: Record<string, string> = {
    bois: 'wood', wood: 'wood', nourriture: 'food', food: 'food',
    pierre: 'stone', stone: 'stone', metaux: 'metal', métal: 'metal', metal: 'metal',
    monnaie: 'gold', or: 'gold', gold: 'gold'
  };

  const weatherNames: Record<string, string> = {
    beau: '☀️ Beau temps', eclaircies: '🌤️ Éclaircies', nuageux: '☁️ Nuageux',
    pluie: '🌧️ Pluie', torrentielle: '🌧️ Pluie torrentielle', neige: '🌨️ Neige',
    tempete: '❄️ Tempête de neige', orage: '⛈️ Orage', ouragan: '🌀 Ouragan', canicule: '🔥 Canicule'
  };

  const update = () => { api.updateUI?.(); api.renderTech?.(); api.renderMarket?.(); api.renderArmy?.(); refresh(); };

  const execute = (raw: string) => {
    const command = raw.trim();
    if (!command) return;
    print(`> ${command}`, 'command');
    const parts = command.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts[1]?.toLowerCase();
    const amount = Number(parts[2] ?? parts[1]);

    switch (cmd) {
      case '/help': case 'help':
        HELP.forEach(x => print(x));
        break;
      case '/give': case 'give': {
        const key = resources[arg ?? ''];
        if (!key || !Number.isFinite(amount) || amount <= 0) { print('Usage: /give <ressource> <quantite>', 'error'); break; }
        api.resources[key] += amount;
        print(`✓ +${amount} ${key}`,'success');
        break;
      }
      case '/max': case 'max': {
        const cap = api.storage();
        Object.keys(api.resources).forEach((r: string) => api.resources[r] = cap[r]);
        print('✓ Ressources au maximum.','success');
        break;
      }
      case '/soldiers': case 'soldiers': {
        if (!Number.isFinite(amount)) { print('Usage: /soldiers <quantite>', 'error'); break; }
        api.soldiers += Math.max(0, Math.floor(amount));
        print(`✓ Soldats : ${api.soldiers}`,'success');
        break;
      }
      case '/tech': case 'tech':
        if (arg === 'all') { Object.values(api.techs).forEach((t: any) => t.done = true); api.research = Math.max(api.research, 9999); print('✓ Toutes les technologies débloquées.','success'); }
        else print('Usage: /tech all','error');
        break;
      case '/research': case 'research':
        if (!Number.isFinite(amount)) { print('Usage: /research <quantite>','error'); break; }
        api.research += amount; print(`✓ Recherche : ${api.research}`,'success'); break;
      case '/finish': case 'finish':
        api.buildings.forEach((b: any) => { b.progress = 1; b.workers = 0; b.visual.scale.setScalar(1); });
        print('✓ Toutes les constructions sont terminées.','success'); break;
      case '/repair': case 'repair':
        api.buildings.forEach((b: any) => { b.hp = b.maxHp; });
        print('✓ Tous les bâtiments sont réparés.','success'); break;
      case '/weather': case 'weather':
        if (!weatherNames[arg ?? '']) { print('Météos: beau, eclaircies, nuageux, pluie, torrentielle, neige, tempete, orage, ouragan, canicule','error'); break; }
        api.currentWeather = weatherNames[arg ?? ''];
        print(`✓ Météo : ${api.currentWeather}`,'success');
        break;
      case '/freebuild': case 'freebuild':
        if (arg !== 'on' && arg !== 'off') { print('Usage: /freebuild <on|off>','error'); break; }
        api.freeBuild = arg === 'on'; print(`✓ Construction gratuite : ${api.freeBuild ? 'ON' : 'OFF'}`,'success'); break;
      case '/clear': case 'clear':
        api.buildings.splice(0).forEach((b: any) => { api.scene.remove(b.visual); b.cells.forEach((c: number[]) => api.occupied.delete(c.join(','))); });
        print('✓ Tous les bâtiments ont été supprimés.','success'); break;
      case '/stats': case 'stats':
        print(`Population ${api.population()} · PNJ ${api.villagers.length} · Bâtiments ${api.buildings.length} · Soldats ${api.soldiers} · Recherche ${Math.floor(api.research)}`);
        break;
      case '/clearconsole': case 'clearconsole': log.innerHTML = ''; break;
      case '/close': case 'close': win.classList.remove('open'); break;
      default: print(`Commande inconnue : ${cmd}. Tape /help pour la liste.`, 'error');
    }
    update();
  };

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { execute(input.value); input.value = ''; }
    if (e.key === 'Escape') { win.classList.remove('open'); input.blur(); }
  });

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      win.classList.toggle('open');
      refresh();
      if (win.classList.contains('open')) { input.focus(); if (!log.children.length) print('AnimalVillage Admin Console v1.0'); print('Tape /help pour afficher les commandes.'); }
    }
  });

  refresh();
}
