const { contextBridge, ipcRenderer } = require('electron')
const path = require('path')
const fs = require('fs')

const filePath = path.join(__dirname, '..', 'playlists.json')

const data = fs.readFileSync(filePath, 'utf8')
const playlists = JSON.parse(data)


contextBridge.exposeInMainWorld('electronAPI', {
  playlists,
  onQueueUpdated: (callback) => {
    ipcRenderer.on('queue-updated', (event, queue) => {
      callback(queue)
    })
  }
})