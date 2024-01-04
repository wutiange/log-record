<script setup lang="ts">
import NavBar from './components/nav-bar.vue';
import MenuBar from './components/menu-bar.vue';
import useLogStore from '../stores/log';

const logStore = useLogStore();
window.electronAPI.onGetLogMsg((msg) => {
  console.log(msg)
  logStore.push(msg)
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
}
.body {
  display: flex;
  flex-direction: row;
  flex: 1;
}
</style>
