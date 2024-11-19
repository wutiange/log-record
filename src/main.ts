import {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  nativeTheme,
  Menu,
} from 'electron';
import path from 'path';
import serverClient from './server';
import { checkForUpgrade } from './utils/update';
import { name, author, version } from '../package.json';
import { getIPAddress } from './utils/node-strings';

if (require('electron-squirrel-startup')) app.quit();

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    titleBarStyle: 'hidden',
    titleBarOverlay: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      spellcheck: false,
    },
    transparent: true,
    icon: path.join(__dirname, '/assets/logo.png'),
  });

  // 设置标题栏颜色
  function updateTitleBarOverlay() {
    if (process.platform !== 'win32') {
      return;
    }
    mainWindow.setTitleBarOverlay({
      color: nativeTheme.shouldUseDarkColors ? '#181818' : '#ffffff',
      symbolColor: nativeTheme.shouldUseDarkColors
        ? 'rgba(235, 235, 235, 0.64)'
        : '#2c3e50',
      height: 38,
    });
  }

  // 处理渲染进程发送的数据
  ipcMain.on('connect-phone', (_, clientIP, isAgree) => {
    serverClient.connect(clientIP, isAgree);
  });
  ipcMain.on('pause-log', (_, clientIP, isPlay) => {
    serverClient.stopCallbackLog(clientIP, isPlay);
  });

  // 初始设置
  updateTitleBarOverlay();

  // 监听主题变化
  nativeTheme.on('updated', updateTitleBarOverlay);

  ipcMain.handle('toggleDevTools', () => mainWindow.webContents.openDevTools());
  ipcMain.handle('getIPAddress', () => getIPAddress());
  ipcMain.handle('startScanPhone', () => {
    serverClient.scanPhone((model, clientIP) => {
      mainWindow.webContents.send('service:msg', model, clientIP);
    });
  });
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

  mainWindow.on('ready-to-show', () => {
    serverClient.startListen({
      '/log': (msg) => {
        mainWindow.webContents.send('log:msg', msg);
      },
      '/network': (msg) => {
        mainWindow.webContents.send('network:msg', msg);
      },
    });
  });

  Menu.setApplicationMenu(null);
};

app.whenReady().then(createWindow);

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  serverClient.unpublish();
  serverClient.stopListen();
  app.exit(0);
});
