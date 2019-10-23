<template>
  <main>
    <article class="inner content about">
      <content-to-element
        v-for="(content, index) in entry.fields.description.content"
        :key="index"
        :content="content"
      ></content-to-element>
      <div>
        <p>@noliaki</p>
        <div class="sns">
          <div>
            <a
              href="https://twitter.com/noliaki"
              target="_blank"
              rel="noopener noreferer"
            >
              <img src="/img/logo-twitter.svg" alt="Twitter" />
            </a>
          </div>
          <div>
            <a
              href="https://github.com/noliaki"
              target="_blank"
              rel="noopener noreferer"
            >
              <img src="/img/logo-github.svg" alt="GitHub" />
            </a>
          </div>
        </div>
      </div>
    </article>
  </main>
</template>
<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import contentToElement from '~/components/ContentToElement'

export default Vue.extend({
  head: {
    title: 'about'
  },
  components: {
    contentToElement
  },
  computed: {
    ...mapGetters('about', ['entry'])
  }
})
</script>
