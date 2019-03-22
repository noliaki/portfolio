<template lang="pug">
  header
    .inner
      nuxt-link(:to="{ name: 'index' }") Noriaki Yamada
      nav
        ul
          li
            nuxt-link(:to="{ name: 'about' }") about
</template>
<style lang="stylus" scoped>
.inner
  display flex
  align-items center

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
  padding 1em 0
  background-color rgba(#fff, 0.5)
</style>
