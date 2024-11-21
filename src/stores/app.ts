// eslint-disable-next-line import/no-unresolved
import { UpgradeCheckResult } from '@/utils/update';
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

type ConnectedPhone = {
  model?: string;
  clientIP: string;
  connectStatus: 'play' | 'pause' | 'Not Connected';
  isActive?: boolean;
};

const CONNECTED_PHONES_KEY = 'Log Record$$connectedPhones';
const useAppStore = defineStore('app', () => {
  const updateResult = ref<Partial<UpgradeCheckResult>>({});
  const checkUpdateErrMsg = ref('');
  const connectedPhones = ref<ConnectedPhone[]>([]);

  // 取出本地存储的已连接的设备
  const localConnectedPhones = localStorage.getItem(CONNECTED_PHONES_KEY);
  if (localConnectedPhones) {
    // 每次重新加载， connectStatus 状态为 Not Connected
    const connectedPhonesArr = JSON.parse(
      localConnectedPhones,
    ) as ConnectedPhone[];
    connectedPhonesArr.forEach((item) => {
      item.isActive = false;
    });
    connectedPhones.value = connectedPhonesArr;
  }

  const updateCheck = async () => {
    try {
      const resp = await window.electronAPI.checkIsUpdate();
      updateResult.value = resp;
    } catch (err) {
      updateResult.value = {};
      checkUpdateErrMsg.value = err.message;
      console.warn('更新的地方出现了错误', err);
    }
  };

  const updateConnectedPhones = ({
    model,
    clientIP,
    connectStatus,
  }: ConnectedPhone) => {
    const index = connectedPhones.value.findIndex(
      (item) => `${item.clientIP}` === clientIP,
    );

    if (index !== -1) {
      // 创建新数组以确保响应式更新
      connectedPhones.value = connectedPhones.value.map((item, i) => {
        if (i === index) {
          return { ...item, connectStatus, isActive: true };
        }
        return item;
      });
    } else {
      connectedPhones.value = [
        ...connectedPhones.value,
        { model, clientIP, connectStatus, isActive: true },
      ];
    }
  };

  const deleteConnectedPhones = (clientIP: string) => {
    connectedPhones.value = connectedPhones.value.filter(
      (item) => `${item.clientIP}` !== clientIP,
    );
  };

  watch(
    () => connectedPhones.value,
    (newValue) => {
      localStorage.setItem(CONNECTED_PHONES_KEY, JSON.stringify(newValue));
    },
  );

  return {
    updateResult,
    checkUpdateErrMsg,
    updateCheck,
    connectedPhones,
    updateConnectedPhones,
    deleteConnectedPhones,
  };
});

export default useAppStore;
