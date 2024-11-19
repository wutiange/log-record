// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  getIPAddress: () => ipcRenderer.invoke('getIPAddress'),
  onGetLogMsg: (callback: any) =>
    ipcRenderer.on('log:msg', (_event, value) => callback(value)),
  onGetNetworkMsg: (callback: any) =>
    ipcRenderer.on('network:msg', (_event, value) => callback(value)),
  onScanPhone: (callback: any) =>
    ipcRenderer.on('service:msg', (_event, model, clientIP) =>
      callback(model, clientIP),
    ),
  openUrl: (url: string) => ipcRenderer.send('openUrl', url),
  checkIsUpdate: () => ipcRenderer.invoke('checkIsUpdate'),
  toggleDevTools: () => ipcRenderer.invoke('toggleDevTools'),
  connectPhone: (clientIP: string, isAgree: boolean) => {
    ipcRenderer.send('connect-phone', clientIP, isAgree);
  },
  pausePhone: (clientIP: string, isPlay: boolean) => {
    ipcRenderer.send('pause-log', clientIP, isPlay);
  },
  startScanPhone: () => ipcRenderer.invoke('startScanPhone'),
});
