const KEY='animalVillageSettings';

type Settings={volume:number,music:boolean,sfx:boolean,quality:'low'|'medium'|'high',animations:boolean,compact:boolean,autoSave:boolean,autoSaveMinutes:number};
const defaults:Settings={volume:70,music:true,sfx:true,quality:'medium',animations:true,compact:false,autoSave:true,autoSaveMinutes:2};
const load=():Settings=>{try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return {...defaults}}};
const state=load();
const persist=()=>localStorage.setItem(KEY,JSON.stringify(state));
const set=(k:keyof Settings,v:any)=>{(state as any)[k]=v;persist();apply()};
const apply=()=>{
 document.body.dataset.quality=state.quality;
 document.body.classList.toggle('no-animations',!state.animations);
 document.body.classList.toggle('compact-ui',state.compact);
 const v=document.getElementById('volumeRange') as HTMLInputElement|null, vv=document.getElementById('volumeValue');if(v){v.value=String(state.volume);if(vv)vv.textContent=state.volume+'%'}
 const map:any={musicToggle:['music','Activée','Désactivée'],sfxToggle:['sfx','Activés','Désactivés'],animToggle:['animations','Activées','Désactivées'],compactToggle:['compact','Activée','Désactivée']};
 Object.entries(map).forEach(([id,[k,a,b]])=>{const e=document.getElementById(id);if(e)e.textContent=(state as any)[k]?a:b});
 const q=document.getElementById('qualitySelect') as HTMLSelectElement|null;if(q)q.value=state.quality;
};
export function installSettings(){
 const v=document.getElementById('volumeRange') as HTMLInputElement|null;v?.addEventListener('input',()=>set('volume',Number(v.value)));
 document.getElementById('musicToggle')?.addEventListener('click',()=>set('music',!state.music));
 document.getElementById('sfxToggle')?.addEventListener('click',()=>set('sfx',!state.sfx));
 document.getElementById('animToggle')?.addEventListener('click',()=>set('animations',!state.animations));
 document.getElementById('compactToggle')?.addEventListener('click',()=>set('compact',!state.compact));
 document.getElementById('qualitySelect')?.addEventListener('change',e=>set('quality',(e.target as HTMLSelectElement).value));
 apply();
}
export const getSettings=()=>({...state});
export const shouldAutoSave=()=>state.autoSave;
export const autoSaveMinutes=()=>state.autoSaveMinutes;
