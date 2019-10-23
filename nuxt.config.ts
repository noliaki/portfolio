import * as fs from 'fs'
import { Configuration } from '@nuxt/types'
// import webpack from 'webpack'

import TerserPlugin from 'terser-webpack-plugin'
import * as contentful from 'contentful'
import pkg from './package.json'

const client: contentful.ContentfulClientApi = contentful.createClient({
  space: process.env.SPACE_ID || require('./env.json').SPACE_ID,
  accessToken: process.env.ACCESS_TOKEN || require('./env.json').ACCESS_TOKEN
})

const config: Configuration = {
  mode: 'universal',

  /*
   ** Headers of the page
   */
  head: {
    htmlAttrs: {
      lang: 'ja'
    },
    title: pkg.name,
    titleTemplate: '%s | Noriaki Yamada',
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
    // {
    //   src: '~/plugins/WebGlBase',
    //   mode: 'client'
    // },
    // {
    //   src: '~/plugins/Square',
    //   mode: 'client'
    // },
    // {
    //   src: '~/plugins/load-image',
    //   mode: 'client'
    // }
  ],

  /*
   ** Nuxt.js modules
   */
  modules: ['@nuxtjs/pwa'],
  buildModules: ['@nuxt/typescript-build'],
  manifest: {
    name: 'noliaki portfolio',
    lang: 'ja',
    theme_color: '#2196f3',
    background_color: '#2196f3',
    display: 'standalone',
    Scope: '/',
    start_url: '/',
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png'
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png'
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png'
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png'
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png'
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    splash_pages: null
  },

  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config: any, ctx) {
      config.module.rules.push({
        test: /\.glsl$/,
        loader: 'raw-loader'
      })

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
  pageTransition: 'page',
  hooks: {
    async ready(nuxt: any): Promise<void> {
      const productItems: contentful.EntryCollection<
        any
      > = await client.getEntries({
        content_type: 'product',
        order: '-sys.createdAt'
      })

      const bgImages: contentful.EntryCollection<any> = await client.getEntries(
        {
          content_type: 'backgroundImage',
          order: 'sys.id'
        }
      )

      // const noImages: contentful.EntryCollection<any> = await client.getEntries(
      //   {
      //     content_type: 'noImage'
      //   }
      // )

      const about: contentful.EntryCollection<any> = await client.getEntries({
        content_type: 'about'
      })

      return new Promise((resolve: () => void): void => {
        fs.writeFileSync(
          `${nuxt.options.srcDir}/static/product-entries.json`,
          JSON.stringify(productItems.items)
        )

        fs.writeFileSync(
          `${nuxt.options.srcDir}/static/background-entries.json`,
          JSON.stringify(bgImages.items)
        )

        // fs.writeFileSync(
        //   `${nuxt.options.srcDir}/static/noImage-entries.json`,
        //   JSON.stringify(noImages.items)
        // )

        fs.writeFileSync(
          `${nuxt.options.srcDir}/static/about.json`,
          JSON.stringify(about.items[0])
        )

        resolve()
      })
    }
  }
}

export default config
