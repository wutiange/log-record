<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import useLogStore from '@/stores/log';
import type { LogType } from '@/stores/log';
import dayjs from 'dayjs'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
const divRef = ref<HTMLDivElement | null>(null);
const logStore = useLogStore();
const mouseScrollHeight = ref(0);
const timer = ref<NodeJS.Timeout>();
const props = defineProps<{ tabId: string }>()

const finallyLoggers = computed(() => {
  return logStore.currentFilterResults[props.tabId] ?? []
})

const scrollToBottom = () => {
  if (divRef.value && logStore.isScrollToBottom) {
    divRef.value.scrollTo({ top: divRef.value.scrollHeight })
  }
};

watch(finallyLoggers, () => {
  nextTick(scrollToBottom);
});

watch(() => logStore.isScrollToBottom, () => {
  nextTick(scrollToBottom);
});

const onClickItem = (item: LogType) => {
  timer.value && clearTimeout(timer.value);
  const selectedText = window.getSelection()?.toString();
  if (selectedText?.length) return;
  timer.value = setTimeout(() => {
    logStore.setTabIsScrollToBottomByTabId(false);
    logStore.updateCurrentItem(item);
    timer.value && clearTimeout(timer.value);
  }, 200);
};
const scroll = () => {
  if (divRef.value) {
    const scrollTop = divRef.value.scrollTop;
    const clientHeight = divRef.value.clientHeight;
    const scrollHeight = divRef.value.scrollHeight;
    if (scrollTop + clientHeight >= scrollHeight) {
      logStore.setTabIsScrollToBottomByTabId(true);
    }
  }
};
const wheel = (event: WheelEvent) => {
  const deltaY = event.deltaY;
  mouseScrollHeight.value += deltaY;
  let timer: ReturnType<typeof setTimeout> | undefined;
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => {
    if (mouseScrollHeight.value < -40) {
      logStore.setTabIsScrollToBottomByTabId(false);
    }
    mouseScrollHeight.value = 0;
  }, 200);
};

const texts = (text: string) => {
  return text.split(' ')
}

const getText = (text: string) => {
  try {
    return JSON.parse(text)
  } catch (error) {
    console.warn(error, text)
    return text
  }
}
</script>

<template>
  <div class="log-container" ref="divRef" @scroll="scroll" @wheel="wheel">
    <div v-for="item in finallyLoggers" class="item-box">
      <div :class="`log-level-sign ${item.level}`" />
      <a-tag color="default" class="tag-box">{{ dayjs(item.createTime).format("HH:mm:ss") }}</a-tag>

      <div class="msg-text">
        <vue-json-pretty v-for="text in item.formatData" :data="text" :deep="1" :show-double-quotes="true"
        showLength :collapsedNodeLength="1" :showIcon="!['string', 'number', 'null', 'undefined', 'boolean'].includes(typeof text)" :collapsed-on-click-brackets="true" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.log-container {
  overflow-y: auto;
  margin-bottom: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px
}

.log-container::-webkit-scrollbar {
  height: 1px;
  width: 5px;
}

.log-container::-webkit-scrollbar-thumb {
  background-color: rgba(51, 102, 102, 1);
  /* 可根据需要调整颜色 */
  border-radius: 10px;
}


.list-item:hover {
  background-color: #f5f5f5;
  cursor: pointer;
}

.select-back {
  background-color: #3366661a;
}

.log-level-sign {
  height: 22px;
  width: 2px;
  margin-right: 5px;
  flex-shrink: 0;
}
.tag-box {
  align-self: flex-start;
}

.log {
  background-color: #1677ff;
}

.warn {
  background-color: #faad14;
}

.error {
  background-color: #ff4d4f;
}

.header-text {
  overflow-x: scroll;
  cursor: auto;
  margin-right: auto;
}

.item-box {
  display: flex;
  flex-direction: row;
  padding: 10px 0;
}

.msg-text {
  margin-right: auto;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  align-self: center;
  gap: 10px;
  flex-wrap: wrap;
}

.header-text::-webkit-scrollbar {
  height: 3px;
}

.header-text::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  /* 可根据需要调整颜色 */
  border-radius: 10px;
}

.header-text::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

</style>
