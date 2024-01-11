<script setup lang="ts">
import { onUnmounted } from 'vue';
import LogSearchFilter from './log-search-filter.vue'
import RealTimeLog from './real-time-log.vue'
import useLogStore from '@/stores/log';
const logStore = useLogStore();
const props = defineProps<{tabId: string}>()
onUnmounted(() => {
  logStore.removeID(props.tabId)
})
</script>

<template>
  <LogSearchFilter v-if="props.tabId !== ''" :tabId="props.tabId" />
  <RealTimeLog v-if="props.tabId !== ''" :tabId="props.tabId" />
</template>

<style scoped></style>