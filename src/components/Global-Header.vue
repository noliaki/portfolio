<template lang="pug">
  header
    .inner
      nuxt-link(:to="{ name: 'index' }") Noriaki Yamada
      nav
        ul
          li
            nuxt-link(:to="{ name: 'about' }") about
          li
            nuxt-link(:to="{ name: 'product' }") product
</template>
<style lang="stylus" scoped>
.inner
  display flex
  align-items center
  transition background-color 200ms linear

nav
  margin-left auto

ul
  display flex
  align-items center
  margin 0
  padding 0
  list-style none

a
  text-decoration none
  padding 1em
  // background-color rgba(#fff, 0.5)
</style>
