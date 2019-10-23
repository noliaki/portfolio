<template>
  <header class="global-header">
    <div class="global-header__name">
      <nuxt-link :to="{ name: 'index' }">Noriaki Yamada</nuxt-link>
    </div>
    <nav class="global-nav">
      <ul class="global-nav__list">
        <li class="global-nav__item">
          <nuxt-link :to="{ name: 'index' }">
            <span>home</span>
          </nuxt-link>
        </li>
        <li class="global-nav__item">
          <nuxt-link :to="{ name: 'about' }">
            <span>about</span>
          </nuxt-link>
        </li>
        <li class="global-nav__item">
          <nuxt-link :to="{ name: 'product' }">
            <span>product</span>
          </nuxt-link>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({})
</script>
