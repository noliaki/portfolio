<template lang="pug">
  canvas(ref="canvas")
</template>
<script>
/* global PIXI TweenLite */

export default {
  data() {
    return {
      app: undefined,
      container: undefined
    }
  },
  computed: {
    photos() {
      return [
        '/img/CIMG2343.JPG',
        '/img/DSC00129.JPG',
        '/img/DSC01353.JPG',
        '/img/DSC00689.JPG',
        '/img/CIMG2347.JPG',
        '/img/IMG_0049.JPG',
        '/img/IMG_0645.JPG',
        '/img/DSC01261.JPG',
        '/img/DSC00144.JPG',
        '/img/IMG_0331.JPG',
        '/img/IMG_0668.JPG',
        '/img/DSC00135.JPG',
        '/img/DSC00691.JPG',
        '/img/DSC01401.JPG',
        '/img/CIMG2428.JPG'
      ]
    }
  },
  mounted() {
    this.app = new PIXI.Application({
      view: this.$refs.canvas,
      resolution: 1,
      resizeTo: window
    })

    this.app.renderer.resize(window.innerWidth, window.innerHeight)

    this.container = new PIXI.Container()

    const filter = new PIXI.filters.BlurFilter()

    filter.strength = 0

    this.container.filters = [filter]
    this.app.stage.addChild(this.container)

    const texture = PIXI.Texture.fromImage('/img/CIMG2343.JPG')
    texture.once('update', () => {
      const mesh = new PIXI.mesh.Plane(texture, 10, 10)
      const originalVertices = mesh.vertices.slice()
      const rand = originalVertices.map(vert => Math.random())

      if (
        window.innerWidth / texture.width >
        window.innerHeight / texture.height
      ) {
        const ratio = window.innerWidth / texture.width
        mesh.width = window.innerWidth
        mesh.height = texture.height * ratio
        mesh.y = (window.innerHeight - mesh.height) / 2
      } else {
        const ratio = window.innerHeight / texture.height
        mesh.height = window.innerHeight
        mesh.width = texture.width * ratio
        mesh.x = (window.innerWidth - mesh.width) / 2
        mesh.y = 0
      }

      const obj = {
        x: 0
      }

      TweenLite.to(obj, 1, {
        x: 400,
        onUpdate() {
          console.log(obj.x)
          for (let i = 0, len = mesh.vertices.length; i < len; i++) {
            if (i % 2 === 0) {
              mesh.vertices[i] = originalVertices[i] + obj.x * rand[i]
            }
          }
        }
      })

      this.container.addChild(mesh)
    })
  }
}
</script>
