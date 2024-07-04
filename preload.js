const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  searchName: (name) => ipcRenderer.send('search-name', name),
  onDisplayName: (callback) => ipcRenderer.on('display-name', (event, name) => callback(name))
});
