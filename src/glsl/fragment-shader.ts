import easing from './fragment-shader/easing.glsl'
import noise from './fragment-shader/simple-noise.glsl'
import main from './fragment-shader/main.glsl'

export default `
precision highp float;

${easing}
${noise}
${main}
`
