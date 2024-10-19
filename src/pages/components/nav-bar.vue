<script setup lang="ts">
const platform = window.electronAPI.platform
</script>

<template>
  <div class="nav-bar-container">
    <img v-if="platform !== 'darwin'" src="../../assets/logo.svg" class="logo" alt="" />
    <span class="title">{{ $t('日志系统') }}</span>
  </div>
</template>

<style scoped>
.nav-bar-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 2px solid #3366661a;
  height: 40px;
  -webkit-app-region: drag;
}

.logo {
  height: 25px;
  margin-left: 10px;
}

.title {
  font-size: 18px;
  margin: 0 auto;
  font-weight: bold;
  color: #555;
}
</style>