
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {

  // ==========================================================
  // GET URL FROM REAL YOUTUBE WEBSITE
  // ==========================================================

  getYouTubeURL: () => {
    return ipcRenderer.invoke("get-youtube-url");
  },

  getYouTubeTitle: () => {
    return ipcRenderer.invoke("get-youtube-title");
  },

  onYouTubeVideoAddRequest: (callback) => {
    ipcRenderer.on("youtube-video-add-request", (event, video) => {
      callback(video);
    });
  },

  validateVideo: (data) => {
    ipcRenderer.send("validate-video", data);
  },

  cancelVideoValidation: (requestId) => {
    ipcRenderer.send("cancel-video-validation", requestId);
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


  // ==========================================================
  // PLAYER RECEIVES COMMAND
  // ==========================================================

  onPlayerCommand: (callback) => {
    ipcRenderer.on("controller-to-player", (event, data) => {
      callback(data);
    });
  },


  // ==========================================================
  // PLAYER → CONTROLLER
  // ==========================================================

  sendPlayerEvent: (data) => {
    ipcRenderer.send("player-to-controller", data);
  },


  // ==========================================================
  // CONTROLLER RECEIVES PLAYER EVENT
  // ==========================================================

  onPlayerEvent: (callback) => {
    ipcRenderer.on("player-to-controller", (event, data) => {
      callback(data);
    });
  }

});

