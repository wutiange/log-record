<script setup lang="ts">
import useLogStore from '../../../stores/log';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';


const logStore = useLogStore();
const filters = reactive({ isCaseSensitive: false });
const timer = ref<NodeJS.Timeout | null>(null)
const props = defineProps<{ tabId: string }>()


const searchText = ref('')
const contentDiv = ref<HTMLElement | null>(null)
const textArea = ref<HTMLTextAreaElement | null>(null)


const resizeObserver = new ResizeObserver(entries => {
  for (let entry of entries) {
    if (entry.target === contentDiv.value && textArea.value) {
      textArea.value.style.height = `${entry.contentRect.height}px`;
    }
  }
});


function processString(input: string): (string | string[])[] {
  const parts = input.split(' ');

  return parts.map(part => {
    if (part.includes(':')) {
      return part.split(':');
    } else {
      return part;
    }
  });
}


watch(searchText, () => {
  // 将字符串处理成数组，如：123:234 sdd a:123 得到的结果为：[[123, 234], sdd, [a, 123]]
  const result = processString(searchText.value)
  contentDiv.value.innerHTML = result.map(item => {
    if (Array.isArray(item)) {
      return `<span class="group-text">${item[0]}:<span class="group-value">${item[1]}</span></span>`;
    } else {
      return item;
    }
  }).join(' ');

})

const onSearch = () => {
  logStore.updateSearchFilterByTabId(props.tabId, {
    text: searchText.value,
    isCaseSensitive: filters.isCaseSensitive
  })
}

const onSwapCaseSensitivity = () => {
  filters.isCaseSensitive = !filters.isCaseSensitive
  onSearch()
}

const clearTimer = () => {
  if (timer.value) {
    clearTimeout(timer.value)
  }
}

watch(searchText, (val) => {
  clearTimer()
  if (!val) {
    onSearch();
  } else {
    timer.value = setTimeout(onSearch, 500)
  }
});

onUnmounted(clearTimer)

onMounted(() => {
  if (contentDiv.value) {
    resizeObserver.observe(contentDiv.value);
  }
  if (textArea.value) {
    textArea.value.addEventListener("keydown", (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        onSearch()
      }
      event.preventDefault(); // 阻止默认的换行行为
    })
  }
});

onUnmounted(() => {
  resizeObserver.disconnect();
})

</script>

<template>
  <div class="search-container">
    <div class="input-container">

      <div class="input-box">
        <div class="input-content" ref="contentDiv" :spellcheck="false" />
        <textarea ref="textArea" v-model="searchText" placeholder="请输入搜索内容" class="input-item"></textarea>
      </div>
    </div>
    <a-tooltip>
      <template #title>忽略大小写</template>
      <div :class="{
        'case-sensitivity-container': true,
        'case-sensitivity-container-selected': filters.isCaseSensitive,
      }" @click="onSwapCaseSensitivity">
        <img src="../../../assets/images/case-sensitivity.svg"
          :class="{ 'case-sensitivity': true, 'selected-case-sensitivity': filters.isCaseSensitive }" alt="" />
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
  border-radius: 5px;
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
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 8px 10px;
}

.input-item {
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 10px;
  right: 10px;
  display: flex;
  resize: none;
  outline: none;
  border: 0px;
  padding: 0px;
  line-height: 25px;
  margin-bottom: -1px;
  background: transparent;
  font-size: 12px;
  font-family: "新宋体 Console";
  caret-color: black;
  color: transparent;
  overflow: hidden;
  overflow-wrap: break-word;
  box-sizing: content-box;
}

.input-content {
  inset: 0px;
  user-select: none;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 25px;
  font-size: 12px;
  font-family: "新宋体 Console";
  min-height: 25px;
  box-sizing: content-box;
  height: auto;
}

.input-content::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}

.input-container {
  width: 100%;
}

.group-text {
  background: rgba(60, 116, 221, 0.09);
  border: 1px solid rgba(60, 116, 221, 0.5);
  margin-left: -2px;
  padding: 0px;
}

.group-value {
  color: #3C74DD;
}
</style>
