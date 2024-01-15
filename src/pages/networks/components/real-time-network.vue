<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import useNetworkStore, { Network } from '@/stores/network';
import { ArrowRightOutlined } from '@ant-design/icons-vue';
import { getHMS } from '@/utils/log';
const divRef = ref<HTMLDivElement | null>(null);
const networkStore = useNetworkStore();
const mouseScrollHeight = ref(0);
const timer = ref<NodeJS.Timeout>();
const props = defineProps<{tabId: string}>()




const onClickItem = (item: Network) => {
  timer.value && clearTimeout(timer.value);
  const selectedText = window.getSelection()?.toString();
  if (selectedText?.length) return;
  
  networkStore.updateCurrentSelectNetwork(item);
};
</script>

<template>
  <div class="log-container">
    <a-list size="large" :data-source="networkStore.networks" :bordered="false">
      <template #renderItem="{ item }">
        <a-list-item
          @click="onClickItem(item)"
          class="list-item"
          :class="networkStore.currentSelectNetwork?.id === item.id && 'select-back'"
        >
          <div :class="`log-level-sign ${item.level}`" />
          <a-tag color="default">{{ getHMS(item.createTime) }}</a-tag>
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
  display: none;
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
