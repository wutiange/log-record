<script setup lang="ts">
import { convertAndSortRecord, findAllSubstringIndices } from '../../../utils/strings';
import useLogStore, { type LogType } from '../../../stores/log';
import { onUnmounted, reactive, ref, watch } from 'vue';
import { searchTextToCommandsMap, handleSingleTextToSelected } from '@/utils/log';

const searchContent = ref('');
const logStore = useLogStore();
const filters = reactive({ isCaseSensitive: false });
const timer = ref<NodeJS.Timeout | null>(null)
const props = defineProps<{tabId: string}>()

const onSearch = () => {
  logStore.updateSearchFilterByTabId(props.tabId, {
    text: searchContent.value, 
    isCaseSensitive: filters.isCaseSensitive
  })
}

const onSwapCaseSensitivity = () => {
  filters.isCaseSensitive = !filters.isCaseSensitive
  onSearch()
}

const clearTimer = () => {
  if (timer.value) {
    clearTimeout(timer.value)
  }
}

watch(searchContent, (val) => {
  clearTimer()
  if (!val) {
    onSearch();
  } else {
    timer.value = setTimeout(onSearch, 500)
  }
});

onUnmounted(clearTimer)
</script>

<template>
  <div class="search-container">
    <a-input
      class="search"
      @pressEnter="onSearch"
      v-model:value="searchContent"
      placeholder="请输入搜索内容"
      allow-clear
    />
    <div
      :class="{
        'case-sensitivity-container': true,
        'case-sensitivity-container-selected': filters.isCaseSensitive,
      }"
      @click="onSwapCaseSensitivity"
    >
      <img
        src="../../../assets/images/case-sensitivity.svg"
        :class="{'case-sensitivity': true, 'selected-case-sensitivity': filters.isCaseSensitive}"
        alt=""
      />
    </div>
  </div>
</template>

<style>
.search-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 10px;
  gap: 10px;
  width: 50%;
}

.search {
  flex: 1;
  font-size: 18px;
}
.case-sensitivity-container {
  padding: 5px;
  border-radius: 5px;
  cursor: pointer;
  overflow: hidden;
}
.case-sensitivity-container-selected {
  background-color: rgb(51, 102, 102, 0.5);
}
.case-sensitivity {
  width: 25px;
  height: 25px;
  transform: translate(-100px);
  filter: drop-shadow(100px 0 0 #336666);
}
.selected-case-sensitivity {
  filter: drop-shadow(100px 0 0 #fff);
}
</style>
