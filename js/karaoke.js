const video = document.querySelector('video');

video.addEventListener('loadeddata', () => {
  video.play();
})

video.addEventListener('ended', () => {
  widow.electronAPI.nextSong()
})

window.electronAPI.onPlay( () => {
  video.play();
})

window.electronAPI.onPause( () => {
  video.pause();
})

window.electronAPI.onVolumeChange( (volume) => {
  video.volume = volume;
})

