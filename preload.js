
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {

  onYouTubeVideoAddRequest: (callback) => {
    ipcRenderer.on("youtube-video-add-request", (event, video) => {
      callback(video);
    });
  },


  // ==========================================================
  // DIVIDER
  // ==========================================================

  setDividerPosition: (x) => {
    ipcRenderer.send("divider-position", x);
  },


  // ==========================================================
  // CONTROLLER → PLAYER
  // ==========================================================

  sendPlayerCommand: (data) => {
    ipcRenderer.send("controller-to-player", data);
  },


});

