import { handleSingleTextToSelected, searchTextToCommandsMap } from "@/utils/log";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

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
  const tabIds = ref<Record<string, {title: string}>>({})
  const tabOperaHistory = ref<string[]>([])
  const currentShowTabId = ref<string>('')
  const currentItem = ref<LogType | null>(null);
  const tabIsScrollToBottom = ref<Record<string, boolean>>({})
  const allTabLoggers = ref<Record<string, LogType[]>>({})
  const currentFilterResults = ref<Record<string, LogType[]>>({})
  const searchFilter = ref<Record<string, SearchFilterType>>({})

  const updateAllTabSinleLogger = (_logger: LogType) => {
    const oldCurrentFilterResults = currentFilterResults.value;
    const newCurrentFilterResults = {...oldCurrentFilterResults}
    const loggersTabIds = Object.entries(newCurrentFilterResults)
    let isUpdated = false
    loggersTabIds.forEach(([tabId, loggers]) => {
      const newLoggers = [...loggers]
      const {text = '', isCaseSensitive = false} = searchFilter.value[tabId] ?? {}
      if (!text) {
        newLoggers.push(_logger)
        newCurrentFilterResults[tabId] = newLoggers
        isUpdated = true
        return
      }
      const commandObj = searchTextToCommandsMap(text);
      const {isDone, logger} = handleSingleTextToSelected(_logger, commandObj, isCaseSensitive)
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
    for (const tabId in allTabLoggers.value) {
      if (Object.prototype.hasOwnProperty.call(allTabLoggers.value, tabId)) {
        const loggers = allTabLoggers.value[tabId];
        loggers.push({...newLogger})
      }
    }
    updateAllTabSinleLogger({...newLogger})
  }
  const updateCurrentItem = (item: LogType) => {
    currentItem.value = { ...item };
  };

  const clearLoggers = () => {
    if (currentFilterResults.value[currentShowTabId.value]) {
      currentFilterResults.value[currentShowTabId.value] = []
    } 
    if (allTabLoggers.value[currentShowTabId.value]) {
      allTabLoggers.value[currentShowTabId.value] = []
    } 
  }

  const setTabIsScrollToBottomByTabId = (isScroll: boolean) => {
    tabIsScrollToBottom.value[currentShowTabId.value] = isScroll
  }

  const swapCurrentShowTabId = (tabId: string) => {
    currentShowTabId.value = tabId
  }


  const updateSearchFilterByTabId = (tabId: string, newSearchFilter: SearchFilterType) => {
    const {text = '', isCaseSensitive = false} = newSearchFilter ?? {}
    const commandObj = searchTextToCommandsMap(text);
    const loggers = allTabLoggers.value[tabId] ?? []
    const newLoggers: LogType[] = [];
    for (let i = 0; i < loggers.length; i++) {
      const {isDone, logger} = handleSingleTextToSelected(loggers[i], commandObj, isCaseSensitive)
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

  const allocateID = (title: string) => {
    let newTabId = Date.now().toString(36)
    while(tabIds.value[newTabId]) {
      newTabId = Date.now().toString(36)
    }
    if (Object.keys(tabIds.value).length === 0) {
      currentShowTabId.value = newTabId
    }
    tabIds.value[newTabId] = {title}
    allTabLoggers.value[newTabId] = []
    currentFilterResults.value[newTabId] = []
    return newTabId
  }

  const removeID = (tabId: string) => {
    if (tabIds.value[tabId]) {
      delete tabIds.value[tabId]
    }
    if (currentFilterResults.value[tabId]) {
      delete currentFilterResults.value[tabId]
    }
    if (allTabLoggers.value[tabId]) {
      delete allTabLoggers.value[tabId]
    }
    if (tabId === currentShowTabId.value) {
      if (tabOperaHistory.value.length === 0) {
        currentShowTabId.value = allocateID("默认")
      } else {
        currentShowTabId.value = tabOperaHistory.value.pop()
      }
    }
  }

  const updateTabOperaHistory = (tabId: string) => {
    tabOperaHistory.value.push(tabId)
  }

  const isScrollToBottom = computed(() => {
    return !!tabIsScrollToBottom.value[currentShowTabId.value]
  })

  return {
    push,
    currentShowTabId,
    currentItem,
    updateCurrentItem,
    clearLoggers,
    isScrollToBottom,
    tabIsScrollToBottom,
    setTabIsScrollToBottomByTabId,
    currentFilterResults,
    updateSearchFilterByTabId,
    allocateID,
    removeID,
    swapCurrentShowTabId,
    updateTabOperaHistory
  };
});

export default useLogStore;
