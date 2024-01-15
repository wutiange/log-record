<script setup lang="ts">
import NavBar from './components/nav-bar.vue';
import MenuBar from './components/menu-bar.vue';
import useLogStore from '../stores/log';
import useNetworkStore from '@/stores/network';

const logStore = useLogStore();
const networkStore = useNetworkStore();

window.electronAPI.onGetLogMsg((msg) => {
  logStore.push(msg)
})

window.electronAPI.onGetNetworkMsg((msg: any) => {
  console.log("关于网络的信息收取", msg)
  networkStore.unshift(msg)
})


</script>

<template>
  <div class="container">
    <NavBar />
    <div class="body">
      <MenuBar />
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  color: #999999;
  flex: 1;
  height: 0px;
}
.body {
  display: flex;
  flex-direction: row;
  flex: 1;
  height: 0;
}
</style>
