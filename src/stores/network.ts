import { defineStore } from "pinia";
import { ref } from "vue";

export type Network = {
  id: number;
  requestId?: number;
  url: string;
  createTime: number;
  method: string;
  reqHeaders: Record<string, any>;
  resHanders: Record<string, any>;
  reqBody: string;
  resBody: string;
  statusCode: number
}

const useNetworkStore = defineStore('network', () => {
  const networks = ref<Network[]>([])
  const currentSelectNetwork = ref<Network | null>(null)

  function unshift(msg: Network) {
    if (msg.requestId) {
      const index = networks.value.findIndex(e => e.id === msg.requestId)
      if (typeof networks.value[index] === 'object') {
        Object.assign(networks.value[index], {
          resHanders: msg.headers,
          resBody: msg.body,
          statusCode: msg.statusCode
        })
      }
    } else {
      networks.value.unshift({
        id: msg.id,
        url: msg.url,
        method: msg.method,
        reqHeaders: msg.headers,
        reqBody: msg.body
      })
    }
  }

  function updateCurrentSelectNetwork(currentNetwork: Network) {
    currentSelectNetwork.value = currentNetwork
  }
  return {
    networks, 
    unshift, 
    currentSelectNetwork,
    updateCurrentSelectNetwork
  }
})


export default useNetworkStore