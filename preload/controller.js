const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  onQueueUpdated: (callback) => {
    ipcRenderer.on('queue-updated', (event, queue) => {
      callback(queue)
    })
  }
})