type Target =
  | 'ARRAY_BUFFER'
  | 'ELEMENT_ARRAY_BUFFER'
  | 'COPY_READ_BUFFER'
  | 'COPY_WRITE_BUFFER'
  | 'TRANSFORM_FEEDBACK_BUFFER'
  | 'UNIFORM_BUFFER'
  | 'PIXEL_PACK_BUFFER'
  | 'PIXEL_UNPACK_BUFFER'

type Usage =
  | 'STATIC_DRAW'
  | 'DYNAMIC_DRAW'
  | 'STREAM_DRAW'
  | 'STATIC_READ'
  | 'DYNAMIC_READ'
  | 'STREAM_READ'
  | 'STATIC_COPY'
  | 'DYNAMIC_COPY'
  | 'STREAM_COPY'

type Mode =
  | 'POINTS'
  | 'LINE_STRIP'
  | 'LINE_LOOP'
  | 'LINES'
  | 'TRIANGLE_STRIP'
  | 'TRIANGLE_FAN'
  | 'TRIANGLES'

type DrayElType = 'UNSIGNED_BYTE' | 'UNSIGNED_SHORT' | 'UNSIGNED_INT'

export default class WebGLBase {
  private canvas: HTMLCanvasElement
  private context: WebGLRenderingContext
  private vertexShader: WebGLShader | null = null
  private fragmentShader: WebGLShader | null = null
  private program: WebGLProgram | null = null
  private clearColor: [number, number, number, number]
  private textureIndex: number = 0
  private textureIndexMap: Map<string, number> = new Map()

  constructor({
    canvasEl,
    clearColor = [0, 0, 0, 1],
    width,
    height
  }: {
    canvasEl: HTMLCanvasElement
    clearColor?: [number, number, number, number?]
    width?: number
    height?: number
  }) {
    this.canvas = canvasEl

    this.context = (this.canvas.getContext('webgl') ||
      this.canvas.getContext('experimental-webgl')) as WebGLRenderingContext

    this.clearColor = [
      clearColor[0],
      clearColor[1],
      clearColor[2],
      clearColor[3] || 0
    ]
    this.setCanvasSize(width || window.innerWidth, height || window.innerHeight)
    this.context.enable(this.context.CULL_FACE)
    this.context.enable(this.context.DEPTH_TEST)
    this.context.depthFunc(this.context.LEQUAL)

    this.clear()
  }

  setCanvasSize(width: number, height: number): WebGLBase {
    if (this.canvas === null) {
      return this
    }

    this.canvas.width = width
    this.canvas.height = height
    this.context.viewport(0, 0, width, height)

    return this
  }

  clear(): WebGLBase {
    this.context.clearColor(
      this.clearColor[0],
      this.clearColor[1],
      this.clearColor[2],
      this.clearColor[3]
    )
    this.context.clearDepth(1.0)
    this.context.clear(
      this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT
    )

    return this
  }

  createVertexShader(shaderSource: string): WebGLBase {
    this.vertexShader = this.createShader(
      shaderSource,
      this.context.VERTEX_SHADER
    )

    return this
  }

  createFragmentShader(shaderSource: string): WebGLBase {
    this.fragmentShader = this.createShader(
      shaderSource,
      this.context.FRAGMENT_SHADER
    )

    return this
  }

  createProgram(
    vertexShaderSource: string,
    fragmentShaderSource: string
  ): WebGLBase {
    this.createVertexShader(vertexShaderSource)
    this.createFragmentShader(fragmentShaderSource)

    if (this.vertexShader === null) {
      throw new Error('vertex shader is not created')
    }

    if (this.fragmentShader === null) {
      throw new Error('fragment shader is not created')
    }

    this.program = this.context.createProgram()

    if (this.program === null) {
      throw new Error('can not create program')
    }

    this.context.attachShader(this.program, this.vertexShader)
    this.context.attachShader(this.program, this.fragmentShader)

    this.context.linkProgram(this.program)

    if (
      !this.context.getProgramParameter(this.program, this.context.LINK_STATUS)
    ) {
      throw new Error('can not link program')
    }

    this.context.useProgram(this.program)

    return this
  }

