// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { Service } from 'bonjour-service';
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  getIPAddress: () => ipcRenderer.invoke('getIPAddress'),
  onGetLogMsg: (callback: any) =>
    ipcRenderer.on('log:msg', (_event, value) => callback(value)),
  onGetNetworkMsg: (callback: any) =>
    ipcRenderer.on('network:msg', (_event, value) => callback(value)),
  onScanBonjour: (callback: any) =>
    ipcRenderer.on('service:msg', (_event, value) => callback(value)),
  openUrl: (url: string) => ipcRenderer.send('openUrl', url),
  checkIsUpdate: () => ipcRenderer.invoke('checkIsUpdate'),
  toggleDevTools: () => ipcRenderer.invoke('toggleDevTools'),
  connectBonjour: (service: string) => {
    ipcRenderer.send('connect-bonjour', service);
  },
  startScanBonjour: () => ipcRenderer.invoke('startScanBonjour'),
});
