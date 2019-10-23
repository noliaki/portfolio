<template>
  <main>
    <article class="content">
      <ul class="product__list">
        <li
          v-for="(item, index) in products"
          :key="index"
          class="product__item"
        >
          <header class="product__header">
            <small>{{ dateFormat(item.sys.createdAt) }}</small>
            <div class="product__name">
              <em>
                <a
                  :href="item.fields.url"
                  target="_blank"
                  rel="noopener noreferer"
                  >{{ item.fields.title }}</a
                >
              </em>
            </div>
          </header>
          <div class="product__body">
            <content-to-element
              v-for="(content, elIndex) in descriptionContents(item)"
              :key="elIndex"
              :content="content"
            ></content-to-element>
          </div>
        </li>
      </ul>
    </article>
  </main>
</template>
<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import contentToElement from '~/components/ContentToElement.vue'

export default Vue.extend({
  head: {
    title: 'product'
  },
  components: {
    contentToElement
  },
  data(): any {
    return {
      random: Math.random()
    }
  },
  computed: {
    ...mapGetters('product', {
      products: 'entries'
    }),
    startIndex(): number {
      return Math.floor(this.random * this.noImages.length)
    }
  },
  methods: {
    dateFormat(dateString: string): string {
      const date = new Date(dateString)
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    },
    descriptionContents(item: any) {
      return item.fields.description.content.slice(0, 1)
    }
  }
})
</script>
