<template>
  <div class="split-pane" @mouseup="onMouseUp" @mousemove="onMouseMove">
    <div class="pane" :style="{ width: leftWidth + 'px' }">
      <slot name="left"></slot>
    </div>
    <div class="divider" @mousedown="onMouseDown"></div>
    <div class="pane" :style="{ width: `calc(100% - ${leftWidth}px)` }">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'SplitPane',
  props: {
    initialLeftWidth: {
      type: Number,
      default: 200
    },
    minWidth: {
      type: Number,
      default: 100
    }
  },
  setup(props) {
    const leftWidth = ref(props.initialLeftWidth);
    const isDragging = ref(false);
    const startX = ref(0);
    const startWidth = ref(0);

    const onMouseDown = (e) => {
      isDragging.value = true;
      startX.value = e.clientX;
      startWidth.value = leftWidth.value;
      document.body.style.cursor = 'col-resize';
    };

    const onMouseUp = () => {
      isDragging.value = false;
      document.body.style.cursor = 'default';
    };

    const onMouseMove = (e) => {
      if (!isDragging.value) return;
      const dx = e.clientX - startX.value;
      const newLeftWidth = startWidth.value + dx;
      if (newLeftWidth > props.minWidth) {
        leftWidth.value = newLeftWidth;
      }
    };

    return {
      leftWidth,
      onMouseDown,
      onMouseUp,
      onMouseMove
    };
  }
};
</script>

<style scoped>
.split-pane {
  display: flex;
  width: 100%;
  height: 100%;
}

.pane {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background-mute);
}

.divider {
  width: 4px;
  background-color: var(--color-scroll);
  cursor: col-resize;
}

</style>
