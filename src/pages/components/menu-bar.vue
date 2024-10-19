<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { SettingOutlined } from '@ant-design/icons-vue'
import { version } from '../../../package.json'
import useAppStore from '@/stores/app';
import { useI18n } from 'vue-i18n';
const router = useRouter()
const appStore = useAppStore()
const openUpdate = ref(false)
const isShowConnect = ref(false)
const i18n = useI18n()
const ip = ref('')
const funcs = reactive([
  // @ts-ignore
  { img: new URL('../../assets/images/log.svg', import.meta.url).href, path: '/log', text: i18n.t('日志') },
  // @ts-ignore
  { img: new URL('../../assets/images/network.svg', import.meta.url).href, path: '/network', text: i18n.t('网络') },
]);
const selectedObj = reactive<Record<string, boolean>>({
  '/log': true,
  '/network': false
})

onMounted(async () => {
  const tempIp = await window.electronAPI.getIPAddress()
  ip.value = tempIp
})

const onSwapFunc = (path: string) => {
  const lastPath = router.currentRoute.value.path
  selectedObj[lastPath] = false
  selectedObj[path] = true
  router.push(path)
};

const toggleDevTools = () => {
  window.electronAPI.toggleDevTools()
}

const checkIsUpdate = async () => {
  await appStore.updateCheck()
  if (appStore.updateResult?.hasUpgrade) {
    openUpdate.value = true
  }
}

watch(() => appStore.updateResult.hasUpgrade, () => {
  if (appStore.updateResult.hasUpgrade) {
    openUpdate.value = true
  }
})

const onUpdate = () => {
  if (!appStore.updateResult?.releaseDetails?.html_url) {
    return
  }
  window.electronAPI.openUrl(appStore.updateResult.releaseDetails.html_url)
}

const onConnectIns = () => {
  isShowConnect.value = true
}

</script>

<template>
  <div class="menu-bar-container">
    <template v-for="func in funcs" v-bind:key="func.img">
      <a-tooltip placement="right" color="#336666">
        <template #title>
          <span>{{ func.text }}</span>
        </template>
        <div :class="{ 'icon-container': true, 'selected-icon-container': selectedObj[func.path] }"
          @click="() => onSwapFunc(func.path)">
          <img :src="func.img" alt="" :class="{ icon: true, 'selected-icon': selectedObj[func.path] }" />
        </div>
      </a-tooltip>
    </template>
    <a-popover :arrow="false" class="setting-box" trigger="click" placement="rightTop">
      <template #content>
        <p>
          <a-button @click="toggleDevTools" type="text">{{ $t('调试器（Alt + Shift + F12）') }}</a-button>
        </p>
        <p>
          <a-button @click="onConnectIns" type="text">{{ $t('连接说明') }}</a-button>
        </p>
        <a-button @click="checkIsUpdate" type="text">{{ $t('检查更新') }}</a-button>
        <p class="version" type="text">{{ $t('版本号：v{version}', { version }) }}<span class="have-update-text"
            v-if="appStore.updateResult.hasUpgrade">-->{{ appStore.updateResult.latestVersion ?? '' }}</span></p>
      </template>
      <a-badge :dot="appStore.updateResult.hasUpgrade">
        <SettingOutlined class="setting-icon" />
      </a-badge>
    </a-popover>
    <a-modal v-model:open="openUpdate" :title="$t('更新内容')" :ok-text="$t('去下载')" :cancel-text="$t('取消')" @ok="onUpdate">
      <p class="dialog-version">{{ $t('最新版本号：v{latestVersion}', { latestVersion: appStore.updateResult.latestVersion })
        }}
      </p>
      <div>
        {{ $t('更新内容：') }}<p class="update-content">{{ appStore.updateResult?.releaseDetails?.body ?? '' }}</p>
      </div>
    </a-modal>
    <a-modal v-model:open="isShowConnect" :title="$t('连接说明')" :ok-text="$t('知道了')" :cancel-text="$t('取消')"
      @ok="isShowConnect = false">
      <p>{{ $t('1. 请在需要调试的手机上写上这个 IP 地址：') }}<span class="ip">{{ ip }}</span></p>
      <p>{{ $t('2. 请保证你调试的手机和这个 ip 地址处于同一个局域网；') }}</p>
      <p>{{ $t('3. 如果还是不行，请检查你手机/电脑是否开了代理，如果有请先关闭。') }}</p>
    </a-modal>
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
</style>
