<script setup lang="ts">
import CaseSensitivity from '@/assets/images/case-sensitivity.vue';
import useNetworkStore from '@/stores/network';
const networkStore = useNetworkStore()

</script>
<template>
  <div class="search-container">
    <a-textarea class="search-box" v-model:value="networkStore.searchFilter.text" :placeholder="$t('请输入路径或 url')"
      auto-size />
    <a-tooltip>
      <template #title>{{ $t('忽略大小写') }}</template>
      <div :class="{
        'case-sensitivity-container': true,
        'case-sensitivity-container-selected': networkStore.searchFilter.isCaseSensitive,
      }" @click="networkStore.setSearchFilter({ isCaseSensitive: !networkStore.searchFilter.isCaseSensitive })">
        <CaseSensitivity class="custom-icon" />
      </div>
    </a-tooltip>
  </div>
</template>
<style scoped>
.search-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  margin: 10px;
  width: 100%;
}

:deep(.search-box) {
  width: 60%;
  line-height: 25px;
  font-family: "新宋体 Console";
  background-color: var(--color-background);
  border-color: var(--color-border);
  color: var(--color-text);
}

:deep(.search-box::placeholder) {
  color: var(--color-border);
}

.search-box:focus {
  border-color: var(--color-main);
}

.case-sensitivity-container {
  height: 32px;
  color: #336666;
}

.case-sensitivity-container-selected {
  color: var(--color-background);
  background-color: rgb(51, 102, 102, 0.5);
}

.custom-icon {
  width: 22px;
  height: 22px;
  box-sizing: content-box;
  outline: none;
}
</style>