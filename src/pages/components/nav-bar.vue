<script setup lang="ts">
</script>

<template>
  <div class="nav-bar-container">
    <img src="../../assets/logo.svg" class="logo" alt="" />
    <span class="title">日志系统</span>
  </div>
</template>

<style scoped>
.nav-bar-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 2px solid #3366661a;
  height: 50px;
}

.logo {
  height: 35px;
  margin-left: 15px;
}

.title {
  font-size: 20px;
  margin: 0 auto;
  font-weight: bold;
  color: #555;
}
</style>