// eslint-disable-next-line import/no-unresolved
import { UpgradeCheckResult } from '@/utils/update';

declare global {
  interface Window {
    electronAPI: {
      platform: string;
      getIPAddress: () => Promise<string>;
      onGetLogMsg: (msgCallback: (msg: Record<string, any>) => void) => void;
      onGetNetworkMsg: (
        msgCallback: (msg: Record<string, any>) => void,
      ) => void;
      onScanPhone: (
        msgCallback: (model: string, clientIP: string) => void,
      ) => void;
      checkIsUpdate: () => Promise<UpgradeCheckResult>;
      toggleDevTools: () => Promise<void>;
      openUrl: (url: string) => void;
      connectPhone: (clientIP: string, isAgree: boolean) => void;
      pausePhone: (clientIP: string, isPlay: boolean) => void;
      startScanPhone: () => void;
    };
  }
}
export {};
