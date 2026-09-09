import { installAdmin } from './admin';

let started=false;
let lastError='';
const ensureSaveButton=()=>{
  if(document.getElementById('saveBtn'))return;
  const panel=document.getElementById('panel');
  if(!panel)return;
  const button=document.createElement('button');
  button.id='saveBtn';button.textContent='💾 Sauvegardes';
  button.addEventListener('click',()=>{const win=document.getElementById('saveWin');if(win)win.classList.toggle('open');else window.setTimeout(()=>document.getElementById('saveWin')?.classList.add('open'),100)});
  panel.appendChild(button);
};
const openAdmin=()=>{
  const win=document.getElementById('adminWin');
  if(!win)return;
  win.classList.add('open');
  (document.getElementById('adminInput') as HTMLInputElement|null)?.focus();
};
const boot=()=>{
  ensureSaveButton();
  const api=(window as any).animalVillageAPI;
  if(!api||started)return;
  try{
    installAdmin(api);
    started=true;
    (window as any).openAnimalVillageAdmin=openAdmin;
  }catch(error){
    lastError=String(error);
    console.error('[AnimalVillage] Admin boot failed:',error);
  }
};
window.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if((e.key||'').toLowerCase()==='z'||e.code==='KeyZ'){
    const active=document.activeElement as HTMLElement|null;
    if(active&&['INPUT','TEXTAREA','SELECT'].includes(active.tagName))return;
    e.preventDefault();
    if(!started)boot();
    openAdmin();
  }
});
window.addEventListener('load',boot);
boot();
const timer=window.setInterval(()=>{boot();if(started)window.clearInterval(timer)},250);
