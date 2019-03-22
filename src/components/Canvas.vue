<template lang="pug">
  canvas(ref="canvas")
</template>
<script>
/* global PIXI TweenLite Power0 Power1 */

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
        this.outImage(this.currentImageIndex)
      }
    }
  },
  mounted() {
    this.app = new PIXI.Application({
      view: this.$refs.canvas,
      resolution: 1,
      resizeTo: window,
      backgroundColor: 0x47054a
    })

    this.app.renderer.resize(window.innerWidth, window.innerHeight)
    this.container = new PIXI.Container()
    this.app.stage.addChild(this.container)
    this.currentImageIndex = Math.floor(Math.random() * this.photos.length)

    window.addEventListener('resize', _debounce(this.onResize, 300))

    this.inImage(this.currentImageIndex)
  },
  methods: {
    async inImage(imageIndex) {
      if (!this.isAnimating) {
        this.isAnimating = true
      }

      if (!this.images[imageIndex]) {
        this.images[imageIndex] = await this.loadAndCreate(imageIndex)
      }

      this.initializeImage(this.images[imageIndex])
      this.fitToWindow(this.images[imageIndex].mesh)

      this.images[imageIndex].mesh.alpha = 0
      this.container.addChild(this.images[imageIndex].mesh)

      const self = this

      TweenLite.to(this.images[imageIndex].mesh, 1, {
        alpha: 1,
        async onComplete() {
          const nextImageIndex =
            (self.currentImageIndex + 1) % self.photos.length

          if (!self.images[nextImageIndex]) {
            self.images[nextImageIndex] = await self
              .loadAndCreate(nextImageIndex)
              .catch(console.log)
          }
          self.isAnimating = false
        },
        ease: Power0.easeNone
      })
    },
    async loadAndCreate(index) {
      const texure = await this.loadImageAsTexture(this.photos[index])
      return this.createMesh(texure)
    },
    outImage(imageIndex) {
      this.isAnimating = true
      const self = this

      const obj = {
        alpha: 1,
        scale: 0,
        translate: 0
      }

      const mesh = this.images[imageIndex].mesh
      const rand = this.images[imageIndex].rand
      const origVertices = this.images[imageIndex].originalVertices
      const displacementFilter = this.images[imageIndex].displacementFilter

      TweenLite.to(obj, 1.3, {
        alpha: 0,
        scale: 100,
        translate: window.innerWidth / 3,
        onUpdate() {
          mesh.alpha = obj.alpha
          displacementFilter.scale.x = obj.scale

          for (let i = 0, len = mesh.vertices.length; i < len; i++) {
            mesh.vertices[i] = origVertices[i] + rand[i] * obj.translate
          }
        },
        onComplete() {
          self.currentImageIndex =
            (self.currentImageIndex + 1) % self.photos.length
          self.inImage(self.currentImageIndex)
        },
        ease: Power1.easeInOut
      })
    },
    createMesh(texture) {
      const mesh = new PIXI.mesh.Plane(texture, 10, 10)
      const originalVertices = mesh.vertices.slice()
      const rand = originalVertices.map(vert => Math.random())
      const displacementSprite = PIXI.Sprite.fromImage('/img/water.png')
      displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT
      const displacementFilter = new PIXI.filters.DisplacementFilter(
        displacementSprite,
        0
      )

      mesh.filters = [displacementFilter]

      return {
        mesh,
        originalVertices,
        rand,
        displacementFilter
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
    initializeImage(imageObj) {
      imageObj.displacementFilter.scale.x = 0

      for (let i = 0, len = imageObj.mesh.vertices.length; i < len; i++) {
        imageObj.mesh.vertices[i] = imageObj.originalVertices[i]
      }
    },
    loadImageAsTexture(imagePath) {
      return new Promise((resolve, reject) => {
        const texture = PIXI.Texture.fromImage(imagePath)

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
