const { app, BrowserWindow, Menu, ipcMain, WebContentsView, screen } = require('electron')
const path = require('path')
const fs = require('fs')

let adminWindow
let karaokeWindow
let controllerView
let searchView
let splitterBar
let notification
let playlists

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

  controllerView = new WebContentsView({ webPreferences: { preload: path.join(__dirname, 'preload/controller.js'), contextIsolation: true, nodeIntegration: true } })
  searchView = new WebContentsView({ webPreferences: { preload: path.join(__dirname, 'preload/search.js') } })
  splitterBar = new WebContentsView()  
  notification = new WebContentsView({ webPreferences: { preload: path.join(__dirname, 'preload/notification.js') } })

  adminWindow.contentView.addChildView(controllerView)
  adminWindow.contentView.addChildView(searchView)
  adminWindow.contentView.addChildView(splitterBar)
  adminWindow.contentView.addChildView(notification)

  controllerView.webContents.loadFile('html/controller.html')
  searchView.webContents.loadURL('https://www.youtube.com/')
  splitterBar.webContents.loadFile('html/splitter-bar.html')
  notification.webContents.loadFile('html/notification.html')

  const updateBounds = (X) => {
    const [WIDTH, HEIGHT] = adminWindow.getContentSize()
 
    const HALF_WIDTH = WIDTH / 2
    const SPLITTER_BAR_WIDTH = 10
    const NOTIFICATION_HEIGHT = 60
    const HALF_SPLITTER_BAR_WIDTH = SPLITTER_BAR_WIDTH / 2
    const SPLITTER_OFFSET = 175

    if(X) {
      if(X < SPLITTER_OFFSET) X = SPLITTER_OFFSET
      else if(X > WIDTH - SPLITTER_OFFSET) X = WIDTH - SPLITTER_OFFSET

      controllerView.setBounds({ x: 0, y: NOTIFICATION_HEIGHT, width: X - HALF_SPLITTER_BAR_WIDTH, height: HEIGHT - NOTIFICATION_HEIGHT })
      splitterBar.setBounds({ x: X - HALF_SPLITTER_BAR_WIDTH, y: NOTIFICATION_HEIGHT, width: SPLITTER_BAR_WIDTH, height: HEIGHT - NOTIFICATION_HEIGHT })
      searchView.setBounds({ x: X + HALF_SPLITTER_BAR_WIDTH, y: NOTIFICATION_HEIGHT, width: WIDTH - X - HALF_SPLITTER_BAR_WIDTH, height: HEIGHT - NOTIFICATION_HEIGHT })
      notification.setBounds({ x: 0, y: 0, width: WIDTH, height: NOTIFICATION_HEIGHT })
    } else {

      controllerView.setBounds({ x: 0, y: NOTIFICATION_HEIGHT, width: HALF_WIDTH - HALF_SPLITTER_BAR_WIDTH, height: HEIGHT - NOTIFICATION_HEIGHT })
      splitterBar.setBounds({ x: HALF_WIDTH - HALF_SPLITTER_BAR_WIDTH, y: NOTIFICATION_HEIGHT, width: SPLITTER_BAR_WIDTH, height: HEIGHT - NOTIFICATION_HEIGHT })
      searchView.setBounds({ x: HALF_WIDTH + HALF_SPLITTER_BAR_WIDTH, y: NOTIFICATION_HEIGHT, width: HALF_WIDTH - HALF_SPLITTER_BAR_WIDTH, height: HEIGHT - NOTIFICATION_HEIGHT })
      notification.setBounds({ x: 0, y: 0, width: WIDTH, height: NOTIFICATION_HEIGHT })
    }
  }


  updateBounds()

  let isDragging = false;

  splitterBar.webContents.on('before-mouse-event', (event, mouse) => {
    
    const [x, y] = adminWindow.getPosition();

    const relativeX = mouse.globalX - x
    
    if (mouse.type === 'mouseDown' && mouse.button === 'left') isDragging = true
    if (mouse.type === 'mouseUp' && mouse.button === 'left') isDragging = false
    if (mouse.type === 'mouseMove' && isDragging) updateBounds(relativeX)
    
  })

  adminWindow.on('resize', () => {
    updateBounds()
  })

}

const createKaraokeWindow = () => {

  const cssPath = path.join(__dirname, 'css/karaoke.css')

  const css = fs.readFileSync(cssPath, 'utf8')


  const displays = screen.getAllDisplays()

  const hasSecondaryDisplay = displays.length > 1

  const karaokeDisplay = hasSecondaryDisplay ? displays[1] : displays[0];

  const {x, y, width, height} = karaokeDisplay.bounds;

  
  karaokeWindow = new BrowserWindow({
    x: hasSecondaryDisplay ? x : 0,
    y: hasSecondaryDisplay ? y : 0,
    width: hasSecondaryDisplay ? width : 800,
    height: hasSecondaryDisplay ? height : 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload/karaoke.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })
  
  karaokeWindow.loadFile('html/karaoke.html')
  karaokeWindow.webContents.on('did-finish-load', () => {
    karaokeWindow.webContents.insertCSS(css)
  })

  if(hasSecondaryDisplay) karaokeWindow.setFullScreen(true)
}

const loadPlaylists = () => {
  try {
    const playlistsPath = path.join(__dirname, 'playlists.json')
    const data = fs.readFileSync(playlistsPath, 'utf8')

    playlists = JSON.parse(data)
  } catch (error) {
    if(notification)
      notification.webContents.send( 'notify',{status: 'error', message: 'Failed to get playlists: ' + error} )
    else alert('failed to get playlists:', error)
  }
}

const updatePlaylists = (updatedPlaylists) => {
  const playlistsPath = path.join(__dirname, 'playlists.json')

  try {
    fs.writeFileSync( playlistsPath, JSON.stringify(updatedPlaylists, null, 2), 'utf8')
    if(notification)
      notification.webContents.send('notify', { status: 'success', message: 'successfully updated'})
    else alert('successfully updated')
  } catch (error) {
    if(notification)
      notification.webContents.send( 'notify', { status: 'error', message: 'Failed to update: ' + error} )
    else alert('failed to update:', error)
  }
}

ipcMain.handle('get-playlist', () => playlists ? playlists: [])

ipcMain.on('updated-playlists', (event, updatedPlaylists) => {
  updatePlaylists(updatedPlaylists)
})

ipcMain.on('added-song', (event, url) => {
  if (controllerView) {
    controllerView.webContents.send('added-song', url)
    notification.webContents.send('notify', { status: 'success', message: 'added song to playlist'})
  }
})

ipcMain.on('play-song', (event) => {
  if(karaokeWindow) {
    karaokeWindow.webContents.send('play-song')
  }
})

ipcMain.on('pause-song', (event) => {
  if(karaokeWindow) {
    karaokeWindow.webContents.send('pause-song')
  }
})

ipcMain.on('next-song', (event) => {
  if(karaokeWindow) {
    karaokeWindow.webContents.send('next-song')
  }
})

ipcMain.on('previous-song', (event) => {
  if(karaokeWindow) {
    karaokeWindow.webContents.send('previous-song')
  }
})

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  loadPlaylists()
  createAdminWindow()
  // createKaraokeWindow()
})