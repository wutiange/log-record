import {
  app,
  BrowserWindow,
  Menu,
  MenuItem,
  ipcMain,
  shell,
  nativeTheme,
} from 'electron';
import path from 'path';
import serverClient from './server';
import { checkForUpgrade } from './utils/update';
import { name, author, version } from '../package.json';
import { getIPAddress } from './utils/node-strings';

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: nativeTheme.shouldUseDarkColors ? '#1a1a1a' : '#ffffff',
      symbolColor: nativeTheme.shouldUseDarkColors ? '#66cccc' : '#336666',
      height: 38,
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      spellcheck: false,
    },
    transparent: true,
    icon: path.join(__dirname, '/assets/logo.png'),
  });

  ipcMain.handle('toggleDevTools', () => mainWindow.webContents.openDevTools());
  ipcMain.handle('getIPAddress', () => getIPAddress());
  ipcMain.handle('checkIsUpdate', () =>
    checkForUpgrade(author.name, name, version),
  );

  ipcMain.on('openUrl', (_, url) => {
    shell.openExternal(url);
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
  serverClient.startListen({
    '/log': (msg) => {
      mainWindow.webContents.send('log:msg', msg);
    },
    '/network': (msg) => {
      mainWindow.webContents.send('network:msg', msg);
    },
  });

  const menu = new Menu();
  menu.append(
    new MenuItem({ role: 'toggleDevTools', accelerator: 'Alt+Shift+F12' }),
  );
  mainWindow.setMenu(menu);
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  serverClient.stopListen();
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
