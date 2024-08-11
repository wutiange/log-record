import { UpgradeCheckResult } from "@/utils/update";
import { defineStore } from "pinia";
import { ref } from "vue";



const useAppStore = defineStore("app", () => {
  const updateResult = ref<Partial<UpgradeCheckResult>>({});
  const checkUpdateErrMsg = ref('');

  const updateCheck = async () => {
    try {
      const resp = await window.electronAPI.checkIsUpdate()
      updateResult.value = resp;
    } catch (err) {
      updateResult.value = {}
      checkUpdateErrMsg.value = err.message;
      console.warn("更新的地方出现了错误", err)
    }
  }

  return {
    updateResult,
    checkUpdateErrMsg,
    updateCheck,
  }
});

export default useAppStore;
