const { app, BrowserWindow, Menu, ipcMain, WebContentsView } = require('electron')
const path = require('path')
const fs = require('fs')

let adminWindow
let controllerWindow
let searchWindow
let karaokeWindow
let controllerView
let searchView

const createAdminWindow = () => {
  adminWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload/admin.js'),
      contextIsolation: true,
      nodeIntegration: true
    }
  })

  adminWindow.loadFile('html/admin.html')

  controllerView = new WebContentsView({ webPreferences: { preload: path.join(__dirname, 'preload/controller.js') } })
  searchView = new WebContentsView({ webPreferences: { preload: path.join(__dirname, 'preload/search.js') } })



  adminWindow.contentView.addChildView(controllerView)
  adminWindow.contentView.addChildView(searchView)


  controllerView.webContents.loadFile('html/controller.html')
  searchView.webContents.loadURL('https://www.youtube.com/')

  controllerView.setBounds({ x: 0, y: 0, width: 392.5, height: 600 })
  searchView.setBounds({ x: 407.5, y: 0, width: 407.5, height: 600 })

  adminWindow.on('resize', () => {
    const [windowWidth, windowHeight] = adminWindow.getSize()
    const splitterX = controllerView.getBounds().width + 7.5

    controllerView.setBounds({ x: 0, y: 0, width: windowWidth / 2 - 7.5, height: windowHeight })
    searchView.setBounds({ x: windowWidth / 2 + 7.5, y: 0, width: windowWidth - windowWidth / 2 - 7.5, height: windowHeight })

  })

}

const createControllerWindow = () => {
  controllerWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload/controller.js'),
      contextIsolation: true,
      nodeIntegration: true
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
  if (controllerWindow) {
    controllerWindow.webContents.send('queue-updated', queue)
  }
})

ipcMain.on('set-view-bounds', (event, newPos) => {
  if (adminWindow) {
    const [windowWidth, windowHeight] = adminWindow.getSize()


    controllerView.setBounds({ x: 0, y: 0, width: newPos - 7.5 , height: 600 })
    searchView.setBounds({ x: newPos + 7.5, y: 0, width: windowWidth - newPos - 7.5, height: 600 })
  }
})

app.whenReady().then(() => {
  // Menu.setApplicationMenu(null);
  createAdminWindow()

  // createControllerWindow()
  // createKaraokeWindow()
  // createSearchWindow()
})