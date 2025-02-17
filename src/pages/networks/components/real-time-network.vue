<script setup lang="ts">
import SplitPane from '@/pages/components/split-pane.vue';
import ContentArea from './content-area.vue';
import ClearIcon from '@/assets/images/clear-icon.vue';
import useNetworkStore from '@/stores/network';
import { ref, watch, isRef } from 'vue';
import { filterDataNodes } from '@/utils/network';
import { ClockCircleOutlined } from '@ant-design/icons-vue';
import { TreeProps } from 'ant-design-vue';
import { DataNode } from 'ant-design-vue/es/tree';

const networkStore = useNetworkStore();
const expandedKeys = ref<(string | number)[]>([]);
let timer: NodeJS.Timeout | null = null;
const filterTreeData = ref<DataNode[]>([]);

const findKey = (arr: TreeProps['treeData']) => {
  const tempArr: (string | number)[] = [];
  arr.forEach((tree) => {
    tempArr.push(tree.key);
    if (Array.isArray(tree.children)) {
      tempArr.push(...findKey(tree.children));
    }
  });
  return tempArr;
};

watch(
  () => networkStore.treeData,
  () => {
    console.log(networkStore.treeData);
    filterTreeData.value = networkStore.treeData;
  },
);

watch(networkStore.searchFilter, () => {
  const clean = () => {
    if (timer === null) {
      return;
    }
    clearTimeout(timer);
    timer = null;
  };
  clean();
  timer = setTimeout(() => {
    if (!networkStore.searchFilter.text) {
      return;
    }
    filterTreeData.value = filterDataNodes(
      networkStore.treeData,
      networkStore.searchFilter,
    );
    expandedKeys.value = findKey(filterTreeData.value);
    clean();
  }, 500);
});
</script>

<template>
  <div class="network-container">
    <SplitPane :initial-left-width="300" :min-width="200">
      <template #left>
        <div class="content content-left">
          <div class="network-record">
            <a-directory-tree
              v-model:expandedKeys="expandedKeys"
              @select="networkStore.select"
              class="tree-box"
              :tree-data="filterTreeData"
            >
              <template #title="{ title, isLeaf, statusCodeKey, statusCode }">
                <span v-if="isLeaf">
                  <a-tag v-if="statusCodeKey === 'processing'">
                    <clock-circle-outlined :spin="true" />
                  </a-tag>
                  <a-tag v-else :color="statusCodeKey">
                    {{ statusCode }}
                  </a-tag>
                  <span>{{ title }}</span>
                </span>
                <span v-else>{{ title }}</span>
              </template>
            </a-directory-tree>
          </div>
          <div class="tool-box">
            <ClearIcon class="clear" @click="networkStore.onClearNetwork" />
          </div>
        </div>
      </template>
      <template #right>
        <div class="content">
          <ContentArea :csn="networkStore.selectedRequest" />
        </div>
      </template>
    </SplitPane>
  </div>
</template>

<style scoped>
:deep(.ant-tree-node-content-wrapper) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 200px;
}

:deep(.tree-box) {
  flex: 1;
}

:deep(.ant-tree-treenode-selected) {
  background: var(--color-main);
}

:deep(.ant-tree-treenode-selected::before) {
  background: none !important;
}

:deep(.ant-tag) {
  font-size: 10px;
  padding-inline: 4px;
  line-height: 14px;
}

.network-container {
  height: 100%;
  width: 100%;
}

.content {
  margin: 10px;
  height: 100%;
  border-radius: var(--border-radius-large);

  overflow: auto;
  display: flex;
  flex-direction: column;
}

.content::-webkit-scrollbar {
  height: 5px;
  width: 5px;
}

.content::-webkit-scrollbar-thumb {
  background-color: var(--color-scroll);
  border-radius: var(--border-radius-default);
}

.content::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-main);
}

.content-left {
  gap: 10px;
  padding: 15px;
  background-color: var(--color-background);
}

.network-record {
  flex: 1;
  overflow: auto;
}

.network-record::-webkit-scrollbar {
  height: 5px;
  width: 5px;
}

.network-record::-webkit-scrollbar-thumb {
  background-color: var(--color-scroll);
  border-radius: var(--border-radius-default);
}

.network-record::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-main);
}

.clear {
  width: 20px;
  color: var(--color-main);
  height: 20px;
  padding: 5px;
  border-radius: var(--border-radius-default);
  box-sizing: content-box;
  cursor: pointer;
}

.clear:hover {
  background-color: var(--color-main);
  color: var(--color-background);
}

.tool-box {
  background-color: rgba(51, 102, 102, 0.1);
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: var(--border-radius-default);
  align-self: flex-end;
}

.status-normal {
  text-align: center;
  vertical-align: middle;
  margin: 0 2px;
}

.status-success {
  color: #00ff00;
}

.status-error {
  color: #ff0000;
}

.status-warning {
  color: #ffff00;
}
</style>
