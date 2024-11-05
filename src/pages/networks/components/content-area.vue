<script setup lang="ts">
import dayjs from 'dayjs';
import { computed } from 'vue';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
const [messageApi, contextHolder] = message.useMessage();
const i18n = useI18n()
const props = defineProps(['csn']);

const reqBody = computed(() => {
  try {
    if (!props.csn.reqBody) {
      return null;
    }
    return JSON.parse(props.csn.reqBody);
  } catch (error) {
    console.warn('解析响应体失败', error, props.csn.reqBody);
    return props.csn.reqBody;
  }
});

const resBody = computed(() => {
  try {
    return JSON.parse(props.csn.resBody);
  } catch (error) {
    console.warn('解析响应体失败', error)
    return props.csn?.resBody ?? null
  }
});

const copyText = async (text: any) => {
  try {
    await navigator.clipboard.writeText(
      typeof text === 'object' ? JSON.stringify(text) : text,
    );
    messageApi.info(i18n.t('复制成功'));
  } catch (err) {
    messageApi.warning(i18n.t('复制失败'));
    console.error('无法复制文本: ', err);
  }
};
</script>

<template v-if="csn.url">
  <div class="format-text">
    <contextHolder />
    <div class="content-box">
      <div class="strip">
        <span class="label-item">{{ $t('请求地址：') }}</span>
        <span class="req-url">{{ csn.url }}</span>
      </div>
      <div class="strip">
        <span class="label-item">{{ $t('请求方法：') }}</span>
        <span class="req-url">{{ csn.method }}</span>
      </div>
      <div class="strip">
        <span class="label-item">{{ $t('请求时间：') }}</span>
        <span>{{ dayjs(csn.createTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
      </div>
      <div class="strip">
        <span class="label-item">{{ $t('请求头：') }}</span>
        <div class="headers-container" v-if="Object.keys(csn.reqHeaders ?? {}).length !== 0">
          <div class="row-container" v-for="(value, key) in csn.reqHeaders">
            <span class="column-text">{{ key }}</span>
            <span class="column-value-text">{{ value }}</span>
          </div>
        </div>
        <span v-else>{{ $t('空') }}</span>
      </div>
      <div class="strip">
        <span class="label-item">{{ $t('请求体：') }}</span>
        <div class="body-box" v-if="csn.reqBody">
          <pre v-if="typeof reqBody === 'string'" v-html="reqBody" />
          <vue-json-pretty v-else-if="csn.reqBody" :data="reqBody" :deep="2" :show-double-quotes="true" showLength
            show-icon :collapsed-on-click-brackets="true" :key="csn.id + 'requestBody'" />
          <span v-if="csn.reqBody" class="copy" @click="copyText(reqBody)">
            {{ $t('复制') }}
          </span>
        </div>
        <span v-else>{{ $t('空') }}</span>
      </div>
    </div>
    <div class="content-box" v-if="typeof csn.statusCode === 'number'">
      <template v-if="typeof csn.statusCode === 'number'">
        <div class="strip">
          <span class="label-item">{{ $t('响应时间：') }}</span>
          <span>{{ dayjs(csn.endTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
        </div>
        <div class="strip">
          <span class="label-item">{{ $t('响应状态：') }}</span>
          <span>{{ csn.statusCode }}</span>
        </div>
        <div class="strip">
          <span class="label-item">{{ $t('响应头：') }}</span>
          <div class="headers-container" v-if="Object.keys(csn.resHeaders ?? {}).length !== 0">
            <div class="row-container" v-for="(value, key) in csn.resHeaders">
              <span class="column-text">{{ key }}</span>
              <span class="column-value-text">{{ value }}</span>
            </div>
          </div>
          <span v-else>{{ $t('空') }}</span>
        </div>
        <div class="strip">
          <span class="label-item">{{ $t('响应体：') }}</span>
          <div class="body-box" v-if="resBody">
            <pre v-if="typeof resBody === 'string'" v-html="resBody" />
            <vue-json-pretty v-else-if="csn.resBody" :data="resBody" :deep="3" :show-double-quotes="true" showLength
              show-icon :collapsed-on-click-brackets="true" :key="csn.id + 'responseBody'" />
            <span v-if="csn.resBody" class="copy" @click="copyText(resBody)">
              {{ $t('复制') }}
            </span>
          </div>
          <span v-else>空</span>
        </div>
      </template>
    </div>
  </div>
</template>
<style scoped>
.format-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.content-box {
  gap: 10px;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
  padding: 15px;
  border-radius: var(--border-radius-large);
}

.strip {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  position: relative;
  gap: 10px
}

.label-item {
  width: 130px;
  flex-shrink: 0;
}

.headers-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid var(--color-scroll);
  border-radius: var(--border-radius-large);
}

.body-box {
  width: 100%;
  border: 1px solid var(--color-scroll);
  border-radius: var(--border-radius-large);
  padding: 10px;
}

.row-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 1px solid var(--color-scroll);
}

.row-container:nth-last-child(1) {
  border-bottom-width: 0px;
}

.column-text {
  border-right: 1px solid var(--color-scroll);
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
  background-color: var(--color-scroll);
}

.highlight {
  flex: 1;
  border-radius: var(--border-radius-default);
}

.copy {
  position: absolute;
  right: 10px;
  top: 10px;
  cursor: pointer;
}

.req-url {
  word-wrap: break-word;
  word-break: break-all;
}
</style>
