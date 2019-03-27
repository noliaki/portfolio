<template lang="pug">
  header.global-header
    .global-header__name
      nuxt-link(:to="{ name: 'index' }") Noriaki Yamada
    nav.global-nav
      ul.global-nav__list
        li.global-nav__item
          nuxt-link(:to="{ name: 'index' }")
            span home
        li.global-nav__item
          nuxt-link(:to="{ name: 'about' }")
            span about
        li.global-nav__item
          nuxt-link(:to="{ name: 'product' }")
            span product
</template>
