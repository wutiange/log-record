<script setup lang="ts">
import SplitPane from '@/pages/components/split-pane.vue';
import ContentArea from './content-area.vue';
import ClearIcon from '@/assets/images/clear-icon.vue'
import useNetworkStore from '@/stores/network';
import { computed } from 'vue';
import { filterDataNodes } from '@/utils/network';

const networkStore = useNetworkStore()

const filterTreeData = computed(() => {
  return filterDataNodes(networkStore.treeData, networkStore.searchFilter)
})
</script>

<template>
  <div class="network-container">
    <SplitPane :initial-left-width="300" :min-width="200">
      <template #left>
        <div class="content content-left">
          <div class="network-record">
            <a-directory-tree @select="networkStore.select" class="tree-box" :tree-data="filterTreeData" />
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
:deep(.tree-box) {
  flex: 1;
}

.network-container {
  height: 100%;
  width: 100%;
}

.content {
  padding: 15px;
  margin: 10px;
  background-color: white;
  height: 100%;
  border-radius: 10px;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.content::-webkit-scrollbar {
  height: 5px;
  width: 5px;
}

.content::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}

.content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(51, 102, 102, 1);
}

.content-left {
  gap: 10px;
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
  background-color: #ccc;
  border-radius: 4px;
}

.network-record::-webkit-scrollbar-thumb:hover {
  background-color: rgba(51, 102, 102, 1);
}

.clear {
  width: 20px;
  color: rgba(51, 102, 102);
  height: 20px;
  padding: 5px;
  border-radius: 5px;
  box-sizing: content-box;
  cursor: pointer;
}

.clear:hover {
  background-color: rgba(51, 102, 102);
  color: white;
}

.tool-box {
  background-color: rgba(51, 102, 102, 0.1);
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 10px;
  border-radius: 5px;
  align-self: flex-end;
}
</style>