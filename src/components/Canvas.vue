<template>
  <div :class="`-${$route.name}`">
    <canvas ref="canvas" class="background-canvas"></canvas>
    <div class="cover"></div>
    <div v-show="isLoadingNextImage" class="loading-next-image">
      <span class="loading-circle"></span>loading next background image...
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'

import WebGlBase from '~/helper/WebGlBase'
import Square from '~/helper/Square'
import vertexShaderSource from '~/glsl/vertex-shader.glsl'
import fragmentShaderSource from '~/glsl/fragment-shader'
import loadImage from '~/helper/load-image'
import eventBus from '~/helper/event-bus'

interface BgImage {
  url: string
  resolution: [number, number]
  texture?: HTMLImageElement | HTMLCanvasElement
}

function shuffle(_a: any[]): any[] {
  const a: any[] = _a.slice()

  for (let i: number = a.length - 1; i >= 0; i--) {
    const r: number = Math.floor(Math.random() * (i + 1))
    const temp: any = a[i]
    a[i] = a[r]
    a[r] = temp
  }

  return a
}

export default Vue.extend({
  data(): any {
    return {
      webGlBase: null,
      square: undefined,
      time: 0,
      timeStep: Math.random(),
      progress: 0,
      bgImages: [],
      currentBgIndex: 0,
      nextBgIndex: 0,
      isAnimating: false,
      raf: undefined,
      isLoadingNextImage: false
    }
  },
  computed: {
    currentBgImage(): any {
      return this.bgImages[this.currentBgIndex]
    }
  },
  watch: {
    $route(): void {
      this.changeImageTo()
    }
  },
  async mounted(): Promise<void> {
    this.bgImages = await fetch('/background-entries.json')
      .then((res: Response): Promise<any> => res.json())
      .then(json =>
        shuffle(
          (json as any[]).map(
            (value: any): BgImage => {
              return {
                url: value.fields.image.fields.file.url,
                resolution: [
                  value.fields.image.fields.file.details.image.width,
                  value.fields.image.fields.file.details.image.height
                ]
              }
            }
          )
        )
      )

    const filterTexture = await loadImage('/img/cloud.png')
    await this.loadImageByIndex(this.currentBgIndex)
    // await this.loadImageByIndex(this.nextBgIndex)

    this.webGlBase = new WebGlBase({
      canvasEl: this.$refs.canvas,
      clearColor: [1, 1, 1, 1],
      width: window.innerWidth,
      height: window.innerHeight
    })

    this.square = new Square([0, 0, 0], 2, 2)

    this.webGlBase
      .createProgram(vertexShaderSource, fragmentShaderSource)
      .registerUniform({
        name: 'uResolution',
        data: [window.innerWidth, window.innerHeight],
        type: '2fv'
      })
      .registerUniform({
        name: 'uPrevImageResolution',
        data: this.currentBgImage.resolution,
        type: '2fv'
      })
      .registerUniform({
        name: 'uTime',
        data: this.time,
        type: '1f'
      })
      .registerUniform({
        name: 'uProgress',
        data: this.progress,
        type: '1f'
      })
      .registerTexture({
        name: 'filterTexture',
        image: filterTexture
      })
      .registerVertexAttrByName({
        name: 'position',
        size: 3,
        data: this.square.position
      })
      .registerVertexAttrByName({
        name: 'textureCoord',
        size: 2,
        data: new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0])
      })
      .bindBuffer(
        this.webGlBase.createBufferObj(
          this.square.index,
          'ELEMENT_ARRAY_BUFFER',
          'STATIC_DRAW'
        ),
        'ELEMENT_ARRAY_BUFFER'
      )
      .drawElements('TRIANGLES', this.square.index.length)
      .flush()

    eventBus.$on('winResize', (winWidth: number, winHeight: number): void => {
      this.webGlBase
        .setCanvasSize(winWidth, winHeight)
        .clear()
        .registerUniform({
          name: 'uResolution',
          data: [winWidth, winHeight],
          type: '2fv'
        })
        .drawElements('TRIANGLES', this.square.index.length)
        .flush()
    })
    this.changeImageTo()
  },
  methods: {
    async loadImageByIndex(
      index: number
    ): Promise<HTMLImageElement | HTMLCanvasElement> {
      if (this.bgImages[index].texture) {
        return this.bgImages[index].texture
      }

      this.isLoadingNextImage = true
      this.bgImages[index].texture = await loadImage(this.bgImages[index].url)
      this.isLoadingNextImage = false

      return this.bgImages[index].texture
    },
    changeImageTo(): void {
      if (this.isLoadingNextImage || this.isAnimating) return

      this.loadImageByIndex((this.nextBgIndex + 1) % this.bgImages.length)

      this.isAnimating = true
      this.timeStep = Math.random() * 0.02

      this.webGlBase
        .registerUniform({
          name: 'uNextImageResolution',
          data: this.bgImages[this.nextBgIndex].resolution,
          type: '2fv'
        })
        .registerTexture({
          name: 'texture2',
          image: this.bgImages[this.nextBgIndex].texture
        })

      this.update()
    },
    update(): void {
      this.time += this.timeStep
      this.progress += 1 / 110

      this.webGlBase
        .clear()
        .registerUniform({
          name: 'uTime',
          data: this.time,
          type: '1f'
        })
        .registerUniform({
          name: 'uProgress',
          data: this.progress > 1 ? 1 : this.progress,
          type: '1f'
        })
        .drawElements('TRIANGLES', this.square.index.length)
        .flush()

      if (this.progress >= 1) {
        cancelAnimationFrame(this.raf)
        this.completeChange()
      } else {
        this.raf = requestAnimationFrame((): void => {
          this.update()
        })
      }
    },
    completeChange(): void {
      const nextBgImage: BgImage = this.bgImages[this.nextBgIndex]

      this.time = 0
      this.progress = 0

      this.webGlBase
        .clear()
        .registerTexture({
          name: 'texture1',
          image: nextBgImage.texture
        })
        .registerUniform({
          name: 'uPrevImageResolution',
          data: nextBgImage.resolution,
          type: '2fv'
        })
        .registerUniform({
          name: 'uTime',
          data: this.time,
          type: '1f'
        })
        .registerUniform({
          name: 'uProgress',
          data: this.progress,
          type: '1f'
        })
        .drawElements('TRIANGLES', this.square.index.length)
        .flush()

      if (this.currentBgIndex !== this.nextBgIndex) {
        this.currentBgIndex = this.nextBgIndex
      }
      this.nextBgIndex = (this.currentBgIndex + 1) % this.bgImages.length
      this.isAnimating = false
    }
  }
})
</script>
