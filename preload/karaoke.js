const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('electronAPI', {
  nextSong: () => ipcRenderer.invoke('next-song'),
  onPlaySong: (callback) => { 
    ipcRenderer.on('play-song', () => {
        useCallback()
  })},
  onPauseSong: (callback) => { 
    ipcRenderer.on('pause-song', () => {
        useCallback()
  })},      
  onVolumeChange: (callback) => {
    ipcRenderer.on('volume-change', (event, volume) => {
        callback(volume)
  })}
})