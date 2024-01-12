<script setup lang="ts">
import PickingArea from './components/picking-area.vue';
import ContentArea from './components/content-area.vue';
import { onMounted, ref, watch } from 'vue';
import useLogStore from '../../stores/log';
import { message } from 'ant-design-vue';

const logStore = useLogStore();
const open = ref<boolean>(false);
const tabNameVisible = ref<boolean>(false);
const tabName = ref('');
const showDrawer = () => {
  open.value = true;
};

const onClearLog = () => {
  logStore.clearLoggers();
};

const onFollowScrolling = () => {
  logStore.setTabIsScrollToBottomByTabId(true);
};

const onEdit = (targetKey: string, action: string) => {
  if (action === 'add') {
    tabNameVisible.value = true;
  } else if (action === 'remove') {
    logStore.removeID(targetKey);
  }
};

const onChange = (targetKey: string) => {
  logStore.updateTabOperaHistory(targetKey);
};

const onConfirm = () => {
  if (!tabName.value) {
    message.warning('名称不能马虎，至少写一个');
    return;
  }
  const tabId = logStore.allocateID(tabName.value);
  logStore.swapCurrentShowTabId(tabId);
  logStore.updateTabOperaHistory(tabId);
  tabNameVisible.value = false;
};

watch(() => logStore.currentItem, showDrawer);

onMounted(() => {
  if (!logStore.currentShowTabId) {
    const tabId = logStore.allocateID('默认');
    logStore.updateTabOperaHistory(tabId);
  }
});
</script>

<template>
  <div class="loggers-container">
    <a-tabs
      v-model:activeKey="logStore.currentShowTabId"
      @change="onChange"
      type="editable-card"
      @edit="onEdit"
      class="tabs"
      :tabBarGutter="10"
    >
      <a-tab-pane
        class="tab-pane"
        v-for="tabIdObj in logStore.tabIds"
        :key="tabIdObj.tabId"
        :tab="tabIdObj.title"
      >
        <PickingArea :tab-id="tabIdObj.tabId" />
      </a-tab-pane>
    </a-tabs>
    <a-drawer
      v-model:open="open"
      title="日志详情"
      placement="right"
      width="60%"
    >
      <ContentArea />
    </a-drawer>
    <div class="related-operation">
      <a-tooltip>
        <template #title>会把当前显示的日志清除</template>
        <img
          src="../../assets/images/clear.svg"
          alt="清除日志"
          @click="onClearLog"
        />
      </a-tooltip>
      <a-tooltip>
        <template #title>会跟随日志滚动</template>
        <img
          src="../../assets/images/scroll-to-end.svg"
          alt="跟随滚动"
          @click="onFollowScrolling"
          :class="{ 'img-select': logStore.isScrollToBottom }"
        />
      </a-tooltip>
    </div>
    <a-modal
      v-model:open="tabNameVisible"
      title="新增Tab"
      @ok="onConfirm"
      :closable="false"
    >
      <a-input v-model:value="tabName" placeholder="请输入Tab名称" />
    </a-modal>
  </div>
</template>

<style scoped>
.loggers-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 0;
  height: 100%;
}

.tabs {
  margin-top: 5px;
  height: 100%;
}

.tab-pane {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tabs :deep(.ant-tabs-content) {
  height: 100%;
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
