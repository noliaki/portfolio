<template lang="pug">
  main
    article.content
      ul.product__list
        li.product__item(v-for="(item, index) in entries", :key="index")
          .product__thumbnail
            img(:src="thumbnailSrc(index)", alt="")
          .product__body
            small {{ dateFormat(item.sys.createdAt) }}
            .product__name
              em
                a(:href="item.fields.url", target="_blank", rel="noopener noreferer") {{ item.fields.title }}
            .product__description
              discription(v-for="content in item.fields.description.content.slice(0, 1)", :content="content")

</template>
<script>
import discription from '~/components/Description'
import { mapGetters } from 'vuex'

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
    ...mapGetters('product', ['entries'])
  },
  methods: {
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
