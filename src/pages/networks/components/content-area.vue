<script setup lang="ts">
import useNetworkStore from '@/stores/network';

const networkStore = useNetworkStore();

const {url, createTime} = networkStore.currentSelectNetwork ?? {}

</script>

<template v-if="url">
  <div class="format-text">
    <div class="strip">
      <span class="label-item">请求地址：</span>
      <span>{{ url }}</span>
    </div>
    <div class="strip">
      <span class="label-item">开始时间：</span>
      <span>{{ createTime }}</span>
    </div>
  </div>
</template>
<style scoped>
.format-text {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: hidden;
}

.strip {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.label-item {
  width: 100px;
  flex-shrink: 0;
}
</style>