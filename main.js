
const {
  app,
  BrowserWindow,
  WebContentsView,
  Menu,
  ipcMain
} = require("electron");

const path = require("path");
const http = require("http");
const fs = require("fs");

let mainWindow = null;
let playerWindow = null;
let youtubeView = null;
let playerVolume = 1;
let appServer = null;
let appOrigin = null;


Menu.setApplicationMenu(null)
// ============================================================
// MAIN WINDOW
// ============================================================

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 800,

    minWidth: 400,
    minHeight: 400,

    backgroundColor: "#000000",

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadURL(`${appOrigin}/index.html`);

  youtubeView = new WebContentsView({
    webPreferences: {
      preload: path.join(__dirname, "youtube-preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.contentView.addChildView(youtubeView);

  // Real YouTube website
  youtubeView.webContents.loadURL("https://www.youtube.com");
  youtubeView.webContents.setAudioMuted(true)
  updateYouTubeBounds();

  mainWindow.on("resize", updateYouTubeBounds);

  mainWindow.on("closed", () => {
    mainWindow = null;

    if (playerWindow && !playerWindow.isDestroyed()) {
      playerWindow.close();
    }

  });
}


// ============================================================
// REAL YOUTUBE VIEW POSITION
// ============================================================

function updateYouTubeBounds() {
  if (!mainWindow || !youtubeView) {
    return;
  }

  const bounds = mainWindow.getContentBounds();

  const controllerWidth = Math.floor(bounds.width * 0.4);
  const dividerWidth = 8;

  youtubeView.setBounds({
    x: controllerWidth + dividerWidth,
    y: 0,
    width: bounds.width - controllerWidth - dividerWidth,
    height: bounds.height
  });
}


// ============================================================
// SEPARATE YOUTUBE PLAYER WINDOW
// ============================================================

function createPlayerWindow() {
  playerWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 600,
    minHeight: 400,

    backgroundColor: "#000000",

    title: "YouTube Player",
    webPreferences: {
      preload: path.join(__dirname, "player-preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  playerWindow.webContents.on("did-finish-load", () => {
    if (!/youtube\.com\/watch/.test(playerWindow?.webContents.getURL() || "")) return;
    let attempts = 0;
    const volumeTimer = setInterval(async () => {
      if (!playerWindow || playerWindow.isDestroyed() || attempts++ >= 80) {
        clearInterval(volumeTimer);
        return;
      }
      try {
        const applied = await playerWindow.webContents.executeJavaScript(`(() => {
          const video = document.querySelector("video");
          if (!video) return false;
          video.volume = ${playerVolume};
          return true;
        })()`);
        if (applied) clearInterval(volumeTimer);
      } catch {
        clearInterval(volumeTimer);
      }
    }, 250);
  });

  playerWindow.loadURL("https://www.youtube.com");


  playerWindow.on("closed", () => {
    playerWindow = null;
  });
}

ipcMain.on("youtube-video-add-request", (event, video) => {
  if (
    !youtubeView ||
    youtubeView.webContents.isDestroyed() ||
    event.sender !== youtubeView.webContents ||
    !mainWindow ||
    mainWindow.isDestroyed()
  ) {
    return;
  }

  mainWindow.webContents.send("youtube-video-add-request", video);
});

// ============================================================
// DRAG DIVIDER
// ============================================================

ipcMain.on("divider-position", (event, x) => {
  if (!mainWindow || !youtubeView) {
    return;
  }

  const bounds = mainWindow.getContentBounds();

  const dividerWidth = 8;

  x = Math.max(250, Math.min(x, bounds.width - 250));

  youtubeView.setBounds({
    x: x + dividerWidth,
    y: 0,
    width: bounds.width - x - dividerWidth,
    height: bounds.height
  });
});


// ============================================================
// CONTROLLER → PLAYER
// ============================================================

ipcMain.on("controller-to-player", (event, data) => {
  if (
    event.sender !== mainWindow?.webContents ||
    !playerWindow ||
    playerWindow.isDestroyed()
  ) {
    return;
  }

  if (data?.type === "load" && data.videoId) {
    playerWindow.setFullScreen(true);
    playerWindow.loadURL(`https://www.youtube.com/watch?v=${encodeURIComponent(data.videoId)}`);
  } else if (data?.type === "clear") {
    playerWindow.setFullScreen(false);
    playerWindow.loadURL("https://www.youtube.com");
  } else if (data?.type === "play") {
    playerWindow.webContents.executeJavaScript(`
      (() => {
        const video = document.querySelector("video");
        if (video) video.play().catch(() => {});
      })();
    `, true).catch(() => {});
  } else if (data?.type === "pause") {
    playerWindow.webContents.executeJavaScript(`
      (() => document.querySelector("video")?.pause())();
    `, true).catch(() => {});
  } else if (data?.type === "volume") {
    const value = Number(data.volume);
    if (!Number.isFinite(value)) return;
    playerVolume = Math.max(0, Math.min(1, value));
    playerWindow.webContents.executeJavaScript(`(() => {
      const video = document.querySelector("video");
      if (video) video.volume = ${playerVolume};
    })()`).catch(() => {});
  }
});


// ============================================================
// APP START
// ============================================================

app.whenReady().then(async () => {
  // Serve the local controller pages over HTTP.
  appServer = http.createServer((request, response) => {
    const pathname = new URL(request.url, appOrigin).pathname;
    const files = {
      "/": "index.html",
      "/index.html": "index.html",
      "/controller.html": "controller.html",
    };
    const filename = files[pathname];

    if (!filename) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    fs.readFile(path.join(__dirname, filename), (error, content) => {
      if (error) {
        response.writeHead(500);
        response.end("Unable to load app page");
        return;
      }

      response.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      });
      response.end(content);
    });
  });

  await new Promise((resolve, reject) => {
    appServer.once("error", reject);
    appServer.listen(0, "127.0.0.1", () => {
      appServer.removeListener("error", reject);
      appOrigin = `http://127.0.0.1:${appServer.address().port}`;
      resolve();
    });
  });

  createMainWindow();
  createPlayerWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
      createPlayerWindow();
    }
  });
});


// ============================================================
// APP CLOSE
// ============================================================

app.on("window-all-closed", () => {
  if (appServer) {
    appServer.close();
    appServer = null;
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

