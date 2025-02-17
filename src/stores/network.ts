import { SearchFilterType } from '@/types/global';
import { addUrlToTree } from '@/utils/network';
import { TreeProps } from 'ant-design-vue';
import { defineStore } from 'pinia';
import { ref } from 'vue';

const useNetworkStore = defineStore('network', () => {
  const treeData = ref<TreeProps['treeData']>([]);
  const requests = ref<Record<string, any>>({});
  const selectedRequest = ref<Record<string, any>>({});
  const searchFilter = ref<SearchFilterType>({
    text: '',
    isCaseSensitive: false,
  });

  const updateTreeData = (msg: any) => {
    let id = msg.requestId;
    try {
      if (!msg.requestId) {
        requests.value[msg.id] = {
          id: msg.id,
          url: msg.url,
          method: msg.method,
          reqHeaders: msg.headers,
          reqBody: msg.body,
          createTime: msg.createTime,
          loading: true,
          isResponseError: msg.isResponseError ?? false,
        };
        id = msg.id;
      } else if (msg.isResponseError) {
        Object.assign(requests.value[msg.requestId], {
          isResponseError: true,
          loading: false,
        });
      } else if (msg.isTimeout) {
        Object.assign(requests.value[msg.requestId], {
          isTimeout: true,
          loading: false,
        });
      } else if (msg.requestId) {
        if (typeof requests.value[msg.requestId] === 'object') {
          Object.assign(requests.value[msg.requestId], {
            resHeaders: msg.headers,
            resBody: msg.body,
            statusCode: msg.statusCode,
            endTime: msg.endTime,
            loading: false,
          });
        }
      } else {
        return;
      }
      const { statusCode, loading, url } = requests.value[id] ?? {};
      treeData.value = addUrlToTree(treeData.value, {
        statusCode,
        loading,
        id,
        url,
      });
    } catch (error) {
      console.warn('在整理网络数据的地方出现了错误', error);
    }
  };
  const onClearNetwork = () => {
    treeData.value = [];
    requests.value = {};
  };
  const select = (selectedKeys: string) => {
    selectedRequest.value = requests.value[selectedKeys[0]];
  };
  const setSearchFilter = (filter: Partial<SearchFilterType>) => {
    Object.assign(searchFilter.value, filter);
  };
  return {
    updateTreeData,
    onClearNetwork,
    treeData,
    selectedRequest,
    select,
    searchFilter,
    setSearchFilter,
    requests,
  };
});

export default useNetworkStore;
