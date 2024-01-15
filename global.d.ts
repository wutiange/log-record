declare global {
  interface Window {
    electronAPI: {
      platform: string;
      onGetLogMsg: (msgCallback: (msg: Record<string, any>) => void) => void
      onGetNetworkMsg: (msgCallback: (msg: Record<string, any>) => void) => void
    };
  }
}
export { };
