import { UpdateStatus } from "@/config";

declare global {
  interface Window {
    electronAPI: {
      platform: string;
      onGetLogMsg: (msgCallback: (msg: Record<string, any>) => void) => void
      onGetNetworkMsg: (msgCallback: (msg: Record<string, any>) => void) => void
      onUpdateStatusListener: (callback: (status: UpdateStatus) => void) => void
      checkIsUpdate: () => Promise<void>,
      toggleDevTools: () => Promise<void>,
    };
  }
}
export { };
