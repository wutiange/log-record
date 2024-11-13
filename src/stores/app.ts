import { UpgradeCheckResult } from '@/utils/update';
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

type ConnectedPhone = {
  model: string;
  id: string;
  isConnect: boolean;
};

const CONNECTED_PHONES_KEY = 'Log Record$$connectedPhones';
const useAppStore = defineStore('app', () => {
  const updateResult = ref<Partial<UpgradeCheckResult>>({});
  const checkUpdateErrMsg = ref('');
  const connectedPhones = ref<ConnectedPhone[]>([]);

  // 取出本地存储的已连接的设备
  const localConnectedPhones = localStorage.getItem(CONNECTED_PHONES_KEY);
  if (localConnectedPhones) {
    // 每次重新加载， isConnect 状态为 false
    const connectedPhonesArr = JSON.parse(
      localConnectedPhones,
    ) as ConnectedPhone[];
    connectedPhonesArr.forEach((item) => {
      item.isConnect = false;
    });
    connectedPhones.value = JSON.parse(localConnectedPhones);
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

  const updateConnectedPhones = (
    model: string,
    id: string,
    isConnect: boolean,
  ) => {
    const key = `${model}-${id}`;
    const index = connectedPhones.value.findIndex(
      (item) => `${item.model}-${item.id}` === key,
    );

    if (index !== -1) {
      // 创建新数组以确保响应式更新
      connectedPhones.value = connectedPhones.value.map((item, i) => {
        if (i === index) {
          return { ...item, isConnect };
        }
        return item;
      });
    } else {
      connectedPhones.value = [
        ...connectedPhones.value,
        { model, id, isConnect },
      ];
    }
  };

  const deleteConnectedPhones = (model: string, id: string) => {
    const key = `${model}-${id}`;
    connectedPhones.value = connectedPhones.value.filter(
      (item) => `${item.model}-${item.id}` !== key,
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
