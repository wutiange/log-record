import { defineStore } from "pinia";
import { ref, computed } from "vue";

export type LevelType = "log" | "warn" | "error";
export type LogType = {
  id: number;
  text: string;
  createTime: string;
  level: LevelType;
  formatData: any[];
  env: string;
  version?: string;
  brand?: string;
  model?: string;
  system?: string;
  uniqueId?: string;
};

const useLogStore = defineStore("log", () => {
  const loggers = ref<LogType[]>([]);
  const currentItem = ref<LogType | null>(null);
  const filterLoggers = ref<LogType[]>([]);
  const isOpenFilter = ref(false);
  const isScrollToBottom = ref(true);

  const push = (msg: Record<string, any>) => {
    const { message, ...msgObj } = (msg ?? {}) as any
    loggers.value.push({
      text: message.map((e: any) => {
        if (typeof e === 'string') {
          return e
        }
        return JSON.stringify(e)
      }).join(" "),
      formatData: message,
      ...msgObj
    });
  }
  const updateCurrentItem = (item: LogType) => {
    currentItem.value = { ...item };
  };

  const updateFilterLoggers = (loggers: LogType[]) => {
    filterLoggers.value = loggers;
  };

  const showLoggers = computed(() => {
    if (isOpenFilter.value) {
      return filterLoggers.value;
    } else {
      return loggers.value;
    }
  });

  const clearLoggers = () => {
    loggers.value = []
  }

  const updateIsOpenFilter = (isOpen: boolean) => {
    isOpenFilter.value = isOpen
  }

  const setIsScrollToBottom = (isScroll: boolean) => {
    isScrollToBottom.value = isScroll
  }

  return {
    loggers,
    push,
    currentItem,
    updateCurrentItem,
    updateFilterLoggers,
    showLoggers,
    isOpenFilter,
    updateIsOpenFilter,
    clearLoggers,
    isScrollToBottom,
    setIsScrollToBottom
  };
});

export default useLogStore;
