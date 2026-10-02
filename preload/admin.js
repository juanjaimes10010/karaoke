const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  setViewBounds: (splitterX) => {
    ipcRenderer.send('set-view-bounds', splitterX)
  }
})