const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('electronAPI', {
  onAddedSong: (callback) => {
    ipcRenderer.on('added-song', (event, queue) => {
        callback(queue)
    }
  )},
  playlists: () => ipcRenderer.invoke('get-playlists'),
  playSong: (callback) => { ipcRenderer.invoke('play-song')},
  pauseSong: (callback) => { ipcRenderer.invoke('pause-song')},
  nextSong: (callback) => { ipcRenderer.invoke('next-song')},
  previousSong: (callback) => { ipcRenderer.invoke('previous-song')},
  updatePlaylists: (updatedPlaylists) => { ipcRenderer.invoke('updated-playlists', updatedPlaylists) },
})