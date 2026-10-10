'use strict';
let installPrompt;
const installButton = document.getElementById('install-app');
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault(); installPrompt = event; installButton.hidden = false;
});
installButton.addEventListener('click', async () => {
  if (!installPrompt) return;
  const prompt = installPrompt; installPrompt = null; installButton.hidden = true;
  try { await prompt.prompt(); await prompt.userChoice; } catch (error) { console.warn('インストールを開始できませんでした', error); }
});
window.addEventListener('appinstalled', () => {installButton.hidden = true; installPrompt = null;});
function restoreView() {
  const id = location.hash.slice(1);
  showView(/^((problem|answer)[1-5]|home)-view$/.test(id) ? id : 'home-view');
}
window.addEventListener('hashchange', restoreView);
restoreView();
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {event.preventDefault(); card.click();}
  });
});
function showConnection() { document.getElementById('offline-note').hidden = navigator.onLine; }
window.addEventListener('online', showConnection);
window.addEventListener('offline', showConnection);
showConnection();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(error => console.warn('オフライン機能を有効にできませんでした', error));
  });
}

