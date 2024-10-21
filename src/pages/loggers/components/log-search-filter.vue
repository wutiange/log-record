<script setup lang="ts">
import { advancedSplit } from '@/utils/log';
import useLogStore from '../../../stores/log';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';

const logStore = useLogStore();
const filters = reactive({ isCaseSensitive: false });
const timer = ref<NodeJS.Timeout | null>(null);
const props = defineProps<{ tabId: string }>();
const searchText = ref('');
const contentDiv = ref<HTMLElement | null>(null);
const textArea = ref<HTMLTextAreaElement | null>(null);
const isFocus = ref(false);
const command = ref<string | null>(null);

const onFocus = () => {
  isFocus.value = true;
};
const onBlur = () => {
  isFocus.value = false;
};

const resizeObserver = new ResizeObserver((entries) => {
  for (let entry of entries) {
    if (entry.target === contentDiv.value && textArea.value) {
      textArea.value.style.height = `${entry.contentRect.height}px`;
    }
  }
});

function processString(input: string): (string | string[])[] {
  const parts = advancedSplit(input);

  return parts.map((part) => {
    if (part.includes(':')) {
      return part.split(':');
    } else {
      return part;
    }
  });
}

watch(searchText, () => {
  // 将字符串处理成数组，如：123:234 sdd a:123 得到的结果为：[[123, 234], sdd, [a, 123]]
  const result = processString(searchText.value);
  contentDiv.value.innerHTML = result
    .map((item) => {
      if (Array.isArray(item)) {
        return `<span class="group-text">${item[0]}:<span class="group-value">${item[1]}</span></span>`;
      } else {
        return item;
      }
    })
    .join(' ');
  const size = searchText.value.length;
  if (searchText.value[size - 1] === ':') {
    const lastSpaceIndex = searchText.value.lastIndexOf(' ');
    command.value = searchText.value.substring(lastSpaceIndex + 1, size - 1);
  } else {
    command.value = null;
  }
});

const onSearch = () => {
  logStore.updateSearchFilterByTabId(props.tabId, {
    text: searchText.value,
    isCaseSensitive: filters.isCaseSensitive,
  });
};

const onSwapCaseSensitivity = () => {
  filters.isCaseSensitive = !filters.isCaseSensitive;
  onSearch();
};

const clearTimer = () => {
  if (timer.value) {
    clearTimeout(timer.value);
  }
};
watch(searchText, (val) => {
  clearTimer();
  if (!val) {
    onSearch();
  } else {
    timer.value = setTimeout(onSearch, 500);
  }
});

const onTag = (key: string) => {
  const size = searchText.value.length;
  const lastWord = searchText.value[size - 1];
  if (lastWord === ' ' || lastWord === undefined) {
    searchText.value += `${key}:`;
  } else {
    searchText.value += ` ${key}:`;
  }
};

const onTagValue = (val: string) => {
  searchText.value += `"${val}" `;
};

onUnmounted(clearTimer);

onMounted(() => {
  if (contentDiv.value) {
    resizeObserver.observe(contentDiv.value);
  }
  if (textArea.value) {
    textArea.value.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        onSearch();
      }
      if (event.key === 'Enter') {
        event.preventDefault(); // 阻止默认的换行行为
      }
    });
  }
});

onUnmounted(() => {
  resizeObserver.disconnect();
});
</script>

<template>
  <div class="search-container">
    <div class="input-container">
      <div :class="{ 'input-box': true, 'input-box-focus': isFocus }">
        <div class="input-content" ref="contentDiv" />
        <textarea ref="textArea" v-on:blur="onBlur" v-on:focus="onFocus" v-model="searchText"
          :placeholder="$t('请输入搜索内容')" class="input-item"></textarea>
      </div>
      <div class="tip-box" v-if="isFocus && Object.keys(logStore.keyValues).length > 0" @mousedown.prevent>
        <div class="label-box">
          <template v-if="command === null">
            <span class="title-box">{{ $t('标签') }}</span>
            <div class="tag-container">
              <span class="tag-text" v-for="key in Object.keys(logStore.keyValues)" @click="onTag(key)">
                {{ key }}
              </span>
            </div>
          </template>
          <template v-if="command">
            <span class="title-box">{{ $t('标签（{command}）对应的值', { command: command }) }}</span>
            <div class="tag-container">
              <span class="tag-text" v-for="value of logStore.keyValues[command]" @click="onTagValue(value)">
                {{ value }}
              </span>
            </div>
          </template>
        </div>
      </div>
    </div>
    <a-tooltip>
      <template #title>{{ $t('忽略大小写') }}</template>
      <div :class="{
        'case-sensitivity-container': true,
        'case-sensitivity-container-selected': filters.isCaseSensitive,
      }" @click="onSwapCaseSensitivity">
        <img src="@/assets/images/case-sensitivity.svg" :class="{
          'case-sensitivity': true,
          'selected-case-sensitivity': filters.isCaseSensitive,
        }" alt="" />
      </div>
    </a-tooltip>
  </div>
</template>

<style>
.search-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0 10px 10px 10px;
  gap: 10px;
  width: 50%;
}

.case-sensitivity-container {
  padding: 5px;
  border-radius: var(--border-radius-default);
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;
}

.case-sensitivity-container-selected {
  background-color: rgb(51, 102, 102, 0.5);
}

.case-sensitivity {
  width: 20px;
  height: 20px;
  transform: translate(-100px);
  filter: drop-shadow(100px 0 0 #336666);
}

.selected-case-sensitivity {
  filter: drop-shadow(100px 0 0 #fff);
}

.input-box {
  width: 100%;
  align-items: center;
  position: relative;
  border-radius: var(--border-radius-default);
  padding: 4px 10px;
  border: 1px solid var(--color-scroll);
  box-sizing: border-box;
}

.input-box-focus {
  border: 1px solid var(--color-main);
  box-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1);
}

.input-item {
  position: absolute;
  top: 4px;
  bottom: 8px;
  left: 10px;
  right: 10px;
  resize: none;
  outline: none;
  border: none;
  padding: 0px;
  line-height: 25px;
  margin-bottom: -1px;
  background: transparent;
  font-size: 14px;
  font-family: '新宋体 Console';
  caret-color: var(--color-text);
  color: var(--color-text);
  overflow: hidden;
  overflow-wrap: break-word;
}

.input-content {
  inset: 0px;
  user-select: none;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 25px;
  font-family: '新宋体 Console';
  font-size: 14px;
  min-height: 25px;
  height: auto;
}

.input-content::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}

.input-container {
  width: 100%;
}

.input-item::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}

.group-text {
  background: rgba(60, 116, 221, 0.1);
  padding: 0px;
}

.group-value {
  color: #3c74dd;
}

.tip-box {
  position: absolute;
  max-width: 80%;
  background-color: #fff;
  border-radius: 8px;
  z-index: 99;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 10px;
  padding-bottom: 10px;
}

.label-box {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.title-box {
  background-color: #f5f5f5;
  padding: 10px;
}

.tag-container {
  margin-left: 20px;
  margin-right: 20px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  overflow: auto;
}

.tag-text {
  cursor: pointer;
  padding: 2px 5px;
  border: 1px solid var(--color-scroll);
  border-radius: var(--border-radius-default);
}
</style>
