<script setup lang="ts">
import LogSearchFilter from './log-search-filter.vue'
import RealTimeLog from './real-time-log.vue'
const props = defineProps<{tabId: string}>()
</script>

<template>
  <LogSearchFilter v-if="props.tabId !== ''" :tabId="props.tabId" />
  <RealTimeLog v-if="props.tabId !== ''" :tabId="props.tabId" />
</template>

<style scoped></style>