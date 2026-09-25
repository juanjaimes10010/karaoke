
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
let validationWindow = null;
let validationRequestId = null;
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

    if (validationWindow && !validationWindow.isDestroyed()) {
      validationWindow.close();
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
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  playerWindow.loadURL(`${appOrigin}/youtube.html`);


  playerWindow.on("closed", () => {
    playerWindow = null;
  });
}


// ============================================================
// GET URL FROM REAL YOUTUBE VIEW
// ============================================================

ipcMain.handle("get-youtube-url", () => {
  if (!youtubeView) {
    return "";
  }

  if (youtubeView.webContents.isDestroyed()) {
    return "";
  }

  return youtubeView.webContents.getURL();
});

ipcMain.handle("get-youtube-title", () => {
  if (!youtubeView || youtubeView.webContents.isDestroyed()) {
    return "";
  }

  return youtubeView.webContents
    .getTitle()
    .replace(/\s+-\s+YouTube(?: Music)?$/, "")
    .trim();
});

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

function startVideoValidation(requestId, videoId) {
  if (validationWindow && !validationWindow.isDestroyed()) {
    const previousWindow = validationWindow;
    validationWindow = null;
    previousWindow.close();
  }

  validationRequestId = requestId;
  const windowInstance = new BrowserWindow({
    width: 520,
    height: 340,
    minWidth: 480,
    minHeight: 320,
    resizable: false,
    show: false,
    title: "Checking YouTube video",
    backgroundColor: "#000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false
    }
  });
  validationWindow = windowInstance;

  const query = new URLSearchParams({ requestId, videoId });
  windowInstance.loadURL(`${appOrigin}/validate.html?${query}`);

  windowInstance.on("closed", () => {
    if (validationWindow === windowInstance) {
      validationWindow = null;
      validationRequestId = null;

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("player-to-controller", {
          type: "validation-result",
          requestId,
          ok: false,
          errorCode: "checker-closed"
        });
      }
    }
  });
}

ipcMain.on("validate-video", (event, data) => {
  if (
    !mainWindow ||
    mainWindow.isDestroyed() ||
    event.sender !== mainWindow.webContents ||
    !data?.requestId ||
    !data?.videoId
  ) {
    return;
  }

  startVideoValidation(String(data.requestId), String(data.videoId));
});

ipcMain.on("cancel-video-validation", (event, requestId) => {
  if (
    !mainWindow ||
    event.sender !== mainWindow.webContents ||
    requestId !== validationRequestId
  ) {
    return;
  }

  if (validationWindow && !validationWindow.isDestroyed()) {
    validationWindow.close();
  }
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
  if (!playerWindow || playerWindow.isDestroyed()) {
    return;
  }

  playerWindow.webContents.send(
    "controller-to-player",
    data
  );
});


// ============================================================
// PLAYER → CONTROLLER
// ============================================================

ipcMain.on("player-to-controller", (event, data) => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  if (
    event.sender === validationWindow?.webContents &&
    data?.type === "validation-result" &&
    data.requestId === validationRequestId
  ) {
    const finishedWindow = validationWindow;
    validationWindow = null;
    validationRequestId = null;
    if (!finishedWindow.isDestroyed()) {
      finishedWindow.close();
    }
  }

  mainWindow.webContents.send(
    "player-to-controller",
    data
  );
});


// ============================================================
// APP START
// ============================================================

app.whenReady().then(async () => {
  // Serve the local player over HTTP so YouTube receives a valid Referer
  // when it loads the IFrame API (file:// pages do not provide one).
  appServer = http.createServer((request, response) => {
    const pathname = new URL(request.url, appOrigin).pathname;
    const files = {
      "/": "index.html",
      "/index.html": "index.html",
      "/controller.html": "controller.html",
      "/youtube.html": "youtube.html",
      "/validate.html": "validate.html"
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

