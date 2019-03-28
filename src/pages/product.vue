<template lang="pug">
  main
    article.content
      ul.product__list
        li.product__item(v-for="(item, index) in products", :key="index")
          .product__thumbnail
            img(:src="thumbnailSrc(index)", :alt="item.fields.title")
          .product__body
            small {{ dateFormat(item.sys.createdAt) }}
            .product__name
              em
                a(
                  :href="item.fields.url",
                  target="_blank",
                  rel="noopener noreferer"
                ) {{ item.fields.title }}
            .product__description
              discription(
                v-for="(content, index) in item.fields.description.content.slice(0, 1)",
                :content="content",
                :key="index"
              )

</template>
<script>
import discription from '~/components/Description'
import { mapGetters } from 'vuex'

export default {
  head: {
    title: 'product'
  },
  components: {
    discription
  },
  data() {
    return {
      random: Math.random()
    }
  },
  computed: {
    ...mapGetters('product', {
      products: 'entries'
    }),
    ...mapGetters('no-image', {
      noImages: 'entries'
    }),
    startIndex() {
      return Math.floor(this.random * this.noImages.length)
    }
  },
  methods: {
    thumbnailSrc(index) {
      const n = (this.startIndex + index) % this.noImages.length
      return this.noImages[n].fields.image.fields.file.url
    },
    dateFormat(dateString) {
      const date = new Date(dateString)
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    }
  }
}
</script>
