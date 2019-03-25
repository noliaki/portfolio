<template lang="pug">
  .wrapper
    canvas-component
    globalHeader
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
