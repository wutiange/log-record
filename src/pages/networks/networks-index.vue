<script setup lang="ts">
import { ref, watch } from 'vue';
import RealTimeNetwork from './components/real-time-network.vue';
import ContentArea from './components/content-area.vue';
import useNetworkStore from '@/stores/network';
const open = ref<boolean>(false);
const networkStore = useNetworkStore();
const showDrawer = () => {
  open.value = true;
};
watch(() => networkStore.currentSelectNetwork, showDrawer);
</script>

<template>
  <RealTimeNetwork />
  <a-drawer v-model:open="open" title="网络详情" placement="right" width="60%">
    <ContentArea />
  </a-drawer>
</template>