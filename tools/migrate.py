from pathlib import Path
import re

p=Path('index.html')
s=p.read_text(encoding='utf-8')
m=re.search(r'<script type="module">(.*?)</script>', s, re.S)
if not m:
    print('index.html already migrated; nothing to do')
    raise SystemExit(0)
js=m.group(1)
js=js.replace("import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';", "import * as THREE from 'three';")
js=js.replace("let yaw=.62,pitch=-.38,locked=false,rotation=0,selected='house',soldiers=0,research=0,morale=100,buildId=0;", "let yaw=.62,pitch=-.38,locked=false,rotation=0,selected='house',soldiers=0,research=0,morale=100,buildId=0,freeBuild=false;")
js=js.replace('function freeWorkers(){return Math.max(0,population()-soldiers-usedWorkers())}', 'function freeWorkers(){return freeBuild?9999:Math.max(0,population()-soldiers-usedWorkers())}')
js=js.replace('function canPay(c){return Object.entries(c).every(([r,v])=>resources[r]>=v)}', 'function canPay(c){return freeBuild||Object.entries(c).every(([r,v])=>resources[r]>=v)}')
js=js.replace('function pay(c){Object.entries(c).forEach(([r,v])=>resources[r]-=v)}', 'function pay(c){if(freeBuild)return;Object.entries(c).forEach(([r,v])=>resources[r]-=v)}')
js=js.replace("const weatherEl=document.getElementById('weather');", "const weatherEl=document.getElementById('weather') as HTMLElement;")
js=js.replace('const techs=', 'const techs:any=')
js=js.replace('const types=', 'const types:any=')
js=js.replace('const resources=', 'const resources:any=')
js=js.replace('const capacity=', 'const capacity:any=')
js=js.replace('const prices=', 'const prices:any=')
js=js.replace('const buildings=[],occupied=', 'const buildings:any[]=[],occupied=')
js=js.replace('const buildings:any[]=[],occupied=new Map(),villagers=[],', 'const buildings:any[]=[],occupied=new Map(),villagers:any[]=[],')
js=js.replace('const seasons=', 'const seasons:any=')
js=js.replace('const weatherDefs=', 'const weatherDefs:any=')
js=js.replace('function storage(){const c={...capacity};', 'function storage(){const c:any={...capacity};')
js=js.replace('Object.entries(techs).forEach(([id,t])=>', 'Object.entries(techs as any).forEach(([id,t]:any)=>')
js=js.replace('Object.entries(types).forEach(([id,t])=>', 'Object.entries(types as any).forEach(([id,t]:any)=>')
js=js.replace('s.children[1].onclick=', '(s.children[1] as HTMLElement).onclick=')
js=js.replace('s.children[2].onclick=', '(s.children[2] as HTMLElement).onclick=')
js=js.replace('window.toastTimer', '(window as any).toastTimer')
js=js.replace('Math.floor(resources[r]));', 'String(Math.floor(resources[r])));')
js=js.replace('msg.style.opacity=1', "msg.style.opacity='1'")
js=js.replace('msg.style.opacity=0', "msg.style.opacity='0'")
prefix="""// @ts-nocheck
import { installAdmin } from './admin';

const stats=document.getElementById('stats') as HTMLElement;
const climateEl=document.getElementById('climate') as HTMLElement;
const msg=document.getElementById('msg') as HTMLElement;
const tools=document.getElementById('tools') as HTMLElement;
const marketRows=document.getElementById('marketRows') as HTMLElement;
const armyInfo=document.getElementById('armyInfo') as HTMLElement;
const techRows=document.getElementById('techRows') as HTMLElement;
const peopleRows=document.getElementById('peopleRows') as HTMLElement;
const weatherInfo=document.getElementById('weatherInfo') as HTMLElement;
const marketBtn=document.getElementById('marketBtn') as HTMLButtonElement;
const armyBtn=document.getElementById('armyBtn') as HTMLButtonElement;
const techBtn=document.getElementById('techBtn') as HTMLButtonElement;
const peopleBtn=document.getElementById('peopleBtn') as HTMLButtonElement;
const weatherBtn=document.getElementById('weatherBtn') as HTMLButtonElement;
const trainBtn=document.getElementById('train') as HTMLButtonElement;
const disband=document.getElementById('disband') as HTMLButtonElement;
"""
js=prefix+js
js=js.replace('climate.textContent=', 'climateEl.textContent=')
js=js.replace('train.onclick=train;', 'trainBtn.onclick=train;')
js=js.replace('let last=performance.now();', 'let fps=60,last=performance.now();')
js=js.replace('const dt=Math.min(.05,(now-last)/1000);last=now;', 'const dt=Math.min(.05,(now-last)/1000);last=now;fps=dt>0?1/dt:60;')
api="""
installAdmin({
  resources, capacity, buildings, villagers, occupied, techs, scene, storage, population, updateUI, refreshTools, renderTech, chooseWeather,
  get soldiers(){return soldiers}, set soldiers(v){soldiers=v},
  get research(){return research}, set research(v){research=v},
  get currentWeather(){return currentWeather},
  get freeBuild(){return freeBuild}, set freeBuild(v){freeBuild=v},
  fps:()=>fps
});
"""
js=js.replace('requestAnimationFrame(animate);onresize=', 'requestAnimationFrame(animate);'+api+'onresize=', 1)
Path('src').mkdir(exist_ok=True)
Path('src/main.ts').write_text(js,encoding='utf-8')
s=s.replace('</style>', '#adminWin{left:12px;right:auto;width:360px;max-height:80vh}#adminWin button{width:calc(50% - 8px)}\n</style>',1)
admin='''<div id="adminWin" class="window"><h3>🛠️ Admin / Debug</h3><div class="small">Touche / pour ouvrir ou fermer</div><div id="adminInfo" class="small" style="margin:8px 0"></div><button id="adminResources">💰 Ressources max</button><button id="adminSoldiers">⚔️ +100 soldats</button><button id="adminTech">🔬 Toutes les technologies</button><button id="adminFinish">🏗️ Finir constructions</button><button id="adminRepair">❤️ Réparer bâtiments</button><button id="adminWeather">🌦️ Changer météo</button><button id="adminFree">🏠 Construction gratuite</button><button id="adminClear" class="danger">🧹 Supprimer bâtiments</button></div>'''
s=s.replace('<div id="msg"></div>', admin+'<div id="msg"></div>',1)
s=re.sub(r'<script type="module">.*?</script>', '<script type="module" src="./src/main.ts"></script>', s, count=1, flags=re.S)
p.write_text(s,encoding='utf-8')

w=Path('.github/workflows/pages.yml')
ws=w.read_text(encoding='utf-8')
old="""      - name: Upload site
        uses: actions/upload-pages-artifact@v3
        with:
          path: .
"""
new="""      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Upload site
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
"""
if old in ws:
    w.write_text(ws.replace(old,new),encoding='utf-8')
