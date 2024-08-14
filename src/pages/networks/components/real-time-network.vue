<script setup lang="ts">
import { ref } from 'vue';
import dayjs from 'dayjs'
import useNetworkStore, { Network } from '@/stores/network';
import { TreeProps } from 'ant-design-vue';
import { parseUrl } from '@/utils/strings';
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
  networkStore.updateCurrentSelectNetwork({ ...item });
};

function customRow(record: any) {
  return {
    onClick: () => onClickItem(record)
  }
}


function addUrlToTree(treeData: TreeProps['treeData'], url: string, id: string): TreeProps['treeData'] {
  const urlParts = parseUrl(url);

  function generateNode(part: string, isLeaf: boolean) {

    return {
      title: part,
      key: isLeaf ? id : `${part}-${Date.now()}`, // 生成唯一的 key,
      children: [] as TreeProps['treeData'],
      isLeaf,
      selectable: isLeaf
    };

  }

  function insertNode(nodes: TreeProps['treeData'], parts: string[], id: string, currentDepth: number = 0): void {
    const currentPart = parts[currentDepth];

    if (!currentPart) return;

    let existingNode = nodes.find(node => node.title === currentPart);
    if (currentDepth === parts.length - 1) {
      const requestExist = nodes.find(node => node.key === id);
      console.log(requestExist, '----requestExist---')
      if (!requestExist) {
        existingNode = generateNode(currentPart, true)
        nodes.push(existingNode)
      }
    } else if (!existingNode) {
      existingNode = generateNode(currentPart, false)
      nodes.push(existingNode);
    }

    if (!existingNode.children) {
      existingNode.children = [];
    }

    if (existingNode.children) {
      insertNode(existingNode.children, parts, id, currentDepth + 1);
    }
  }

  insertNode(treeData, urlParts, id);
  return treeData;
}

const treeData = ref<TreeProps['treeData']>([])
const requests = ref<Record<string, any>>({})



window.electronAPI.onGetNetworkMsg((msg: any) => {
  let id = msg.requestId
  try {
    if (!msg.requestId) {
      requests.value[msg.id] = {
        id: msg.id,
        url: msg.url,
        method: msg.method,
        reqHeaders: msg.headers,
        reqBody: msg.body,
        createTime: msg.createTime,
        isResponseError: msg.isResponseError ?? false,
      }
      id = msg.id
    } else if (msg.isResponseError) {
      Object.assign(requests.value[msg.requestId], { isResponseError: true });
    } else if (msg.isTimeout) {
      Object.assign(requests.value[msg.requestId], { isTimeout: true });
    } else if (msg.requestId) {
      if (typeof requests.value[msg.requestId] === "object") {
        Object.assign(requests.value[msg.requestId], {
          resHeaders: msg.headers,
          resBody: msg.body,
          statusCode: msg.statusCode,
          endTime: msg.endTime,
        });
      }
    } else {
      return
    }
    treeData.value = addUrlToTree(treeData.value, requests.value[id].url, id)
  } catch (error) {
    console.warn("在整理网络数据的地方出现了错误", error)
  }

})
</script>

<template>
  <div class="log-container">
    <a-table :dataSource="networkStore.networks" :columns="columns" :customRow="customRow">
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'method'">
        <span>{{ record.method?.toLocaleUpperCase() }}</span>
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
    <!-- <a-directory-tree class="tree-box" :tree-data="treeData"></a-directory-tree>
    <div class="network-content">这是显示内容</div> -->
  </div>
</template>

<style scoped>
.log-container {
  overflow-y: auto;
  margin-bottom: 10px;
  flex: 1;
  margin: 10px;
  /* flex-direction: row;
  display: flex; */
}

/deep/ .tree-box {
  flex: 1;
}

.network-content {
  flex: 3;
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
