<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { SettingOutlined } from '@ant-design/icons-vue'
import { version } from '../../../package.json'
import useAppStore from '@/stores/app';
const router = useRouter()
const appStore = useAppStore()
const openUpdate = ref(false)
const funcs = reactive([
  // @ts-ignore
  { img: new URL('../../assets/images/log.svg', import.meta.url).href, path: '/log', text: '日志' },
  // @ts-ignore
  { img: new URL('../../assets/images/network.svg', import.meta.url).href, path: '/network', text: '网络' },
]);
const selectedObj = reactive<Record<string, boolean>>({
  '/log': true,
  '/network': false
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
  console.log(appStore.updateResult)
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
          <a-button @click="toggleDevTools" type="text">调试器（Alt + Shift + F12）</a-button>
        </p>
        <a-button @click="checkIsUpdate" type="text">检查更新</a-button>
        <p class="version" type="text">版本号：v{{ version }}<span class="have-update-text"
            v-if="appStore.updateResult.hasUpgrade">-->{{ appStore.updateResult.latestVersion ?? '' }}</span></p>
      </template>
      <a-badge :dot="appStore.updateResult.hasUpgrade">
        <SettingOutlined class="setting-icon" />
      </a-badge>
    </a-popover>
    <a-modal v-model:open="openUpdate" title="更新内容" ok-text="去下载" cancel-text="取消" @ok="onUpdate">
      <p class="dialog-version">最新版本号：v{{ appStore.updateResult.latestVersion }}</p>
      <div>
        更新内容：<p class="update-content">{{ appStore.updateResult?.releaseDetails?.body ?? '' }}</p>
      </div>
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
  font-size: 25px;
}

.icon {
  width: 25px;
  height: 25px;
  transform: translate(-100px);
  filter: drop-shadow(100px 0 0 #336666);
}

.icon-container {
  padding: 5px;
  cursor: pointer;
}

.selected-icon-container {
  background-color: rgba(51, 102, 102, 0.5);
  border-radius: 5px;
}

.selected-icon {
  filter: drop-shadow(100px 0 0 #fff);
}

.version {
  text-align: left;
  padding: 4px 15px;
}

p {
  margin-bottom: 0;
}

.have-update-text {
  color: red;
}

.update-content {
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-wrap: break-word;
  /* 兼容旧浏览器 */
}

.dialog-version {
  margin-top: 20px;
  margin-bottom: 5px;
}
</style>