  getAttrLocation(attrName: string): number {
    if (this.program === null) {
      throw new Error('program is not created')
    }

    return this.context.getAttribLocation(this.program, attrName)
  }

  getUniformLocation(attrName: string): WebGLUniformLocation | null {
    if (this.program === null) {
      throw new Error('program is not created')
    }

    return this.context.getUniformLocation(this.program, attrName)
  }

  getTextureIndex(name: string): number {
    if (this.textureIndexMap.has(name)) {
      return this.textureIndexMap.get(name) as number
    }

    this.textureIndexMap.set(name, this.textureIndex++)

    return this.textureIndexMap.get(name) as number
  }

  registerTexture({
    name,
    image
  }: {
    name: string
    image: HTMLImageElement | HTMLCanvasElement
  }): WebGLBase {
    if (!name || !image) {
      throw new Error('name and texture is needed')
    }

    const textureIndex: number = this.getTextureIndex(name)

    const texture: WebGLTexture = this.createTexture(image, textureIndex)

    this.context.bindTexture(this.context.TEXTURE_2D, texture)
    this.context.texParameteri(
      this.context.TEXTURE_2D,
      this.context.TEXTURE_MIN_FILTER,
      this.context.NEAREST
    )
    this.context.texParameteri(
      this.context.TEXTURE_2D,
      this.context.TEXTURE_MAG_FILTER,
      this.context.NEAREST
    )
    this.context.texParameteri(
      this.context.TEXTURE_2D,
      this.context.TEXTURE_WRAP_S,
      this.context.REPEAT
    )
    this.context.texParameteri(
      this.context.TEXTURE_2D,
      this.context.TEXTURE_WRAP_T,
      this.context.REPEAT
    )

    this.context.uniform1i(this.getUniformLocation(name), textureIndex)

    return this
  }

  registerUniform({
    name,
    data,
    type
  }: {
    name: string
    data:
      | Int8Array
      | Int16Array
      | Int32Array
      | Float32Array
      | Float64Array
      | number
      | number[]
    type:
      | '1i'
      | '2i'
      | '3i'
      | '4i'
      | '1f'
      | '2f'
      | '3f'
      | '4f'
      | '1iv'
      | '2iv'
      | '3iv'
      | '4iv'
      | '1fv'
      | '2fv'
      | '3fv'
      | '4fv'
      | 'Matrix2iv'
      | 'Matrix3iv'
      | 'Matrix4iv'
      | 'Matrix2fv'
      | 'Matrix3fv'
      | 'Matrix4fv'
  }): WebGLBase {
    const location: WebGLUniformLocation | null = this.getUniformLocation(name)

    if (location === null) {
      throw new Error('location is not found')
    }

    if (/^Matrix/i.test(type)) {
      ;(this.context as any)[`uniform${type}`](location, false, data)
    } else {
      // if (/(i|f)$/i.test(type)) {
      //   (this.context as any)[`uniform${type}`](location, data)
      // } else {
      //   (this.context as any)[`uniform${type}`](location, ...(data as number[]))
      // }
      ;(this.context as any)[`uniform${type}`](location, data)
    }

    return this
  }

  drawArrays(
    mode: Mode = 'TRIANGLES',
    first: number = 0,
    count: number = 3
  ): WebGLBase {
    this.context.drawArrays((this.context as any)[mode], first, count)

    return this
  }

  drawElements(
    mode: Mode = 'TRIANGLES',
    count: number = 3,
    type: DrayElType = 'UNSIGNED_SHORT',
    offset: number = 0
  ): WebGLBase {
    this.context.drawElements(
      (this.context as any)[mode],
      count,
      (this.context as any)[type],
      offset
    )

    return this
  }

