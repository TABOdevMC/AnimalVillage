import { installAdmin } from './admin';

let started = false;
const ensureSaveButton = () => {
  if (document.getElementById('saveBtn')) return;
  const panel = document.getElementById('panel');
  if (!panel) return;
  const button = document.createElement('button');
  button.id = 'saveBtn';
  button.textContent = '💾 Sauvegardes';
  button.addEventListener('click', () => {
    const win = document.getElementById('saveWin');
    if (win) win.classList.toggle('open');
    else window.setTimeout(() => document.getElementById('saveWin')?.classList.add('open'), 50);
  });
  panel.appendChild(button);
};

const boot = () => {
  ensureSaveButton();
  if (started) return;
  const api = (window as any).animalVillageAPI;
  if (!api) return;
  started = true;
  installAdmin(api);
};

boot();
const timer = window.setInterval(() => {
  boot();
  if (started) window.clearInterval(timer);
}, 100);
