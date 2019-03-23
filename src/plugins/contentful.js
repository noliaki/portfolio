import * as contentful from 'contentful'

console.log(process.server)

export default () =>
  contentful.createClient({
    space: process.env.SPACE_ID,
    accessToken: process.env.ACCESS_TOKEN
  })
