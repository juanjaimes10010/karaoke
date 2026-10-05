const { contextBridge, ipcRenderer } = require('electron')
const path = require('path')
const fs = require('fs')

const filePath = path.join(__dirname, '..', 'playlists.json')

const data = fs.readFileSync(filePath, 'utf8')
const playlists = JSON.parse(data)


contextBridge.exposeInMainWorld('electronAPI', {
  playlists,
  onQueueUpdated: (callback) => {
    ipcRenderer.on('queue-updated', (event, url) => {
      callback(url)
    })
  },
  playSong: (callback) => { ipcRenderer.invoke('play-song')},
  pauseSong: (callback) => { ipcRenderer.invoke('pause-song')},
  nextSong: (callback) => { ipcRenderer.invoke('next-song')},
  previousSong: (callback) => { ipcRenderer.invoke('previous-song')},
  updatePlaylist: () => { 

  },


})