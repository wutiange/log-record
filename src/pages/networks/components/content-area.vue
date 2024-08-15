<script setup lang="ts">
import dayjs from 'dayjs'
import { computed } from 'vue';
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { message } from 'ant-design-vue';
const [messageApi, contextHolder] = message.useMessage();


const props = defineProps(['csn'])

const reqBody = computed(() => {
  try {
    return JSON.parse(props.csn.reqBody)
  } catch (error) {
    console.warn('解析响应体失败', error)
    return props.csn.value.reqBody
  }
})

const resBody = computed(() => {
  try {
    return JSON.parse(props.csn.resBody)
  } catch (error) {
    console.warn('解析响应体失败', error)
    return props.csn.resBody
  }
})

const copyText = async (text: any) => {
  try {
    await navigator.clipboard.writeText(typeof text === 'object' ? JSON.stringify(text) : text);
    messageApi.info('复制成功');
  } catch (err) {
    messageApi.warning('复制失败');
    console.error('无法复制文本: ', err);
  }
};

</script>

<template v-if="url">
  <div class="format-text">
    <contextHolder />
    <div class="strip">
      <span class="label-item">请求地址：</span>
      <span class="req-url">{{ csn.url }}</span>
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
      <vue-json-pretty v-if="csn.reqBody" :data="reqBody" :deep="2" :show-double-quotes="true" showLength show-icon
        :collapsed-on-click-brackets="true" :key="csn.id + 'requestBody'" />
      <span v-else>空</span>
      <span v-if="csn.reqBody" class="copy" @click="copyText(reqBody)">复制</span>
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
        <vue-json-pretty v-if="csn.resBody" :data="resBody" :deep="3" :show-double-quotes="true" showLength show-icon
          :collapsed-on-click-brackets="true" :key="csn.id + 'responseBody'" />
        <span v-else>空</span>
        <span v-if="csn.resBody" class="copy" @click="copyText(resBody)">复制</span>
      </div>
    </template>
  </div>
</template>
<style scoped>
.format-text {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: black;
  flex: 1;
}

.strip {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  position: relative;
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
  flex: 3;
  font-weight: 500;
  flex-shrink: 0;
}

.column-value-text {
  padding: 8px 10px;
  flex: 7;
  word-wrap: break-word;
  word-break: break-all;
}

.br {
  width: 100%;
  height: 1px;
  background-color: #ccc;
}

.highlight {
  flex: 1;
  border-radius: 5px;
}

.copy {
  position: absolute;
  right: 0;
  top: 0;
  cursor: pointer;
}

.req-url {
  word-wrap: break-word;
  word-break: break-all;
}
</style>