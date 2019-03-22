<template lang="pug">
  canvas(ref="canvas")
</template>
<script>
/* global PIXI TweenLite */

import _debounce from 'lodash/debounce'

export default {
  data() {
    return {
      app: undefined,
      container: undefined,
      images: [],
      currentImageIndex: 0,
      isAnimating: false
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
  watch: {
    $route() {
      if (!this.isAnimating) {
        console.log('run')
        this.outImage()
      }
    }
  },
  methods: {
    async inImage() {
      if (!this.images[this.currentImageIndex]) {
        const texure = await this.loadImageAsTexture(this.currentImageIndex)
        this.images[this.currentImageIndex] = this.createMesh(texure)
      }

      this.fitToWindow(this.images[this.currentImageIndex].mesh)
      this.images[this.currentImageIndex].mesh.alpha = 0
      this.container.addChild(this.images[this.currentImageIndex].mesh)

      TweenLite.to(this.images[this.currentImageIndex].mesh, 1, {
        alpha: 1
      })
    },
    outImage() {
      const obj = {
        alpha: 1
      }

      const mesh = this.images[this.currentImageIndex].mesh
      const rand = this.images[this.currentImageIndex].rand

      TweenLite.to(obj, 1, {
        alpha: 0,
        onUpdate() {
          const vertices = mesh.vertices
          mesh.alpha = obj.alpha

          for (let i = 0, len = vertices.length; i < len; i++) {
            mesh.vertices[i] = mesh.vertices[i] + rand[i] * obj.alpha * 10
          }
        }
      })
    },
    createMesh(texture) {
      const mesh = new PIXI.mesh.Plane(texture, 10, 10)
      const originalVertices = mesh.vertices.slice()
      const rand = originalVertices.map(vert => Math.random())

      return {
        mesh,
        originalVertices,
        rand
      }
    },
    fitToWindow(mesh) {
      const texture = mesh._texture
      mesh.x = 0
      mesh.y = 0

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
    },
    loadImageAsTexture(imageIndex) {
      return new Promise((resolve, reject) => {
        const texture = PIXI.Texture.fromImage(this.photos[imageIndex])

        texture.once('update', texture => {
          resolve(texture)
        })

        texture.once('error', err => {
          reject(err)
        })
      })
    },
    onResize() {
      this.$refs.canvas.style.display = 'none'

      this.app.renderer.resize(window.innerWidth, window.innerHeight)
      if (this.images[this.currentImageIndex]) {
        this.fitToWindow(this.images[this.currentImageIndex].mesh)
      }
      this.$refs.canvas.style.display = ''
    }
  },
  mounted() {
    window.addEventListener('resize', _debounce(this.onResize, 300))

    this.app = new PIXI.Application({
      view: this.$refs.canvas,
      resolution: 1,
      resizeTo: window
    })

    this.app.renderer.resize(window.innerWidth, window.innerHeight)
    this.container = new PIXI.Container()
    this.app.stage.addChild(this.container)

    this.currentImageIndex = Math.floor(Math.random() * this.photos.length)

    this.inImage()
  }
}
</script>
<style lang="stylus" scoped>
canvas
  display block
  position fixed
  top 0
  left 0
  z-index -1
</style>
