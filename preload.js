const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  searchName: (name) => ipcRenderer.send('search-name', name),
  onDisplayName: (callback) => ipcRenderer.on('display-name', (event, name) => callback(name)),
  ipcRenderer: {
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    on: (channel, listener) => ipcRenderer.on(channel, listener)
  }

});
