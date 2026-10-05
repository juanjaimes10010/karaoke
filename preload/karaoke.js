const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('electronAPI', {
  onPlaySong: (callback) => { 
    ipcRenderer.on('play-song', () => {
        useCallback()
  })},
  onPauseSong: (callback) => { 
    ipcRenderer.on('pause-song', () => {
        useCallback()
  })},
  onNextSong: (callback) => { 
    ipcRenderer.on('next-song', () => {
        useCallback()
  })},
  onPreviousSong: (callback) => { 
    ipcRenderer.on('previous-song', () => {
        useCallback()
  })},
  onUpdatePlaylist: () => { 
      
  },
})