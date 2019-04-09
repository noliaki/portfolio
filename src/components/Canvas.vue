<template lang="pug">
  div(:class="`-${$route.name}`")
    canvas.background-canvas(ref="canvas")
    .cover
    .loading-next-image(v-show="isLoadingNextImage")
      span.loading-circle
      | loading next background image...
</template>
<script>
/* global PIXI TweenLite Power2 */

import _debounce from 'lodash/debounce'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      app: undefined,
      container: undefined,
      meshes: new Map(),
      currentImageIndex: 0,
      isAnimating: false,
      displacementSprite: undefined,
      isLoadingNextImage: false,
      distance: 0,
      verticesMap: new Map(),
      displacementFilterMap: new Map()
    }
  },
  computed: {
    ...mapGetters('background', ['entries']),
    nextImageIndex() {
      return (this.currentImageIndex + 1) % this.entries.length
    }
  },
  watch: {
    $route() {
      if (!this.isAnimating && !this.isLoadingNextImage) {
        this.currentImageIndex = this.nextImageIndex
        this.inImage(this.currentImageIndex)
      }
    }
  },
  created() {
    if (process.server) return

    if (process.env.NODE_ENV === 'production') {
      PIXI.utils.skipHello()
    }

    this.displacementSprite = PIXI.Sprite.fromImage(
      `${this.$router.options.base}img/cloud.png`
    )

    this.displacementSprite.alpha = 0

    this.displacementSprite.texture.baseTexture.wrapMode =
      PIXI.WRAP_MODES.MIRRORED_REPEAT
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

    this.app.stage.addChild(this.displacementSprite)

    this.inImage(this.currentImageIndex, true)
  },
  methods: {
    async inImage(imageIndex, isFirst = false) {
      if (!this.isAnimating) {
        this.isAnimating = true
      }

      if (!this.meshes.has(imageIndex)) {
        this.isLoadingNextImage = true
        this.meshes.set(imageIndex, await this.loadAndCreate(imageIndex))
        this.isLoadingNextImage = false
      }

      this.fitToWindow(imageIndex)

      const mesh = this.meshes.get(imageIndex)
      const vertices = this.verticesMap.get(imageIndex)
      const displacementFilter = this.displacementFilterMap.get(imageIndex)
      const randRatio = vertices.map(item => Math.random() * -2 + 1)
      const obj = {
        val: 1,
        filterScaleX: Math.random() * 1000 + 1000,
        filterScaleY: Math.random() * 1000 + 1000,
        scaleX: mesh.scale.x * 1.2,
        scaleY: mesh.scale.y * 1.2
      }

      mesh.alpha = 0
      displacementFilter.scale.x = obj.filterScaleX
      displacementFilter.scale.y = obj.filterScaleY
      mesh.scale.x = obj.scaleX
      mesh.scale.y = obj.scaleY

      for (let i = 0, len = vertices.length; i < len; i++) {
        mesh.vertices[i] = vertices[i] + randRatio[i] * this.distance
      }

      this.container.addChild(mesh)
      mesh.visible = true

      TweenLite.to(obj, 1.2, {
        val: 0,
        filterScaleX: 0,
        filterScaleY: 0,
        scaleX: mesh.scale.x,
        scaleY: mesh.scale.y,
        onUpdate: () => {
          mesh.alpha = 1 - obj.val

          displacementFilter.scale.x = obj.val * obj.filterScaleX
          displacementFilter.scale.y = obj.val * obj.filterScaleY

          mesh.scale.x = obj.scaleX
          mesh.scale.y = obj.scaleY

          for (let i = 0, len = mesh.vertices.length; i < len; i++) {
            mesh.vertices[i] =
              vertices[i] + randRatio[i] * this.distance * obj.val
          }
        },
        onComplete: () => {
          this.isAnimating = false
          this.meshes.forEach((mesh, key, map) => {
            if (key !== imageIndex) {
              mesh.visible = false
            }
          })
        },
        ease: Power2.easeInOut
      })

      const nextImageIndex = this.nextImageIndex
      if (!this.meshes.has(nextImageIndex)) {
        this.isLoadingNextImage = true
        this.meshes.set(
          nextImageIndex,
          await this.loadAndCreate(nextImageIndex)
        )
        this.isLoadingNextImage = false
      }
    },
    async loadAndCreate(imageIndex) {
      const texure = await this.loadImageAsTexture(
        this.entries[imageIndex].fields.image.fields.file.url
      )

      return this.createMesh(imageIndex, texure)
    },
    createMesh(imageIndex, texture) {
      const mesh = new PIXI.mesh.Plane(texture, 10, 10)
      const displacementFilter = new PIXI.filters.DisplacementFilter(
        this.displacementSprite,
        0
      )

      this.verticesMap.set(imageIndex, mesh.vertices.slice())
      this.displacementFilterMap.set(imageIndex, displacementFilter)

      mesh.filters = [displacementFilter]
      // mesh.anchor.set(0.5)

      return mesh
    },
    fitToWindow(imageIndex) {
      const mesh = this.meshes.get(imageIndex)
      const texture = mesh._texture

      mesh.pivot.x = 0
      mesh.pivot.y = 0

      mesh.x = 0
      mesh.y = 0

      mesh.scale.x = 1
      mesh.scale.y = 1

      if (
        window.innerWidth / texture.width >
        window.innerHeight / texture.height
      ) {
        const ratio = window.innerWidth / texture.width
        mesh.width = window.innerWidth
        mesh.height = texture.height * ratio
        // mesh.y = (window.innerHeight - mesh.height) / 2
      } else {
        const ratio = window.innerHeight / texture.height
        mesh.width = texture.width * ratio
        mesh.height = window.innerHeight
        // mesh.x = (window.innerWidth - mesh.width) / 2
      }

      mesh.x = window.innerWidth / 2
      mesh.y = window.innerHeight / 2

      mesh.pivot.x = texture.width / 2
      mesh.pivot.y = texture.height / 2
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

      if (this.meshes.has(this.currentImageIndex)) {
        this.fitToWindow(this.currentImageIndex)
      }

      this.displacementSprite.width = window.innerWidth
      this.displacementSprite.height = window.innerHeight

      this.distance =
        ((Math.random() + Math.random() + Math.random()) / 3) * 50 + 50
      this.$refs.canvas.style.display = ''
    }
  }
}
</script>
