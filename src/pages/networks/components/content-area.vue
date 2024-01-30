<script setup lang="ts">
import useNetworkStore from '@/stores/network';
import { storeToRefs } from 'pinia';
import dayjs from 'dayjs'
import { computed, watch } from 'vue';

const networkStore = useNetworkStore();

const { currentSelectNetwork: csn } = storeToRefs(networkStore)

const getBody = (source: string, headers: Record<string, any> = {}) => {
  const headersArr = Object.entries(headers)
  for (let i = 0; i < headersArr.length; i++) {
    const [key, value] = headersArr[i];
    const lowerKey = key.toLocaleLowerCase()
    if (lowerKey === 'content-type' && value.includes('application/json')) {
      return JSON.stringify(JSON.parse(source), null, 2)
    }
  }
  return source
}

const reqBody = computed(() => {
  return getBody(csn.value.reqBody, csn.value.reqHeaders)
})

const resBody = computed(() => {
  return getBody(csn.value.resBody, csn.value.resHeaders)
})

</script>

<template v-if="url">
  <div class="format-text">
    <div class="strip">
      <span class="label-item">请求地址：</span>
      <span>{{ csn.url }}</span>
    </div>
    <div class="strip">
      <span class="label-item">请求时间：</span>
      <span>{{ dayjs(csn.createTime).format("YYYY-MM-DD HH:mm:ss") }}</span>
    </div>
    <div class="strip">
      <span class="label-item">请求头：</span>
      <div class="headers-container" v-if="Object.keys(csn.reqHeaders ?? {}).length !== 0">
        <div class="row-container" v-for="(value, key) in csn.reqHeaders">
          <span class="column-text">{{ key }}</span>
          <span class="column-value-text">{{ value }}</span>
        </div>
      </div>
      <span v-else>空</span>
    </div>
    <div class="strip">
      <span class="label-item">请求体：</span>
      <highlightjs v-if="csn.reqBody" autodetect :code="reqBody" />
      <span v-else>空</span>
    </div>
    <div class="br" />
    <template v-if="csn.statusCode">
      <div class="strip">
        <span class="label-item">响应时间：</span>
        <span>{{ dayjs(csn.endTime).format("YYYY-MM-DD HH:mm:ss") }}</span>
      </div>
      <div class="strip">
        <span class="label-item">响应状态：</span>
        <span>{{ csn.statusCode }}</span>
      </div>
      <div class="strip">
        <span class="label-item">响应头：</span>
        <div class="headers-container" v-if="Object.keys(csn.resHeaders ?? {}).length !== 0">
          <div class="row-container" v-for="(value, key) in csn.resHeaders">
            <span class="column-text">{{ key }}</span>
            <span class="column-value-text">{{ value }}</span>
          </div>
        </div>
        <span v-else>空</span>
      </div>
      <div class="strip">
        <span class="label-item">响应体：</span>
        <highlightjs v-if="csn.resBody" class="highlight" autodetect :code="resBody" />
        <span v-else>空</span>
      </div>
    </template>
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

.headers-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid #eee;
  overflow: hidden;
  border-bottom: 1px solid #00000000;
}

.row-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.column-text {
  border-right: 1px solid #eee;
  padding: 8px 10px;
  align-self: stretch;
  width: 30%;
  font-weight: 500;
}

.column-value-text {
  padding: 8px 10px;
  width: 70%;
  word-wrap: break-word;
}

.br {
  width: 100%;
  height: 2px;
  background-color: #ccc;
}

.highlight {
  flex: 1;
  border-radius: 5px;
}
</style>