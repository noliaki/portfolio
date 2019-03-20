<template lang="pug">
  .wrapper
    canvas-component
    nuxt(keep-alive)
</template>
<script>
import canvasComponent from '~/components/Canvas'

export default {
  components: {
    canvasComponent
  }
}
</script>
