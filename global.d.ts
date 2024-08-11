import { UpgradeCheckResult } from "@/utils/update";

declare global {
  interface Window {
    electronAPI: {
      platform: string;
      onGetLogMsg: (msgCallback: (msg: Record<string, any>) => void) => void
      onGetNetworkMsg: (msgCallback: (msg: Record<string, any>) => void) => void
      checkIsUpdate: () => Promise<UpgradeCheckResult>,
      toggleDevTools: () => Promise<void>,
      openUrl: (url: string) => void,
    };
  }
}
export { };
