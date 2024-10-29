import { UpgradeCheckResult } from '@/utils/update';
import { Service } from 'bonjour-service';

declare global {
  interface Window {
    electronAPI: {
      platform: string;
      getIPAddress: () => Promise<string>;
      onGetLogMsg: (msgCallback: (msg: Record<string, any>) => void) => void;
      onGetNetworkMsg: (
        msgCallback: (msg: Record<string, any>) => void,
      ) => void;
      onScanBonjour: (msgCallback: (service: Service) => void) => void;
      checkIsUpdate: () => Promise<UpgradeCheckResult>;
      toggleDevTools: () => Promise<void>;
      openUrl: (url: string) => void;
      connectBonjour: (service: string) => void;
      startScanBonjour: () => void;
    };
  }
}
export {};
