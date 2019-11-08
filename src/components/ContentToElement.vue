<script lang="ts">
import Vue, { VNode, PropOptions } from 'vue'

export default Vue.extend({
  props: {
    content: {
      type: Object,
      require: true,
      default: () => ({})
    } as PropOptions<any>
  },
  methods: {
    tagEl(nodeType: string): string {
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
    createEl(content: any): VNode {
      const option = Object.keys(content.data).reduce((acc: any, current) => {
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

      return this.$createElement(
        this.tagEl(content.nodeType),
        {
          attrs: option
        },
        content.content
          ? content.content.map((item: any): VNode => this.createEl(item))
          : content.value
      )
    }
  },
  render(): VNode {
    return this.createEl(this.content)
  }
})
</script>
