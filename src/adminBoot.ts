import { installAdmin } from './admin';

let started = false;
const boot = () => {
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
