<script setup lang="ts">
import PickingArea from './components/picking-area.vue';
import ContentArea from './components/content-area.vue';
import { onMounted, ref, watch } from 'vue';
import useLogStore from '../../stores/log';

const logStore = useLogStore();
const open = ref<boolean>(false);
const showDrawer = () => {
  open.value = true;
};

console.log(logStore.tabIds)

const onClearLog = () => {
  logStore.clearLoggers();
};

const onFollowScrolling = () => {
  logStore.setTabIsScrollToBottomByTabId(true);
};

const onEdit = (targetKey: string, action: string) => {
  if (action === 'add') {
    const tabId = logStore.allocateID("尝试")
    logStore.swapCurrentShowTabId(tabId)
    logStore.updateTabOperaHistory(tabId)
  } else if (action === 'remove') {
    logStore.removeID(targetKey)
  }
};

const onChange = (targetKey: string) => {
  logStore.updateTabOperaHistory(targetKey)
}

watch(() => logStore.currentItem, showDrawer);

onMounted(() => {
  if (!logStore.currentShowTabId) {
    const tabId = logStore.allocateID("默认")
    logStore.updateTabOperaHistory(tabId)
  }
})

</script>

<template>
  <div class="loggers-container">
    <a-tabs v-model:activeKey="logStore.currentShowTabId" @change="onChange" type="editable-card" @edit="onEdit" class="tabs"
      :tabBarGutter="10">
      <a-tab-pane v-for="tabIdObj in logStore.tabIds" :key="tabIdObj.tabId" :tab="tabIdObj.title">
        <PickingArea :tab-id="tabIdObj.tabId" />
      </a-tab-pane>
    </a-tabs>
    <a-drawer v-model:open="open" title="日志详情" placement="right" width="60%">
      <ContentArea />
    </a-drawer>
    <div class="related-operation">
      <a-tooltip>
        <template #title>会把当前显示的日志清除</template>
        <img src="../../assets/images/clear.svg" alt="清除日志" @click="onClearLog" />
      </a-tooltip>
      <a-tooltip>
        <template #title>会跟随日志滚动</template>
        <img src="../../assets/images/scroll-to-end.svg" alt="跟随滚动" @click="onFollowScrolling"
          :class="{ 'img-select': logStore.isScrollToBottom }" />
      </a-tooltip>
    </div>
  </div>
</template>

<style scoped>
.loggers-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 0;
}

.tabs {
  margin-top: 5px;
}

.related-operation {
  position: fixed;
  bottom: 100px;
  right: 100px;
  background-color: rgba(51, 102, 102, 0.3);
  border-radius: 5px;
  overflow: hidden;
}

img {
  width: 45px;
  padding: 10px;
}

img:hover {
  background-color: rgba(51, 102, 102, 1);
}

.img-select {
  background-color: rgba(51, 102, 102, 0.6);
}
</style>
