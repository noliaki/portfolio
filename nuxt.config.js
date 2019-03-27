import * as fs from 'fs'
import TerserPlugin from 'terser-webpack-plugin'
import * as contentful from 'contentful'
import pkg from './package'

const client = contentful.createClient({
  space: process.env.SPACE_ID || require('./env.json').SPACE_ID,
  accessToken: process.env.ACCESS_TOKEN || require('./env.json').ACCESS_TOKEN
})

const config = {
  mode: 'universal',

  /*
   ** Headers of the page
   */
  head: {
    htmlAttrs: {
      lang: 'ja'
    },
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },

  /*
   ** Global CSS
   */
  css: ['normalize.css', '@/assets/style.styl'],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    {
      src: '~/plugins/pixi',
      mode: 'client'
    },
    {
      src: '~/plugins/gsap',
      mode: 'client'
    }
  ],

  /*
   ** Nuxt.js modules
   */
  modules: ['@nuxtjs/pwa'],

  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }

      if (ctx.isClient) {
        if (!config.optimization.minimizer) {
          config.optimization.minimizer = []
        }

        config.optimization.minimizer.push(
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: process.env.NODE_ENV === 'production'
              }
            }
          })
        )
      }
    }
  },
  srcDir: 'src/',
  router: {
    base: '/'
  },
  generate: {
    dir: 'dist'
  },
  transition: 'page'
}

;(async () => {
  const { items } = await client.getEntries({
    content_type: 'product',
    order: '-sys.createdAt'
  })

  fs.writeFileSync(
    `${config.srcDir}static/product-entries.json`,
    JSON.stringify(items)
  )
})()

export default config