  flush(): WebGLBase {
    this.context.flush()
    return this
  }

  createVbo(
    data: ArrayBuffer,
    target: Target = 'ARRAY_BUFFER',
    usage: Usage = 'STATIC_DRAW'
  ): WebGLBuffer {
    const buffer: WebGLBuffer | null = this.context.createBuffer()

    if (buffer === null) {
      throw new Error('can not create Buffer')
    }

    this.context.bindBuffer((this.context as any)[target], buffer)
    this.context.bufferData(
      (this.context as any)[target],
      data,
      (this.context as any)[usage]
    )

    this.context.bindBuffer((this.context as any)[target], null)

    return buffer
  }

  createBufferObj(
    data: ArrayBuffer,
    target: Target = 'ELEMENT_ARRAY_BUFFER',
    usage: Usage = 'STATIC_DRAW'
  ) {
    const buffer: WebGLBuffer | null = this.context.createBuffer()

    if (buffer === null) {
      throw new Error('can not create Buffer')
    }

    this.context.bindBuffer((this.context as any)[target], buffer)
    this.context.bufferData(
      (this.context as any)[target],
      data,
      (this.context as any)[usage]
    )

    this.context.bindBuffer((this.context as any)[target], null)

    return buffer
  }

  bindBuffer(buffer: WebGLBuffer, target: Target = 'ARRAY_BUFFER'): WebGLBase {
    this.context.bindBuffer((this.context as any)[target], buffer)

    return this
  }

  enableVertexAttrByName(attrName: string): WebGLBase {
    return this.enableVertexAttr(this.getAttrLocation(attrName))
  }

  enableVertexAttr(location: number): WebGLBase {
    this.context.enableVertexAttribArray(location)

    return this
  }

  vertexAttrPointer({
    index,
    size,
    type,
    normalized = false,
    stride = 0,
    offset = 0
  }: {
    index: number
    size: number
    type: number
    normalized?: boolean
    stride?: number
    offset?: number
  }): WebGLBase {
    this.context.vertexAttribPointer(
      index,
      size,
      type,
      normalized,
      stride,
      offset
    )

    return this
  }

  registerVertexAttrByName({
    name,
    size,
    data,
    type = this.context.FLOAT
  }: {
    name: string
    size: number
    data: ArrayBuffer
    type?: number
  }): WebGLBase {
    return this.bindBuffer(this.createVbo(data))
      .enableVertexAttrByName(name)
      .vertexAttrPointer({
        index: this.getAttrLocation(name),
        size,
        type
      })
  }

  createTexture(
    imageSource: HTMLImageElement | HTMLCanvasElement,
    textureIndex: number
  ): WebGLTexture {
    const texture: WebGLTexture | null = this.context.createTexture()

    if (texture === null) {
      throw new Error('can not create texture')
    }

    this.context.activeTexture((this.context as any)[`TEXTURE${textureIndex}`])
    this.context.bindTexture(this.context.TEXTURE_2D, texture)
    this.context.texImage2D(
      this.context.TEXTURE_2D,
      0,
      this.context.RGBA,
      this.context.RGBA,
      this.context.UNSIGNED_BYTE,
      imageSource
    )
    this.context.generateMipmap(this.context.TEXTURE_2D)
    this.context.bindTexture(this.context.TEXTURE_2D, null)

    return texture
  }

  private createShader(shaderSource: string, shaderType: number): WebGLShader {
    const shader: WebGLShader | null = this.context.createShader(shaderType)

    if (shader === null) {
      throw new Error('can not create shader')
    }

    this.context.shaderSource(shader, shaderSource)
    this.context.compileShader(shader)

    if (!this.context.getShaderParameter(shader, this.context.COMPILE_STATUS)) {
      throw new Error('can not compile shader')
    }

    return shader
  }
}
