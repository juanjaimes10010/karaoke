const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')

let queue = []

let controllerWindow
let searchWindow
let karaokeWindow

const createControllerWindow = () => {
  controllerWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload/controller.js')
    }
  })

  controllerWindow.loadFile('html/controller.html')
}

const createSearchWindow = () => {
  searchWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload/search.js')
    }
  })

  searchWindow.loadURL('https://www.youtube.com/')
}

const createKaraokeWindow = () => {
  karaokeWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload/karaoke.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })
  
  karaokeWindow.loadFile('html/karaoke.html')
}

ipcMain.on('add-to-queue', (event, url) => {
  queue.push(url)

  console.log('Added to queue:', url)
  console.log('Current queue:', queue)

  if (controllerWindow) {
    controllerWindow.webContents.send('queue-updated', queue)
  }
})

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createControllerWindow()
  createKaraokeWindow()
  createSearchWindow()
})