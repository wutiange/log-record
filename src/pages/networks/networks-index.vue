<script setup lang="ts">
import RealTimeNetwork from './components/real-time-network.vue';
import NetworkSearchFilter from './components/network-search-filter.vue';
</script>

<template>
  <div class="network-container">
    <NetworkSearchFilter />
    <RealTimeNetwork class="real-time" />
  </div>
</template>

<style scoped>
.network-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.real-time {
  flex: 1;
  overflow: hidden;
}
</style>