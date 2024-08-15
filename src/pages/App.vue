<script setup lang="ts">
import NavBar from './components/nav-bar.vue';
import MenuBar from './components/menu-bar.vue';
import useLogStore from '../stores/log';
import useAppStore from '@/stores/app';
import { onMounted } from 'vue';

const logStore = useLogStore();
const appStore = useAppStore();


window.electronAPI.onGetLogMsg((msg) => {
  logStore.push(msg)
})



onMounted(() => {
  appStore.updateCheck()
})


</script>

<template>
  <div class="container">
    <NavBar />
    <div class="body">
      <MenuBar />
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
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
