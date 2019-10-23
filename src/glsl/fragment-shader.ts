import easing from './fragment-shader/easing.glsl'
import noise from './fragment-shader/simple-noise.glsl'
import main from './fragment-shader/main.glsl'

export default `
precision mediump float;

${easing}
${noise}
${main}
`
