<script setup lang="ts">
import { ref } from 'vue';
import { TreeProps } from 'ant-design-vue';
import { parseUrl } from '@/utils/strings';
import SplitPane from '@/pages/components/split-pane.vue';
import ContentArea from './content-area.vue';
import ClearIcon from '@/assets/images/clear-icon.vue'

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
const selectedRequest = ref<Record<string, any>>({})



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

const select = (selectedKeys: string) => {
  selectedRequest.value = requests.value[selectedKeys[0]]
}

const onClearNetwork = () => {
  treeData.value = []
  requests.value = {}
}
</script>

<template>
  <div class="network-container">
    <SplitPane :initial-left-width="300" :min-width="200">
      <template #left>
        <div class="content content-left">
          <div class="network-record">
            <a-directory-tree @select="select" class="tree-box" :tree-data="treeData" />
          </div>
          <div class="tool-box">
              <ClearIcon class="clear" @click="onClearNetwork" />
          </div>
        </div>
      </template>
      <template #right>
        <div class="content">
          <ContentArea :csn="selectedRequest" />
        </div>
      </template>
    </SplitPane>
  </div>
</template>

<style scoped>
/deep/ .tree-box {
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
