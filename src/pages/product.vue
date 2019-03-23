<template lang="pug">
  main
    article.content
      ul
        li.item(v-for="(item, index) in items", :key="index")
          small {{ item.sys.createdAt }}
          h2 {{ item.fields.title }}
</template>
<script>
import createClient from '~/plugins/contentful'

export default {
  async asyncData() {
    const client = createClient()
    const { items } = await client.getEntries()

    return {
      items
    }
  },
  created() {
    console.log(process.server, process.env.NODE_ENV)
  },
  mounted() {
    console.log(process.server, process.env.NODE_ENV)
  }
}
</script>
<style lang="stylus" scoped>
ul
  display grid
  grid-template-columns repeat(auto-fill, minmax(250px, 1fr))
</style>
