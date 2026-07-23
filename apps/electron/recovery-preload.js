const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('recoveryAPI', {
  requestState: () => ipcRenderer.invoke('recovery:request-state'),
  togglePause: () => ipcRenderer.send('recovery:toggle-pause'),
  startNow: () => ipcRenderer.send('recovery:start-now'),
  quitApp: () => ipcRenderer.send('recovery:quit-app'),
  onState: (callback) => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on('recovery:state', listener);
    return () => ipcRenderer.removeListener('recovery:state', listener);
  },
});
