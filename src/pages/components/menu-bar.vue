<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { CheckCircleOutlined, SettingOutlined } from '@ant-design/icons-vue';
import { version } from '../../../package.json';
import useAppStore from '@/stores/app';
import { useI18n } from 'vue-i18n';


const router = useRouter();
const appStore = useAppStore();
const openUpdate = ref(false);
const isShowConnect = ref(false);
const i18n = useI18n();
const phones = ref<{ model: string; id: string, isConnect: boolean }[]>([]);
const ip = ref('');
const funcs = reactive([
  // @ts-ignore
  {
    img: new URL('../../assets/images/log.svg', import.meta.url).href,
    path: '/log',
    text: i18n.t('日志'),
  },
  // @ts-ignore
  {
    img: new URL('../../assets/images/network.svg', import.meta.url).href,
    path: '/network',
    text: i18n.t('网络'),
  },
]);
const selectedObj = reactive<Record<string, boolean>>({
  '/log': true,
  '/network': false,
});

window.electronAPI.onScanPhone((model, id) => {
  if (
    phones.value.find((item) => `${item.model}-${item.id}` === `${model}-${id}`)
  ) {
    onConnect(model, id)
    return;
  }
  phones.value.push({ model, id, isConnect: false });
});

onMounted(async () => {
  const tempIp = await window.electronAPI.getIPAddress();
  ip.value = tempIp;
  window.electronAPI.startScanPhone();
});

const onSwapFunc = (path: string) => {
  const lastPath = router.currentRoute.value.path;
  selectedObj[lastPath] = false;
  selectedObj[path] = true;
  router.push(path);
};

const toggleDevTools = () => {
  window.electronAPI.toggleDevTools();
};

const checkIsUpdate = async () => {
  await appStore.updateCheck();
  if (appStore.updateResult?.hasUpgrade) {
    openUpdate.value = true;
  }
};

watch(
  () => appStore.updateResult.hasUpgrade,
  () => {
    if (appStore.updateResult.hasUpgrade) {
      openUpdate.value = true;
    }
  },
);

const updateContent = computed(() => {
  const body = appStore.updateResult?.releaseDetails?.body ?? '';
  try {
    const bodyObj = JSON.parse(body);
    return bodyObj[i18n.locale.value].join('\n');
  } catch (error) {
    console.warn('在得到更新内容的地方出现了错误---', error);
    return body;
  }
});

const latestVersion = computed(() => {
  return appStore.updateResult?.latestVersion ?? '';
});

const onUpdate = () => {
  if (!appStore.updateResult?.releaseDetails?.html_url) {
    return;
  }
  window.electronAPI.openUrl(appStore.updateResult.releaseDetails.html_url);
};

const onConnectIns = () => {
  isShowConnect.value = true;
};

const onReject = (model: string, id: string) => {
  const itemPhoneIndex = phones.value.findIndex((item) => `${item.model}-${item.id}` === `${model}-${id}`)
  phones.value.splice(itemPhoneIndex, 1)
  window.electronAPI.connectPhone(model, id, false);
};

const onConnect = (model: string, id: string) => {
  const itemPhone = phones.value.find((item) => `${item.model}-${item.id}` === `${model}-${id}`)
  itemPhone.isConnect = true
  window.electronAPI.connectPhone(model, id, true);
};
</script>

