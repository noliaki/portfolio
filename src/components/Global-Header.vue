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
    border-top 1px solid #2f3233
    border-bottom 1px solid #2f3233

nav
  overflow hidden
  margin-top 10px

  a
    position relative
    display block
    overflow hidden
    transition background-color 200ms linear

    &:hover
      background-color #f0f0f0

    &::before
      content ''
      display block
      position absolute
      width 100%
      height 100%
      top 0
      right 0
      bottom 0
      left 0
      transform scaleY(0)
      background-color #2f3233
      z-index -1
      transform-origin 50% 100%
      transition transform 200ms ease

    &.nuxt-link-exact-active
      color #fff
      &:hover
        background-color transparent
      &::before
        transform scaleY(1)


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
