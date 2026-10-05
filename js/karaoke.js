const video = document.querySelector('video');

window.electronAPI.onPlay( () => {
  video.play();
})


window.electronAPI.onPause( () => {
  video.pause();
})


