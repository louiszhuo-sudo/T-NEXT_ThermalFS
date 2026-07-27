const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('thermalSettings', {
  get: () => ipcRenderer.invoke('settings:get'),
  save: (settings) => ipcRenderer.invoke('settings:save', settings),
  cancel: () => ipcRenderer.invoke('settings:cancel'),
});
