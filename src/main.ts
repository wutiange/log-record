import { app, BrowserWindow, globalShortcut, Menu } from "electron";
import path from "path";
import serverClient from './server'


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
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


  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
  serverClient.startListen({
    '/log': (msg) => {
      mainWindow.webContents.send('log:msg', msg)
    }
  })

  globalShortcut.register('F12', () => {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  })

  mainWindow.setMenu(null)
};

app.on("ready", createWindow);

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
