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
      startIndex: Math.floor(Math.random() * this.noImageLen)
    }
  },
  computed: {
    noImageLen() {
      return 8
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
      const n = ((this.startIndex + index) % this.noImageLen) + 1
      return `/img/no-image-${n}.jpg`
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

.item__thumbnail
  position relative
  &::before
    content ''
    display block
    padding-top 100%

  > img
    position absolute
    top 0
    left 0
    width 100%
    height 100%
</style>
