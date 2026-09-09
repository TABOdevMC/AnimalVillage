export type SaveState = Record<string, any>;

const KEY='animalVillageSave_v2';
const el=(id:string)=>document.getElementById(id) as HTMLElement|null;

function toast(text:string){
  const m=el('msg');
  if(!m)return;
  m.textContent=text;m.style.opacity='1';
  clearTimeout((window as any).__saveToast);
  (window as any).__saveToast=setTimeout(()=>m.style.opacity='0',1800);
}

function downloadJSON(data:SaveState){
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;
  a.download=`AnimalVillage-${new Date().toISOString().slice(0,10)}.json`;
  a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function openFile(onLoad:(data:SaveState)=>void){
  const input=document.createElement('input');input.type='file';input.accept='.json,application/json';
  input.onchange=async()=>{
    const file=input.files?.[0];if(!file)return;
    try{const data=JSON.parse(await file.text());onLoad(data);toast('✓ Sauvegarde chargée');}
    catch{toast('❌ Sauvegarde invalide');}
  };input.click();
}

export function installSaveSystem(){
  const api=()=>((window as any).animalVillageAPI||null);
  const snapshot=():SaveState|null=>api()?.save?.()||null;
  const restore=(data:SaveState)=>api()?.load?.(data);

  const panel=document.createElement('div');
  panel.id='saveWin';panel.className='window';
  panel.innerHTML='<h3>💾 Sauvegardes</h3><div class="settingCard"><p class="small">Sauvegarde automatique dans ce navigateur, ou export/import en fichier JSON.</p><button id="saveBrowser">💾 Sauvegarder (navigateur)</button><button id="saveExport">⬇️ Export sauvegarde</button><button id="saveImport">⬆️ Charger sauvegarde</button><div id="saveStatus" class="small" style="margin-top:8px"></div></div>';
  document.body.appendChild(panel);
  const status=()=>{const s=el('saveStatus');if(s)s.textContent=localStorage.getItem(KEY)?'✓ Une sauvegarde navigateur existe':'Aucune sauvegarde navigateur';};
  document.getElementById('saveBrowser')!.onclick=()=>{const data=snapshot();if(!data)return toast('❌ État du jeu indisponible');localStorage.setItem(KEY,JSON.stringify(data));status();toast('✓ Partie sauvegardée dans le navigateur');};
  document.getElementById('saveExport')!.onclick=()=>{const data=snapshot();if(data)downloadJSON(data);else toast('❌ État du jeu indisponible');};
  document.getElementById('saveImport')!.onclick=()=>openFile(data=>restore(data));
  status();

  const button=document.createElement('button');button.id='saveBtn';button.textContent='💾 Sauvegardes';
  const panelRoot=el('panel');panelRoot?.appendChild(button);
  button.onclick=()=>panel.classList.toggle('open');

  window.addEventListener('beforeunload',()=>{const data=snapshot();if(data)localStorage.setItem(KEY,JSON.stringify(data));});
  (window as any).loadBrowserSave=()=>{const raw=localStorage.getItem(KEY);if(!raw)return false;try{restore(JSON.parse(raw));return true}catch{return false}};
  (window as any).saveBrowser=()=>{const data=snapshot();if(!data)return false;localStorage.setItem(KEY,JSON.stringify(data));return true};
}
