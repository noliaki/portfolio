<script>
export default {
  props: {
    content: {
      type: Object,
      require: true
    }
  },
  methods: {
    tagEl(nodeType) {
      switch (nodeType) {
        case 'paragraph':
          return 'p'
        case 'text':
          return 'span'
        case 'hyperlink':
          return 'a'
      }
    },
    createEl(h, content) {
      return content.map(item => {
        const tag = this.tagEl(item.nodeType)
        const option = Object.keys(item.data).reduce((acc, current) => {
          if (current === 'uri') {
            acc.href = item.data[current]
            acc.target = '_blank'
            acc.rel = 'noopener noreferer'
          }

          return acc
        }, {})

        return h(
          tag,
          {
            attrs: option
          },
          item.content ? this.createEl(h, item.content) : item.value
        )
      })
    }
  },
  render(h) {
    return h(
      this.tagEl(this.content.nodeType),
      this.content.content
        ? this.createEl(h, this.content.content)
        : this.content.value
    )
  }
}
</script>
