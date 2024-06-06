<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import useLogStore from '@/stores/log';
import type { LogType } from '@/stores/log';
import { ArrowRightOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs'
const divRef = ref<HTMLDivElement | null>(null);
const logStore = useLogStore();
const mouseScrollHeight = ref(0);
const timer = ref<NodeJS.Timeout>();
const props = defineProps<{tabId: string}>()

const finallyLoggers = computed(() => {
  return logStore.currentFilterResults[props.tabId] ?? []
})

const scrollToBottom = () => {
  if (divRef.value && logStore.isScrollToBottom) {
    divRef.value.scrollTo({top: divRef.value.scrollHeight})
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
</script>

<template>
  <div class="log-container" ref="divRef" @scroll="scroll" @wheel="wheel">
    <a-list size="large" :data-source="finallyLoggers" :bordered="false">
      <template #renderItem="{ item }">
        <a-list-item
          @click="onClickItem(item)"
          class="list-item"
          :class="logStore.currentItem?.id === item.id && 'select-back'"
        >
          <div :class="`log-level-sign ${item.level}`" />
          <a-tag color="default">{{ dayjs(item.createTime).format("HH:mm:ss") }}</a-tag>
          <span class="header-text" v-html="item.text" />
          <arrow-right-outlined class="right-outlined" />
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<style scoped>
.log-container {
  overflow-y: auto;
  margin-bottom: 10px;
  flex: 1;
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
  white-space: nowrap;
  overflow-x: scroll;
  cursor: auto;
  margin-right: auto;
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

.right-outlined {
  margin-left: 10px;
}
</style>
