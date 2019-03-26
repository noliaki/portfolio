<template lang="pug">
  main
    article.inner.content
      div
        img(src="/img/noriaki-yamada.jpg", alt="Noriaki Yamada")
      p 山田 典明 | Noriaki Yamada
      p 札幌生まれ
      p フロントエンドエンジニア
      p @noliaki
      .sns
        div
          a(href="https://twitter.com/noliaki", target="_blank", rel="noopener noreferer")
            img(src="/img/logo-twitter.svg", alt="Twitter")
        div
          a(href="https://github.com/noliaki", target="_blank", rel="noopener noreferer")
            img(src="/img/logo-github.svg", alt="GitHub")
</template>
<style lang="stylus" scoped>
article
  padding 2em 1em
  text-align center
  background-color rgba(#fff, 0.8)

.sns
  display flex
  justify-content center

  > div + div
    margin-left 20px


  img
    width 40px
    height auto
</style>
