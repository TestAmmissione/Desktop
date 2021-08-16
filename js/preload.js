const { ipcRenderer } = require('electron'); 
global.warningsCount = 0;
global.closeHost = () => { 
    // Invia il messaggio al main.js che viene letto tramite webView.addEventListener('ipc-message', (event) ...
    ipcRenderer.sendToHost('close', global.warningsCount); 
    global.warningsCount++;
};
global.startLoginFB = () => {
    ipcRenderer.sendToHost('start-fb');

};

ipcRenderer.on('get-cookies', () => {
    // Invia il messaggio al main.js che viene letto tramite webView.addEventListener('ipc-message', (event) ...
    ipcRenderer.sendToHost('send-cookies', document.cookie);
});