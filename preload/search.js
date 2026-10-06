const { ipcRenderer } = require('electron');

document.addEventListener('click', event => {
  const video = event.target.closest('ytd-rich-item-renderer, ytd-video-preview, yt-lockup-view-model, ytd-video-renderer, ytm-shorts-lockup-view-model-v2, ytd-playlist-panel-video-renderer')

  if(!video) return;
  const link = video.querySelector('a');
  if(!link) return;
  const url = link.href;
  if(!url) return;

  if(url.includes('&list=') && !url.includes('&start_radio') && !url.includes('&index=')) return;
  else if(url.includes('/watch')|| url.includes('/shorts')) {
    event.preventDefault();
    event.stopImmediatePropagation();
    
    ipcRenderer.invoke('added-song', url);
  }
}, true)


document.addEventListener('contextmenu', event => {
  event.preventDefault();
  event.stopPropagation();

  // 2. Create a simulated standard left-click event
  const simulatedClick = new MouseEvent('click', {
      bubbles: true,       // Let the event bubble up the DOM tree
      cancelable: true,    // Allow handlers to call preventDefault if needed
      view: window,
      button: 0,           // 0 represents a standard left-click
      buttons: 1           // 1 represents the left mouse button pressed
  });

  // 3. Dispatch it directly to the element that was right-clicked
  event.target.dispatchEvent(simulatedClick);

})