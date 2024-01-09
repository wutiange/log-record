import { handleSingleTextToSelected, searchTextToCommandsMap } from "@/utils/log";
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

export type SearchFilterType = {
  text: string;
  isCaseSensitive: boolean;
}

const useLogStore = defineStore("log", () => {
  const loggers = ref<LogType[]>([]);
  const currentItem = ref<LogType | null>(null);
  const filterLoggers = ref<LogType[]>([]);
  const isOpenFilter = ref(false);
  const isScrollToBottom = ref(true);
  const currentFilterResults = ref<Record<string, LogType[]>>({})
  const tabIds = ref<Set<string>>(new Set())
  const searchFilter = ref<Record<string, SearchFilterType>>({})
  const currentShowTabId = ref<string>('')


  const updateAllTabSinleLogger = (_logger: LogType) => {
    const newLogger = {..._logger}
    const oldCurrentFilterResults = currentFilterResults.value;
    const newCurrentFilterResults = {...oldCurrentFilterResults}
    const loggersTabIds = Object.entries(newCurrentFilterResults)
    let isUpdated = false
    loggersTabIds.forEach(([tabId, loggers]) => {
      const newLoggers = [...loggers]
      const {text = '', isCaseSensitive = false} = searchFilter.value[tabId] ?? {}
      if (!text) {
        newLoggers.push(newLogger)
        newCurrentFilterResults[tabId] = newLoggers
        isUpdated = true
        return
      }
      const commandObj = searchTextToCommandsMap(text);
      const {isDone, logger} = handleSingleTextToSelected(newLogger, commandObj, isCaseSensitive)
      if (isDone) {
        newLoggers.push(logger)
        newCurrentFilterResults[tabId] = newLoggers
        isUpdated = true
      }
    });
    if (isUpdated) {
      currentFilterResults.value = newCurrentFilterResults
    }
  }

  const push = (msg: Record<string, any>) => {
    const { message, ...msgObj } = (msg ?? {}) as any
    const newLogger = {
      text: message.map((e: any) => {
        if (typeof e === 'string') {
          return e
        }
        return JSON.stringify(e)
      }).join(" "),
      formatData: message,
      ...msgObj
    }
    loggers.value.push(newLogger);
    updateAllTabSinleLogger(newLogger)
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
    if (currentFilterResults.value[currentShowTabId.value]) {
      currentFilterResults.value[currentShowTabId.value] = []
    }
  }

  const updateIsOpenFilter = (isOpen: boolean) => {
    isOpenFilter.value = isOpen
  }

  const setIsScrollToBottom = (isScroll: boolean) => {
    isScrollToBottom.value = isScroll
  }

  const swapCurrentShowTabId = (tabId: string) => {
    currentShowTabId.value = tabId
  }


  const updateSearchFilterByTabId = (tabId: string, newSearchFilter: SearchFilterType) => {
    const {text = '', isCaseSensitive = false} = newSearchFilter ?? {}
    const commandObj = searchTextToCommandsMap(text);
  
    const newLoggers: LogType[] = [];
    for (let i = 0; i < loggers.value.length; i++) {
      const {isDone, logger} = handleSingleTextToSelected(loggers.value[i], commandObj, isCaseSensitive)
      if (isDone) {
        newLoggers.push(logger);
      }
    }
    const oldFilterResults = currentFilterResults.value
    const newFilterResults = {...oldFilterResults}
    newFilterResults[tabId] = newLoggers
    currentFilterResults.value = newFilterResults
    searchFilter.value[tabId] = newSearchFilter
  }

  const allocateID = () => {
    let newTabId = Date.now().toString(36)
    while(tabIds.value.has(newTabId)) {
      newTabId = Date.now().toString(36)
    }
    tabIds.value.add(newTabId)
    currentFilterResults.value[newTabId] = []
    return newTabId
  }

  const removeID = (tabId: string) => {
    if (tabIds.value.has(tabId)) {
      tabIds.value.delete(tabId)
    }
    if (currentFilterResults.value[tabId]) {
      delete currentFilterResults.value[tabId]
    }
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
    setIsScrollToBottom,
    currentFilterResults,
    updateSearchFilterByTabId,
    allocateID,
    removeID,
    swapCurrentShowTabId
  };
});

export default useLogStore;
