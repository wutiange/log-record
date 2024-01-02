<script setup lang="ts">
import PickingArea from './components/picking-area.vue';
import ContentArea from './components/content-area.vue';
import { ref, watch } from 'vue';
import useLogStore from '../../stores/log';

const logStore = useLogStore();
const open = ref<boolean>(false);

const showDrawer = () => {
  open.value = true;
};

const onClearLog = () => {
  logStore.clearLoggers();
};

const onFollowScrolling = () => {
  logStore.setIsScrollToBottom(true);
};

watch(() => logStore.currentItem, showDrawer);
</script>

<template>
  <div class="loggers-container">
    <PickingArea />
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
          :class="{'img-select': logStore.isScrollToBottom}"
        />
      </a-tooltip>
    </div>
  </div>
</template>

<style scoped>
.loggers-container {
  display: flex;
  flex-direction: column;
  width: 0;
  flex: 1;
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
