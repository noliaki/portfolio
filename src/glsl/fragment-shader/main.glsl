varying vec4 vColor;
varying vec2 vUv;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D filterTexture;
uniform float uTime;
uniform float uProgress;
uniform vec2 uResolution;
uniform vec2 uNextImageResolution;
uniform vec2 uPrevImageResolution;

const float maxDelay = 0.5;
const float duration = 1.0 - maxDelay;

vec2 imageRatio(vec2 resolution, vec2 imageResolution) {
  return vec2(
    min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
    min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
  );
}

vec2 imageUv(vec2 resolution, vec2 imageResolution, vec2 uv){
  vec2 ratio = imageRatio(resolution, imageResolution);

  return vec2(
    uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    uv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
}

void main(){
  vec2 prevUv = imageUv(uResolution, uPrevImageResolution, vUv);
  vec2 uv = imageUv(uResolution, uNextImageResolution, vUv);
  float uvVol = (pow(uv.x, 2.0) + pow(1.0 - uv.y, 2.0)) / 2.0;
  float noise = snoise(vec3(uv, uTime));
  float delay = pow(sin(uvVol + noise / 10.0), 2.0);
  float progress = easeOutCubic(clamp(uProgress - delay * maxDelay, 0.0, duration) / duration);
  float revProgress = 1.0 - progress;

  float filterVol = 1.0 - pow(abs(progress * 2.0 - 1.0), 2.0);
  vec4 filterColor = texture2D(filterTexture, uv + filterVol * sign(noise));
  float filterAvgColor = sin(filterColor.r + filterColor.g + filterColor.b);

  vec4 fromColor = texture2D(texture1, prevUv + progress * filterAvgColor * filterVol * sign(noise));
  vec4 toColor = texture2D(texture2, uv + revProgress * filterAvgColor * filterVol * sign(noise));

  gl_FragColor = mix(fromColor, toColor, progress);
}
