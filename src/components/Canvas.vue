<template lang="pug">
  div
    canvas(ref="canvas")
    .cover
    .loading-next-image(v-show="isLoadingNextImage")
      span.loading-circle
      | loading next background image...
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
      isAnimating: false,
      displacementSprite: undefined,
      isLoadingNextImage: false
    }
  },
  computed: {
    photos() {
      return [
        'img/background/IMG_1875.JPG',
        'img/background/DSC01235.JPG',
        'img/background/CIMG2343.JPG',
        'img/background/IMG_0348.JPG',
        'img/background/DSC01353.JPG',
        'img/background/IMG_0166.JPG',
        'img/background/DSC00689.JPG',
        'img/background/CIMG2347.JPG',
        'img/background/DSC00148.JPG',
        'img/background/IMG_0315.JPG',
        'img/background/IMG_0302.JPG',
        'img/background/IMG_0139.JPG',
        'img/background/IMG_0890.JPG',
        'img/background/IMG_0297.JPG',
        'img/background/IMG_0254.JPG',
        'img/background/IMG_0268.JPG',
        'img/background/IMG_0645.JPG',
        'img/background/DSC00140.JPG',
        'img/background/IMG_0043.JPG',
        'img/background/DSC00142.JPG',
        'img/background/DSC01261.JPG',
        'img/background/IMG_0290.JPG',
        'img/background/DSC00152.JPG',
        'img/background/IMG_0051.JPG',
        'img/background/DSC00144.JPG',
        'img/background/IMG_0331.JPG',
        'img/background/IMG_0668.JPG',
        'img/background/IMG_0036.JPG',
        'img/background/DSC00135.JPG',
        'img/background/DSC00691.JPG',
        'img/background/DSC01401.JPG',
        'img/background/CIMG2428.JPG',
        'img/background/IMG_0187.JPG'
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
  created() {
    if (process.server) return

    this.displacementSprite = PIXI.Sprite.fromImage(
      `${this.$router.options.base}img/background/water.png`
    )
    this.displacementSprite.texture.baseTexture.wrapMode =
      PIXI.WRAP_MODES.REPEAT
  },
  mounted() {
    if (process.env.NODE_ENV === 'production') {
      PIXI.utils.skipHello()
    }

    this.app = new PIXI.Application({
      view: this.$refs.canvas,
      resolution: 1,
      resizeTo: window,
      backgroundColor: 0xffffff
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
      this.isLoadingNextImage = true
      const texure = await this.loadImageAsTexture(
        `${this.$router.options.base}${this.photos[index]}`
      )
      const obj = this.createMesh(texure)

      this.isLoadingNextImage = false
      return obj
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

      TweenLite.to(obj, 1, {
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
      const displacementFilter = new PIXI.filters.DisplacementFilter(
        this.displacementSprite,
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
.cover
  position fixed
  top 0
  right 0
  bottom 0
  left 0
  background-color #fff
  opacity 0.4
  z-index -1

canvas
  display block
  position fixed
  top 0
  left 0
  z-index -1

.loading-next-image
  position fixed
  top 10px
  right 10px
  font-size 0.8rem
  z-index 1

.loading-circle
  display inline-block
  width 1em
  height 1em
  border-radius 2em
  border-top 2px solid lighten(#000, 70%)
  border-right 2px solid #000
  border-bottom 2px solid #000
  border-left 2px solid #000
  vertical-align middle
  margin-right 0.5em

  animation loading 700ms linear 0s infinite normal forwards

@keyframes loading
  to
    transform rotate(360deg)
</style>
