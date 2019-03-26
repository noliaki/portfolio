<template lang="pug">
  main
    article.content
      ul
        li.item(v-for="(item, index) in entries", :key="index")
          header.item__thumbnail
            img(:src="thumbnailSrc(index)", alt="")
          .item__body
            small {{ dateFormat(item.sys.createdAt) }}
            div
              em
                a(:href="item.fields.url", target="_blank", rel="noopener noreferer") {{ item.fields.title }}
            div
              discription(v-for="content in item.fields.description.content", :content="content")

</template>
<script>
import createClient from '~/plugins/contentful'
import discription from '~/components/Description'
import { mapState, mapMutations } from 'vuex'
import { mutationTypes } from '~/store/posts'

const noImagesLen = 8

export default {
  components: {
    discription
  },
  data() {
    return {
      startIndex: Math.floor(Math.random() * noImagesLen)
    }
  },
  computed: {
    ...mapState('posts', ['entries'])
  },
  async asyncData({ store }) {
    if (store.state.posts.entries.length > 0) {
      return
    }

    console.log('run async data')
    const client = createClient()
    const { items } = await client.getEntries()

    store.commit(`posts/${mutationTypes.setEntries}`, items)
  },
  methods: {
    ...mapMutations('posts', [mutationTypes.setEntries]),
    thumbnailSrc(index) {
      const n = ((this.startIndex + index) % noImagesLen) + 1
      return `/img/no-image-${n}.jpg`
    },
    dateFormat(dateString) {
      const date = new Date(dateString)
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    }
  }
}
</script>
<style lang="stylus" scoped>
ul
  display grid
  grid-template-columns repeat(auto-fill, minmax(200px, 1fr))
  grid-gap 20px
  list-style none
  margin 0
  padding 0

.item
  display flex
  flex-direction column
  background-color rgba(#fff, 0.8)

.item__thumbnail
  position relative
  flex-shrink 0
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

.item__body
  flex-grow 1
  padding 15px
</style>
