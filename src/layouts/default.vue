<template>
  <div class="wrapper">
    <canvas-component></canvas-component>
    <globalHeader></globalHeader>
    <nuxt keep-alive></nuxt>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import canvasComponent from '~/components/Canvas.vue'
import globalHeader from '~/components/Global-Header.vue'
import eventBus from '~/helper/event-bus'
import debounce from '~/helper/debounce'

export default Vue.extend({
  components: {
    globalHeader,
    canvasComponent
  },
  mounted(): void {
    window.addEventListener(
      'resize',
      debounce((): void => {
        eventBus.$emit('winResize', window.innerWidth, window.innerHeight)
      }, 300),
      false
    )
  }
})
</script>