<template>
  <div class="menu-bar-container">
    <template v-for="func in funcs" v-bind:key="func.img">
      <a-tooltip placement="right" color="#336666">
        <template #title>
          <span>{{ func.text }}</span>
        </template>
        <div :class="{
          'icon-container': true,
          'selected-icon-container': selectedObj[func.path],
        }" @click="() => onSwapFunc(func.path)">
          <img :src="func.img" alt="" :class="{ icon: true, 'selected-icon': selectedObj[func.path] }" />
        </div>
      </a-tooltip>
    </template>
    <div ref="popover" class="setting-box">
      <a-popover :getPopupContainer="() => $refs.popover" :arrowPointAtCenter="true" :arrow="false" trigger="click"
        placement="rightTop">
        <template #content>
          <p>
            <a-button class="popover-item" @click="toggleDevTools" type="text">
              {{ $t('调试器（Alt + Shift + F12）') }}
            </a-button>
          </p>
          <p>
            <a-button class="popover-item" @click="onConnectIns" type="text">
              {{ $t('连接说明') }}
            </a-button>
          </p>
          <a-button class="popover-item" @click="checkIsUpdate" type="text">
            {{ $t('检查更新') }}
          </a-button>
          <p class="version" type="text">
            {{ $t('版本号：v{version}', { version }) }}
            <span class="have-update-text" v-if="appStore.updateResult.hasUpgrade">
              -->{{ appStore.updateResult.latestVersion ?? '' }}
            </span>
          </p>
        </template>
        <a-badge :dot="appStore.updateResult.hasUpgrade">
          <SettingOutlined class="setting-icon" />
        </a-badge>
      </a-popover>
    </div>
    <div ref="updateContentTip" class="update-content-tip">
      <a-modal :getContainer="() => $refs.updateContentTip" v-model:open="openUpdate" :title="$t('更新内容')"
        :ok-text="$t('去下载')" :cancel-text="$t('取消')" @ok="onUpdate">
        <p class="dialog-version">
          {{ $t('最新版本号：v{latestVersion}', { latestVersion }) }}
        </p>
        <div>
          {{ $t('更新内容：') }}
          <p class="update-content">{{ updateContent }}</p>
        </div>
      </a-modal>
    </div>

    <div ref="contentTip" class="tip-box">
      <a-modal :getContainer="() => $refs.contentTip" v-model:open="isShowConnect" :title="phones.length > 0
        ? $t('检测到附近有可以连接的手机，点击建立连接')
        : $t('连接说明')
        " @ok="isShowConnect = false" :footer="null">
        <div v-if="phones.length > 0" class="bonjour-box">
          <div class="phone-list" v-for="{ model, id, isConnect } in phones" :key="`${model}-${id}`">
            <span class="model-text">{{ model }} ({{ id ?? '--' }})</span>
            <div class="phone-op-box" v-if="!isConnect">
              <a-button type="primary" danger ghost @click="() => onReject(model, id)">{{ $t('拒绝') }}</a-button>
              <a-button type="primary" @click="() => onConnect(model, id)">{{ $t('连接') }}</a-button>
            </div>
            <CheckCircleOutlined two-tone-color="#52c41a" v-else />
          </div>
        </div>
        <template v-else>
          <p>
            {{ $t('1. 请在需要调试的手机上写上这个 IP 地址：') }}
            <span class="ip">{{ ip }}</span>
          </p>
          <p>
            {{ $t('2. 请保证你调试的手机和这个 ip 地址处于同一个局域网；') }}
          </p>
          <p>
            {{
              $t(
                '3. 如果还是不行，请检查你手机/电脑是否开了代理，如果有请先关闭。',
              )
            }}
          </p>
        </template>
      </a-modal>
    </div>
  </div>
</template>

<style scoped>
.menu-bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 2px solid rgba(51, 102, 102, 0.1);
  padding: 5px;
  gap: 5px;
}

.setting-box {
  margin-top: auto;
  margin-bottom: 10px;
}

.setting-icon {
  font-size: 20px;
  cursor: pointer;
  color: var(--color-main);
}

.icon {
  width: 20px;
  height: 20px;
  transform: translate(-100px);
  filter: drop-shadow(100px 0 0 var(--color-main));
}

.icon-container {
  padding: 5px;
  cursor: pointer;
  display: flex;
}

.selected-icon-container {
  background-color: rgba(51, 102, 102, 0.5);
  border-radius: var(--border-radius-default);
}

.selected-icon {
  filter: drop-shadow(100px 0 0 var(--color-background));
}

.version {
  text-align: left;
  padding: 4px 15px;
  color: var(--color-text);
}

p {
  margin-bottom: 0;
}

.have-update-text {
  color: var(--color-error);
}

.update-content {
  margin-top: 10px;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-wrap: break-word;
  /* 兼容旧浏览器 */
}

.dialog-version {
  margin-top: 20px;
  margin-bottom: 5px;
}

.ip {
  font-weight: bold;
}

:deep(.ant-popover-inner) {
  background-color: var(--color-background-soft);
}

:deep(.ant-popover-arrow::after) {
  background-color: var(--color-background-soft);
}

:deep(.ant-popover-arrow::before) {
  background-color: var(--color-background-soft);
}

.popover-item {
  color: var(--color-text);
}

.popover-item:hover {
  color: var(--color-main);
}

:deep(.ant-modal-content) {
  background-color: var(--color-background-soft);

  .ant-modal-title {
    color: red;
  }
}

:deep(.ant-modal-title) {
  background-color: var(--color-background-soft);
  color: var(--color-text);
}

:deep(.ant-input) {
  background-color: var(--color-background);
  border-color: var(--color-border);
  color: var(--color-text);
}

:deep(.ant-input::placeholder) {
  color: var(--color-border);
}

:deep(.ant-btn-default) {
  background-color: var(--color-background);
  border-color: var(--color-border);
  color: var(--color-text);
}

:deep(.ant-btn-primary) {
  background-color: var(--color-main);
  color: var(--color-background);
}

.tip-box p {
  color: var(--color-text);
}

.update-content-tip p,
div {
  color: var(--color-text);
}

.bonjour-box {
  margin-top: 20px;
}

.phone-list {
  margin-top: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  height: 40px;
  gap: 10px;
}

.model-text {
  flex: 1;
  /*强制文本在一行内显示*/
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.phone-op-box {
  display: flex;
  gap: 5px;
}

.phone-list :deep(.anticon) {
  font-size: 24px;
}
</style>
