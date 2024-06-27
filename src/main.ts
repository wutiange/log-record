import { app, BrowserWindow, autoUpdater, dialog, Menu, MenuItem, ipcMain } from "electron";
import path from "path";
import serverClient from './server'
import { UpdateStatus } from "./config";



// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

function updateHandle(isDebug = false) {
  if (process.platform === 'darwin' || isDebug) return
  const server = 'https://update.electronjs.org'
  const feed = `${server}/wutiange/log-record/${process.platform}-${process.arch}/${app.getVersion()}`

  autoUpdater.setFeedURL({ url: feed })
  autoUpdater.checkForUpdates()
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#fff',
      symbolColor: '#336666',
      height: 38
    },
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    transparent: true,
    icon: path.join(__dirname, '/assets/logo.png')
  });

  autoUpdater.addListener("checking-for-update", () => {
    mainWindow.webContents.send('update:status', UpdateStatus.CheckingForUpdate)
  })

  autoUpdater.addListener("update-available", () => {
    mainWindow.webContents.send('update:status', UpdateStatus.UpdateAvailable)
  })

  autoUpdater.addListener("update-downloaded", () => {
    mainWindow.webContents.send('update:status', UpdateStatus.UpdateDownloaded)
  })

  autoUpdater.addListener("update-not-available", () => {
    mainWindow.webContents.send('update:status', UpdateStatus.UpdateNotAvailable)
  })

  
  ipcMain.handle('checkIsUpdate', () => {
    updateHandle(!!MAIN_WINDOW_VITE_DEV_SERVER_URL)
  })
  ipcMain.handle('toggleDevTools', () => mainWindow.webContents.openDevTools())

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    updateHandle()
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
  serverClient.startListen({
    '/log': (msg) => {
      mainWindow.webContents.send('log:msg', msg)
    },
    '/network': (msg) => {
      mainWindow.webContents.send('network:msg', msg)
    }
  })

  const menu = new Menu()
  menu.append(new MenuItem({role: 'toggleDevTools', accelerator: 'Alt+Shift+F12'}))
  mainWindow.setMenu(menu)
};

app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
  serverClient.stopListen()
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
