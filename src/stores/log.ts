import { SearchFilterType } from '@/types/global';
import {
  handleSingleTextToSelected,
  searchTextToCommandsMap,
} from '@/utils/log';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export type LevelType = 'log' | 'warn' | 'error';
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

const LOGGERS_MAX_SIZE = 10000;

const useLogStore = defineStore('log', () => {
  const tabIds = ref<{ title: string; tabId: string }[]>([]);
  const tabOperaHistory = ref<string[]>([]);
  const currentShowTabId = ref<string>('');
  const currentItem = ref<LogType | null>(null);
  const tabIsScrollToBottom = ref<Record<string, boolean>>({});
  const allTabLoggers = ref<Record<string, LogType[]>>({});
  const currentFilterResults = ref<Record<string, LogType[]>>({});
  const searchFilter = ref<Record<string, SearchFilterType>>({});
  const keyValues = ref<Record<string, string[]>>({}); // 所有的key和对应的值，像 level version brand

  const updateAllTabSingleLogger = (_logger: LogType) => {
    const oldCurrentFilterResults = currentFilterResults.value;
    const newCurrentFilterResults = { ...oldCurrentFilterResults };
    const loggersTabIds = Object.entries(newCurrentFilterResults);
    let isUpdated = false;
    loggersTabIds.forEach(([tabId, loggers]) => {
      let newLoggers = [...loggers];
      if (newLoggers.length >= LOGGERS_MAX_SIZE) {
        newLoggers = newLoggers.slice(0, newLoggers.length - 1000);
      }
      const { text = '', isCaseSensitive = false } =
        searchFilter.value[tabId] ?? {};
      if (!text) {
        newLoggers.push(_logger);
        newCurrentFilterResults[tabId] = newLoggers;
        isUpdated = true;
        return;
      }
      const commandObj = searchTextToCommandsMap(text);
      const { isDone, logger } = handleSingleTextToSelected(
        _logger,
        commandObj,
        isCaseSensitive,
      );
      if (isDone) {
        newLoggers.push(logger);
        newCurrentFilterResults[tabId] = newLoggers;
        isUpdated = true;
      }
    });
    if (isUpdated) {
      currentFilterResults.value = newCurrentFilterResults;
    }
  };

  const handleKeyValues = async (msg: Record<string, any>): Promise<void> => {
    const fields = Object.entries(msg)
      .filter(
        (e) => typeof e[1] !== 'object' && !['id', 'createTime'].includes(e[0]),
      )
      .map((e) => e[0]);

    const updatePromises = fields.map((field) =>
      Promise.resolve().then(() => {
        if (msg[field] !== undefined) {
          const values = keyValues.value[field] ?? [];
          if (!values.includes(msg[field])) {
            values.push(msg[field]);
            keyValues.value[field] = values;
          }
        }
      }),
    );

    await Promise.all(updatePromises);
  };

  const push = (msg: Record<string, any>) => {
    const { message, ...msgObj } = (msg ?? {}) as any;
    const newLogger = {
      text: message
        .map((e: any) => {
          if (typeof e === 'string') {
            return e;
          }
          return JSON.stringify(e);
        })
        .join(' '),
      formatData: message,
      ...msgObj,
    };
    handleKeyValues(msg);
    // 新来的数据会装入所有的会话中
    for (const tabId in allTabLoggers.value) {
      if (Object.prototype.hasOwnProperty.call(allTabLoggers.value, tabId)) {
        const loggers = allTabLoggers.value[tabId];
        loggers.push({ ...newLogger });
      }
    }
    updateAllTabSingleLogger({ ...newLogger });
  };
  const updateCurrentItem = (item: LogType) => {
    currentItem.value = { ...item };
  };

  const clearLoggers = () => {
    if (currentFilterResults.value[currentShowTabId.value]) {
      currentFilterResults.value[currentShowTabId.value] = [];
    }
    if (allTabLoggers.value[currentShowTabId.value]) {
      allTabLoggers.value[currentShowTabId.value] = [];
    }
  };

  const setTabIsScrollToBottomByTabId = (isScroll: boolean) => {
    tabIsScrollToBottom.value[currentShowTabId.value] = isScroll;
  };

  const swapCurrentShowTabId = (tabId: string) => {
    currentShowTabId.value = tabId;
  };

  const updateSearchFilterByTabId = (
    tabId: string,
    newSearchFilter: SearchFilterType,
  ) => {
    const { text = '', isCaseSensitive = false } = newSearchFilter ?? {};
    const commandObj = searchTextToCommandsMap(text);
    const loggers = allTabLoggers.value[tabId] ?? [];
    const newLoggers: LogType[] = [];
    for (let i = 0; i < loggers.length; i++) {
      const { isDone, logger } = handleSingleTextToSelected(
        loggers[i],
        commandObj,
        isCaseSensitive,
      );
      if (isDone) {
        newLoggers.push(logger);
      }
    }
    const oldFilterResults = currentFilterResults.value;
    const newFilterResults = { ...oldFilterResults };
    newFilterResults[tabId] = newLoggers;
    currentFilterResults.value = newFilterResults;
    searchFilter.value[tabId] = newSearchFilter;
  };

  const isContainTabId = (tabId: string) => {
    for (let i = 0; i < tabIds.value.length; i++) {
      const tabIdObj = tabIds.value[i];
      if (tabIdObj.tabId === tabId) {
        return true;
      }
    }
    return false;
  };

  const allocateID = (title: string) => {
    let newTabId = Date.now().toString(36);
    while (isContainTabId(newTabId)) {
      newTabId = Date.now().toString(36);
    }
    if (Object.keys(tabIds.value).length === 0) {
      currentShowTabId.value = newTabId;
    }
    tabIds.value.push({ title, tabId: newTabId });
    allTabLoggers.value[newTabId] = [];
    currentFilterResults.value[newTabId] = [];
    return newTabId;
  };

  const removeID = (tabId: string) => {
    if (isContainTabId(tabId)) {
      tabIds.value = tabIds.value.filter((e) => e.tabId !== tabId);
    }
    if (currentFilterResults.value[tabId]) {
      delete currentFilterResults.value[tabId];
    }
    if (allTabLoggers.value[tabId]) {
      delete allTabLoggers.value[tabId];
    }
    if (tabOperaHistory.value.includes(tabId)) {
      tabOperaHistory.value = tabOperaHistory.value.filter((e) => e !== tabId);
    }
    if (tabId === currentShowTabId.value) {
      if (tabOperaHistory.value.length === 0) {
        currentShowTabId.value = allocateID('默认');
        updateTabOperaHistory(currentShowTabId.value);
      } else {
        currentShowTabId.value = tabOperaHistory.value.pop();
      }
    }
  };

  const updateTabOperaHistory = (tabId: string) => {
    tabOperaHistory.value.push(tabId);
  };

  const isScrollToBottom = computed(() => {
    return !!tabIsScrollToBottom.value[currentShowTabId.value];
  });

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
    updateTabOperaHistory,
    tabIds,
    keyValues,
  };
});

export default useLogStore;
