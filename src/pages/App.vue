<script setup lang="ts">
import NavBar from './components/nav-bar.vue';
import MenuBar from './components/menu-bar.vue';
import useLogStore from '../stores/log';

// const logStore = useLogStore()

(window as any).electronAPI.onGetLogMsg((msg: any) => {
  console.log(msg)
  // logStore.push(msg)
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
  min-width: 1000px;
  flex: 1;
  height: 0;
}
.body {
  display: flex;
  flex-direction: row;
  flex: 1;
  height: 0;
}
</style>
