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
<style lang="stylus">
html
  font-family serif

.inner
  max-width 700px
  margin 0 auto

a
  color #000
</style>
