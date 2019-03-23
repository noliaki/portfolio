<template lang="pug">
  .wrapper
    globalHeader
    canvas-component
    nuxt(keep-alive)
</template>
<script>
import canvasComponent from '~/components/Canvas'
import globalHeader from '~/components/Global-Header'

export default {
  components: {
    globalHeader,
    canvasComponent
  }
}
</script>
