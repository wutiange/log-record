<script setup lang="ts">
import type { ColorOrTextType } from '@/utils/log';
import { getColorAndText } from '@/utils/log';
import useLogStore from '@/stores/log';
import { computed } from 'vue';
import dayjs from 'dayjs'
const logStore = useLogStore()
const currentLog = computed(() => {
  return logStore.currentItem?.formatData?.map((e) => {
    if (e && typeof e === 'object') {
      return JSON.stringify(e, null, 2)
    }
    return e
  }) ?? []
})

const colorAndText = computed<ColorOrTextType>(() => {
  if (logStore.currentItem) {
    return getColorAndText(logStore.currentItem.level)
  }
  return {color: 'processing', text: '日志'}
})

const showLogTime = computed(() => {
  if (logStore.currentItem?.createTime) {
    return dayjs(logStore.currentItem?.createTime).format("YYYY-MM-DD HH:mm:ss")
  }
})

</script>
<template v-if="currentItem !== null">
  <div class="format-text">
    <div class="strip">
      <span class="label-item">日志等级：</span>
      <a-tag :color="colorAndText.color">{{ colorAndText.text }}</a-tag>
    </div>
    <div class="strip">
      <span class="label-item">时间：</span>
      <span>{{ showLogTime }}</span>
    </div>
    <div class="strip">
      <span class="label-item">环境：</span>
      <span>{{ logStore.currentItem?.env }}</span>
    </div>
    <div class="strip" v-if="logStore.currentItem?.system">
      <span class="label-item">系统：</span>
      <span>{{ logStore.currentItem?.system }}</span>
    </div>
    <div class="strip" v-if="logStore.currentItem?.brand && logStore.currentItem?.model">
      <span class="label-item">手机型号：</span>
      <span>{{ logStore.currentItem?.brand }} {{ logStore.currentItem?.model }}</span>
    </div>
    <div class="strip" v-if="logStore.currentItem?.version">
      <span class="label-item">版本号：</span>
      <span>{{ logStore.currentItem?.version }}</span>
    </div>
    <div class="strip-detail">
      <span class="label-item">详细信息：</span>
      <p class="format-p">
        <span v-for="log in currentLog" :key="log">
          <highlightjs autodetect :code="log + ''" />
        </span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.label {
  font-size: 20px;
  margin-top: 30px;
  margin-bottom: 10px;
}

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

.format-p {
  margin: 0;
  overflow: scroll;
}

.format-p::-webkit-scrollbar {
  display: none;
}

.strip-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: scroll;
}

.strip-detail::-webkit-scrollbar {
  display: none;
}
</style>