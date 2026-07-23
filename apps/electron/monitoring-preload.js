const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('monitoringAPI', {
  requestState: () => ipcRenderer.invoke('monitoring:request-state'),
  saveConfig: (patch) => ipcRenderer.invoke('monitoring:save-config', patch),
  setPauseRecording: (paused) => ipcRenderer.invoke('monitoring:set-pause-recording', paused),
  setPauseUpload: (paused) => ipcRenderer.invoke('monitoring:set-pause-upload', paused),
  manualSend: () => ipcRenderer.invoke('monitoring:manual-send'),
  testConnection: (remoteUrl) => ipcRenderer.invoke('monitoring:test-connection', remoteUrl),
  refreshLibraries: (remoteUrl) => ipcRenderer.invoke('monitoring:refresh-libraries', remoteUrl),
  createLibrary: (name, remoteUrl) => ipcRenderer.invoke('monitoring:create-library', { name, remoteUrl }),
  onState: (callback) => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on('monitoring:state', listener);
    return () => ipcRenderer.removeListener('monitoring:state', listener);
  },
});
