<script setup lang="ts">
import useNetworkStore from '@/stores/network';
import { storeToRefs } from 'pinia';
import dayjs from 'dayjs'

const networkStore = useNetworkStore();

const { currentSelectNetwork: csn } = storeToRefs(networkStore)

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
      <highlightjs v-if="csn.reqBody" autodetect :code="csn.reqBody + ''" />
      <span v-else>空</span>
    </div>
    <div class="br" />
    <template v-if="csn.statusCode">
      <div class="strip">
        <span class="label-item">响应时间：</span>
        <span>{{ csn.endTime }}</span>
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
        <highlightjs v-if="csn.resBody" autodetect :code="csn.resBody + ''" />
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
  flex: 1;
  border-right: 1px solid #eee;
  padding: 8px 10px;
  align-self: stretch;
}

.column-value-text {
  flex: 2;
  padding: 8px 10px;
}

.br {
  width: 100%;
  height: 2px;
  background-color: #ccc;
}
</style>