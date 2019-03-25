<template lang="pug">
  header
    .name
      nuxt-link(:to="{ name: 'index' }") Noriaki Yamada
    nav
      ul
        li
          nuxt-link(:to="{ name: 'index' }") home
        li
          nuxt-link(:to="{ name: 'about' }") about
        li
          nuxt-link(:to="{ name: 'product' }") product
</template>
<style lang="stylus" scoped>
header
  padding 50px 0

.name
  text-align center

  > a
    display inline-block
    border-top 1px solid #000
    border-bottom 1px solid #000

nav
  overflow hidden
  margin-top 10px

  a
    display block

ul
  display flex
  justify-content center
  align-items center
  margin 0
  padding 0
  list-style none

a
  text-decoration none
  padding 1em
  // background-color rgba(#fff, 0.5)
</style>
