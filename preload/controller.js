const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('electronAPI', {
  playlists: () => ipcRenderer.invoke('get-playlists'),
  playSong: (callback) => { ipcRenderer.invoke('play-song')},
  pauseSong: (callback) => { ipcRenderer.invoke('pause-song')},
  nextSong: (callback) => { ipcRenderer.invoke('next-song')},
  previousSong: (callback) => { ipcRenderer.invoke('previous-song')},
  updatePlaylists: (updatedPlaylists) => { ipcRenderer.invoke('updated-playlists', updatedPlaylists) },
})