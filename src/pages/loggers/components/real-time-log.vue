<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import useLogStore from '@/stores/log';
import dayjs from 'dayjs'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
// @ts-ignore
import { RecycleScroller as RecycleScrollerType } from 'vue-virtual-scroller'
const divRef = ref<RecycleScrollerType | null>(null);
const logStore = useLogStore();
const props = defineProps<{ tabId: string }>()

const finallyLoggers = computed(() => {
  return logStore.currentFilterResults[props.tabId] ?? []
})

const scrollToBottom = () => {
  if (divRef.value && logStore.isScrollToBottom) {
    divRef.value.scrollToItem(finallyLoggers.value.length - 1)
  }
};

watch(finallyLoggers, () => {
  nextTick(scrollToBottom);
});

watch(() => logStore.isScrollToBottom, () => {
  nextTick(scrollToBottom);
});

const scroll = () => {
};
const wheel = () => {
  logStore.setTabIsScrollToBottomByTabId(false);
};


const parseText = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
}

</script>

<template>
  <DynamicScroller :items="finallyLoggers" :min-item-size="54" class="log-container" ref="divRef" @scroll="scroll"
    @wheel="wheel">
    <template v-slot="{ item, index, active }">
      <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[
        item.formatData,
      ]" :data-index="index" class="item-box">
        <div :class="`log-level-sign ${item.level}`" />
        <a-tag color="default" class="tag-box">{{ dayjs(item.createTime).format("HH:mm:ss.SSS") }}</a-tag>

        <div class="msg-text">
          <vue-json-pretty v-for="text in item.formatData" :data="parseText(text)" :deep="1" :show-double-quotes="true"
            showLength :collapsedNodeLength="1"
            :showIcon="!['string', 'number', 'null', 'undefined', 'boolean'].includes(typeof text)"
            :collapsed-on-click-brackets="true" :key="text + item.createTime" />
        </div>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>

<style scoped>
.log-container {
  overflow-y: auto;
  margin-bottom: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.log-container::-webkit-scrollbar {
  height: 1px;
  width: 8px;
}

.log-container::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}

.log-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(51, 102, 102, 1);
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
  padding: 8px 0;
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

</style>
