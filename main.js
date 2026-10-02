const { app, BrowserWindow, Menu, ipcMain, WebContentsView } = require('electron')
const path = require('path')
const fs = require('fs')

let adminWindow
let controllerWindow
let searchWindow
let karaokeWindow
let controllerView
let searchView
let splitterBar

const createAdminWindow = () => {
  adminWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload/admin.js'),
      contextIsolation: true,
      nodeIntegration: true,
    },
    accentColor: 'red'
  })

  adminWindow.loadFile('html/admin.html')

  controllerView = new WebContentsView({ webPreferences: { preload: path.join(__dirname, 'preload/controller.js') } })
  searchView = new WebContentsView({ webPreferences: { preload: path.join(__dirname, 'preload/search.js') } })
  splitterBar = new WebContentsView({})  


  adminWindow.contentView.addChildView(controllerView)
  adminWindow.contentView.addChildView(searchView)
  adminWindow.contentView.addChildView(splitterBar)


  controllerView.webContents.loadFile('html/controller.html')
  searchView.webContents.loadURL('https://www.youtube.com/')
  splitterBar.webContents.loadFile('html/splitter-bar.html')


  const [width, height] = adminWindow.getContentSize();

  controllerView.setBounds({ x: 0, y: 0, width: 395, height })
  splitterBar.setBounds({ x: 395, y: 0, width: 10, height })
  searchView.setBounds({ x: 405, y: 0, width: 395, height })

  splitterBar.webContents.on('before-mouse-event', (event, mouse) => {
    const [x, y] = adminWindow.getPosition();
    const [width, height] = adminWindow.getContentSize();

    const relativeX = mouse.globalX - x;
    const relativeY = mouse.globalY - y;

    let newX = relativeX

    if(relativeX < 175) newX = 175
    else if(relativeX > width - 175) newX = width - 175

  if (mouse.type === 'mouseUp') {
      controllerView.setBounds({ x: 0, y: 0, width: newX - 5, height: height })
      splitterBar.setBounds({ x: newX - 5, y: 0, width: 10, height: height })
      searchView.setBounds({ x: newX + 5, y: 0, width: width - newX - 5, height: height })
    }
  });

  adminWindow.on('resize', () => {
    const [width, height] = adminWindow.getContentSize()

    controllerView.setBounds({ x: 0, y: 0, width: width/ 2 - 5, height: height })
    splitterBar.setBounds({ x: width/ 2 - 5, y: 0, width: 10, height: height })
    searchView.setBounds({ x: width/ 2 + 5, y: 0, width: width/ 2 - 5, height: height })
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


app.whenReady().then(() => {
  // Menu.setApplicationMenu(null);
  createAdminWindow()

  // createControllerWindow()
  // createKaraokeWindow()
  // createSearchWindow()
})