<template lang="pug">
  main
    article.content
      ul
        li.item(v-for="(item, index) in items", :key="index")
          a(:href="item.fields.url", target="_blank", rel="noopener noreferer")
            .item__thumbnail
              img(:src="thumbnailSrc(index)", alt="")
            small {{ item.sys.createdAt }}
            h2 {{ item.fields.title }}
</template>
<script>
import createClient from '~/plugins/contentful'

export default {
  data() {
    return {
      startIndex: Math.floor(Math.random() * 5)
    }
  },
  async asyncData() {
    const client = createClient()
    const { items } = await client.getEntries()

    return {
      items
    }
  },
  methods: {
    thumbnailSrc(index) {
      return `/img/no-image-${((this.startIndex + index) % 8) + 1}.jpg`
    }
  }
}
</script>
<style lang="stylus" scoped>
ul
  display grid
  grid-template-columns repeat(auto-fill, minmax(250px, 1fr))
  grid-gap 20px
  list-style none

.item
  background-color rgba(#fff, 0.8)
</style>
