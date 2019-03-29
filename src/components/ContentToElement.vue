<script>
export default {
  props: {
    content: {
      type: Object,
      require: true,
      default: () => ({})
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
        case 'embedded-asset-block':
          return 'img'
        default:
          return 'div'
      }
    },
    createEl(h, content) {
      const option = Object.keys(content.data).reduce((acc, current) => {
        if (current === 'uri') {
          acc.href = content.data[current]
          acc.target = '_blank'
          acc.rel = 'noopener noreferer'
        }

        if (current === 'target') {
          acc.src = content.data.target.fields.file.url
          acc.alt = content.data.target.fields.title
        }

        return acc
      }, {})

      return h(
        this.tagEl(content.nodeType),
        {
          attrs: option
        },
        content.content
          ? content.content.map(item => this.createEl(h, item))
          : content.value
      )
    }
  },
  render(h) {
    return this.createEl(h, this.content)
  }
}
</script>
