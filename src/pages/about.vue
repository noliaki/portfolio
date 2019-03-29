<template lang="pug">
  main
    article.inner.content.about
      content-to-element(
        v-for="(content, index) in entry.fields.description.content",
        :content="content",
        :key="index"
      )
      div
        p @noliaki
        .sns
          div
            a(href="https://twitter.com/noliaki", target="_blank", rel="noopener noreferer")
              img(src="/img/logo-twitter.svg", alt="Twitter")
          div
            a(href="https://github.com/noliaki", target="_blank", rel="noopener noreferer")
              img(src="/img/logo-github.svg", alt="GitHub")
</template>
<script>
import { mapGetters } from 'vuex'
import contentToElement from '~/components/ContentToElement'

export default {
  head: {
    title: 'about'
  },
  components: {
    contentToElement
  },
  computed: {
    ...mapGetters('about', ['entry'])
  }
}
</script>
