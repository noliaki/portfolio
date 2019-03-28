<template lang="pug">
  div(:class="`-${$route.name}`")
    canvas.background-canvas(ref="canvas")
    .cover
    .loading-next-image(v-show="isLoadingNextImage")
      span.loading-circle
      | loading next background image...
</template>
<script>
/* global PIXI TweenLite Power0 Power1 */

import _debounce from 'lodash/debounce'
import { mapGetters } from 'vuex'

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
    ...mapGetters('background', ['entries'])
  },
  watch: {
    $route() {
      if (!this.isAnimating && !this.isLoadingNextImage) {
        this.outImage(this.currentImageIndex)
      }
    }
  },
  created() {
    if (process.server) return

    if (process.env.NODE_ENV === 'production') {
      PIXI.utils.skipHello()
    }

    this.displacementSprite = PIXI.Sprite.fromImage(
      `${this.$router.options.base}img/water.png`
    )
    this.displacementSprite.texture.baseTexture.wrapMode =
      PIXI.WRAP_MODES.REPEAT
  },
  mounted() {
    this.app = new PIXI.Application({
      view: this.$refs.canvas,
      resolution: 1,
      resizeTo: window,
      backgroundColor: 0xffffff
    })

    this.onResize()
    this.container = new PIXI.Container()
    this.app.stage.addChild(this.container)
    this.currentImageIndex = Math.floor(Math.random() * this.entries.length)

    window.addEventListener('resize', _debounce(this.onResize, 300))

    this.inImage(this.currentImageIndex)
  },
  methods: {
    async inImage(imageIndex) {
      if (!this.isAnimating) {
        this.isAnimating = true
      }

      if (!this.images[imageIndex]) {
        this.isLoadingNextImage = true
        this.images[imageIndex] = await this.loadAndCreate(imageIndex)
        this.isLoadingNextImage = false
      }

      this.initializeImage(this.images[imageIndex])
      this.fitToWindow(this.images[imageIndex].mesh)

      this.images[imageIndex].mesh.alpha = 0
      this.container.addChild(this.images[imageIndex].mesh)

      TweenLite.to(this.images[imageIndex].mesh, 0.5, {
        alpha: 1,
        onComplete: () => {
          this.isAnimating = false
        },
        ease: Power0.easeNone
      })

      const nextImageIndex = (this.currentImageIndex + 1) % this.entries.length
      if (!this.images[nextImageIndex]) {
        this.isLoadingNextImage = true
        this.images[nextImageIndex] = await this.loadAndCreate(nextImageIndex)
        this.isLoadingNextImage = false
      }
    },
    async loadAndCreate(index) {
      const texure = await this.loadImageAsTexture(
        this.entries[index].fields.image.fields.file.url
      )

      return this.createMesh(texure)
    },
    outImage(imageIndex) {
      this.isAnimating = true

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
        onUpdate: () => {
          mesh.alpha = obj.alpha
          displacementFilter.scale.x = obj.scale

          for (let i = 0, len = mesh.vertices.length; i < len; i++) {
            mesh.vertices[i] = origVertices[i] + rand[i] * obj.translate
          }
        },
        onComplete: () => {
          this.currentImageIndex =
            (this.currentImageIndex + 1) % this.entries.length
          this.inImage(this.currentImageIndex)
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
