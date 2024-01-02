<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter()
const funcs = reactive([
  { img: 'src/assets/images/log.svg', path: '/log' },
  { img: 'src/assets/images/network.svg', path: '/network' },
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
</script>

<template>
  <div class="menu-bar-container">
    <div
      v-for="func in funcs"
      v-bind:key="func.img"
      :class="{ 'icon-container': true, 'selected-icon-container': selectedObj[func.path] }"
      @click="() => onSwapFunc(func.path)"
    >
      <img :src="func.img" alt="" :class="{icon: true, 'selected-icon': selectedObj[func.path]}" />
    </div>
  </div>
</template>

<style scoped>
.menu-bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
  border-right: 2px solid rgba(51, 102, 102, 0.1);
  padding: 5px;
  padding-top: 10px;
  gap: 10px;
}

.icon {
  width: 35px;
  height: 35px;
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
</style>
