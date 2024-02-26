<script setup lang="ts">
import { ref } from 'vue';
import dayjs from 'dayjs'
import useNetworkStore, { Network } from '@/stores/network';
const networkStore = useNetworkStore();
const columns = ref([
  {
    title: '方法',
    dataIndex: 'method',
    key: 'method',
  },
  {
    title: '请求时间',
    dataIndex: 'createTime',
    key: 'createTime',
  },
  {
    title: '地址',
    dataIndex: 'url',
    key: 'url',
  },
  {
    title: '状态',
    dataIndex: 'statusCode',
    key: 'statusCode'
  },
  {
    title: '耗时',
    dataIndex: 'endTime',
    key: 'endTime'
  }
],)

const onClickItem = (item: Network) => {
  const selectedText = window.getSelection()?.toString();
  if (selectedText?.length) return;
  networkStore.updateCurrentSelectNetwork({...item});
};

function customRow(record: any) {
  return {
    onClick: () => onClickItem(record)
  }
}
</script>

<template>
  <div class="log-container">
    <a-table :dataSource="networkStore.networks" :columns="columns" :customRow="customRow">
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'method'">
        <span>{{ record.method.toLocaleUpperCase() }}</span>
      </template>
      <template v-if="column.key === 'createTime'">
        <span>{{ dayjs(record.createTime).format("HH:mm:ss") }}</span>
      </template>

      <template v-else-if="column.key === 'statusCode'">
        <span v-if="record.isResponseError">错误</span>
        <span v-else-if="record.isTimeout">超时</span>
        <a-spin v-else-if="!record.statusCode" />
        <span v-else>{{ record.statusCode }}</span>
      </template>

      <template v-if="column.key === 'endTime'">
        <span v-if="!record.statusCode">-</span>
        <span v-else>{{ record.endTime - record.createTime }}ms</span>
      </template>
    </template>
    </a-table>
  </div>
</template>

<style scoped>
.log-container {
  overflow-y: auto;
  margin-bottom: 10px;
  flex: 1;
  margin: 10px;
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
  margin-left: 8px;
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
