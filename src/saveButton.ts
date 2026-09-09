function installVisibleSaveButton(){
  if(document.getElementById('saveBtn')) return;
  const panel=document.getElementById('panel');
  if(!panel) return;
  const button=document.createElement('button');
  button.id='saveBtn';
  button.textContent='💾 Sauvegardes';
  button.addEventListener('click',()=>document.getElementById('saveWin')?.classList.toggle('open'));
  panel.appendChild(button);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',installVisibleSaveButton);
else installVisibleSaveButton();
