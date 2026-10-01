const { contextBridge, ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded',
  document.addEventListener('click', async event => {
    const video = event.target.closest('ytd-rich-item-renderer, ytd-video-preview, yt-lockup-view-model, ytd-video-renderer, ytm-shorts-lockup-view-model-v2, ytd-playlist-panel-video-renderer')

    if(!video) return;
    const link = video.querySelector('a');
    const url = link.href;

    if(url.includes('&list=') && !url.includes('&start_radio') && !url.includes('&index=')) return;
    else if(url.includes('/watch')|| url.includes('/shorts')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      
      ipcRenderer.send('add-to-queue', url);
    }
  }, true)
)
