<script setup lang="ts">
import { convertAndSortRecord, findAllSubstringIndices } from '../../../utils/strings';
import useLogStore, { type LogType } from '../../../stores/log';
import { reactive, ref, watch } from 'vue';

const searchContent = ref('');
const logStore = useLogStore();
const filters = reactive({ isCaseSensitive: false });

const getSelectText = (text: string) => {
  return `<span style="background-color: #cccc99; color: #666666;">${text}</span>`;
};

const handleCommandsMap = () => {
  const searchArr = searchContent.value.split(' ');
  const commandObj = new Map();
  for (let i = 0; i < searchArr.length; i++) {
    const e = searchArr[i];
    if (e.includes(':') && !e.includes('\\:')) {
      // 说明是指令
      const commandArr = e.split(':');
      const command = commandArr[0];
      if (commandArr[1]?.length) {
        const value = commandObj.get(command) ?? [];
        value.push(commandArr[1]);
        commandObj.set(command, value);
      }
    } else {
      // 说明是普通文本，普通文本要将 文本 按照 text:文本 来处理
      const value = commandObj.get('text') ?? [];
      value.push(e);
      commandObj.set('text', value);
    }
  }
  return commandObj;
};


const replaceSubstring = (
  str: string,
  index: number,
  length: number,
  replacement: string
) => {
  // 使用slice获取起始部分和结束部分，然后将它们与替换字符串拼接
  return str.slice(0, index) + replacement + str.slice(index + length);
};

const handleTextCommand = (
  commandObj: Map<string, string[]>,
  logger: LogType
) => {
  if (commandObj.has('text')) {
    // 先把数组按字符串的长度排序，目的是照顾长的，这样在下面短的自动会被替换掉
    // 也就是如果出现 a ab 这两个，优先显示照顾 ab
    const values = (commandObj.get('text') ?? []).sort(
      (a, b) => a.length - b.length
    );
    const allIndices: Record<string, number> = {};
    for (let i = 0; i < values.length; i++) {
      const val = values[i];
      const indices = findAllSubstringIndices(logger.text, val, filters.isCaseSensitive);
      if (!Object.keys(indices).length) {
        return false;
      }
      /**
       * 这里使用对象的目的是为了长的替换短的，比如：{4:5} 这个时候有一个长的是: {4:6}
       * 那么很自然的就会把 {4:5} 替换掉
       */
      Object.assign(allIndices, indices);
    }

    /**
      将对象转换成数组，数组能保证顺序，要先处理字符串后面的下标，这样下标总是有效的
      如果先处理前面的，由于字符串被替换了，导致后面的下标不正确，比如：abc 假如有两个 0, 2
      假如先处理0，把0替换成123，这个时候就变成123bc，这个时候再处理2就会出现错乱
    */
    const tempIndices = convertAndSortRecord(allIndices);

    for (let j = 0; j < tempIndices.length; j += 1) {
      const { index, size } = tempIndices[j];
      const replacement = logger.text.slice(index, index + size);
      logger.text = replaceSubstring(
        logger.text,
        index,
        size,
        getSelectText(replacement)
      );
    }

    return true;
  }
};

const onSearch = () => {
  if (!searchContent.value) {
    logStore.updateIsOpenFilter(false);
    return;
  }
  const commandObj = handleCommandsMap();

  const newLoggers: LogType[] = [];
  for (let i = 0; i < logStore.loggers.length; i++) {
    const logger = { ...logStore.loggers[i] };
    if (handleTextCommand(commandObj, logger) === false) {
      continue;
    }
    const allCommand = commandObj.entries();
    let currentCommand = allCommand.next();
    while (!currentCommand.done) {
      const [command, values] = currentCommand.value as [
        keyof typeof logger,
        string[]
      ];
      if (
        !['formatData', 'text'].includes(command) &&
        !values.includes(logger[command]?.toString() ?? '')
      ) {
        break;
      }
      currentCommand = allCommand.next();
    }
    if (currentCommand.done) {
      newLoggers.push(logger);
    }
  }
  logStore.updateFilterLoggers(newLoggers);
  logStore.updateIsOpenFilter(true);
};

const onSwapCaseSensitivity = () => {
  filters.isCaseSensitive = !filters.isCaseSensitive
  onSearch()
}

watch(searchContent, (val) => {
  if (!val) {
    onSearch();
  }
});
</script>

<template>
  <div class="search-container">
    <a-input
      class="search"
      @pressEnter="onSearch"
      v-model:value="searchContent"
      placeholder="请输入搜索内容"
      allow-clear
    />
    <div
      :class="{
        'case-sensitivity-container': true,
        'case-sensitivity-container-selected': filters.isCaseSensitive,
      }"
      @click="onSwapCaseSensitivity"
    >
      <img
        src="../../../assets/images/case-sensitivity.svg"
        :class="{'case-sensitivity': true, 'selected-case-sensitivity': filters.isCaseSensitive}"
        alt=""
      />
    </div>
  </div>
</template>

<style>
.search-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 10px;
  gap: 10px;
  width: 50%;
}

.search {
  flex: 1;
  font-size: 18px;
}
.case-sensitivity-container {
  padding: 5px;
  border-radius: 5px;
  cursor: pointer;
  overflow: hidden;
}
.case-sensitivity-container-selected {
  background-color: rgb(51, 102, 102, 0.5);
}
.case-sensitivity {
  width: 25px;
  height: 25px;
  transform: translate(-100px);
  filter: drop-shadow(100px 0 0 #336666);
}
.selected-case-sensitivity {
  filter: drop-shadow(100px 0 0 #fff);
}
</style>
