// now we're in the emit hook so we get the records
// we also get each of the entries from assets
// take each entry's contents and run reshape on it, transforming the script tag to the outputs
const Util = require('spike-util')
const reshape = require('reshape')
const reshapeReplacePlugin = require('./reshape_replace_plugin')
const {filter, map} = require('objectfn')

module.exports = class RewriteAssetsPlugin {
  constructor (options) {
    Object.assign(this, options)
  }

  apply (compiler) {
    this.util = new Util(compiler.options)

    compiler.plugin('emit', (compilation, done) => {
      // get the webpack manifest source (this will be inlined)
      const manifest = compilation.assets['manifest.js']._value

      // gets the chunk ids that are part of each entrypoint (minus manifest)
      const entryChunks = Object.keys(compiler.options.entry).reduce((m, e) => {
        m[e] = compilation.entrypoints[e].chunks
          .filter((c) => c.name !== 'manifest')
          .map((c) => c.id)
        return m
      }, {})

      // get the sources of all the html pages to be scanned for replacement
      const htmlOutputs = filter(compilation.assets, (v, k) => {
        return k.match(/\.html$/)
      })

      const sources = map(htmlOutputs, (v) => String(v.source()))

      promiseMapObj(sources, (k, src) => {
        return reshape({
          plugins: [reshapeReplacePlugin(entryChunks, manifest)]
        }).process(src)
          .then((res) => {
            const html = res.output()
            compilation.assets[k] = {
              source: () => html,
              size: () => html.length
            }
          })
      }).then(() => { done() })
    })
  }
}

function promiseMapObj (obj, cb) {
  const promises = []
  const results = {}
  map(obj, (v, k) => {
    promises.push(cb(k, v).then((res) => {
      results[k] = res
    }))
  })
  return Promise.all(promises).then(() => results)
}