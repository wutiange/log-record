// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import {contextBridge, ipcRenderer} from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  onGetLogMsg: (callback: any) => ipcRenderer.on('log:msg', (_event, value) => callback(value)),
  onGetNetworkMsg: (callback: any) => ipcRenderer.on('network:msg', (_event, value) => callback(value))
})