<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import LogSearchFilter from './log-search-filter.vue'
import RealTimeLog from './real-time-log.vue'
import useLogStore from '@/stores/log';

const tabId = ref<string>('')
const logStore = useLogStore()

onMounted(() => {
  tabId.value = logStore.allocateID()
  logStore.swapCurrentShowTabId(tabId.value)
})

onUnmounted(() => {
  logStore.removeID(tabId.value)
})

</script>

<template>
  <LogSearchFilter v-if="tabId !== ''" :tabId="tabId" />
  <RealTimeLog v-if="tabId !== ''" :tabId="tabId" />
</template>

<style scoped></style>