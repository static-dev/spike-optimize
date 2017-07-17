const Util = require('spike-util')
const reshape = require('reshape')
const reshapeReplacePlugin = require('./reshape_replace_plugin')
const {filter, map} = require('objectfn')

module.exports = class RewriteAssetsPlugin {
  apply (compiler) {
    this.util = new Util(compiler.options)
    // Switch output naming to use a hash for long term cacheing
    compiler.options.output.filename = '[name].[chunkhash].js'

    compiler.plugin('emit', (compilation, done) => {
      // gets the chunk ids that are part of each entrypoint (minus manifest)
      let manifestName
      const entryChunks = Object.keys(compiler.options.entry).reduce((m, e) => {
        m[e] = compilation.entrypoints[e].chunks
          .filter((c) => {
            if (c.name === 'manifest') {
              manifestName = `${c.name || c.id}.${c.renderedHash || c.hash}.js`
              return false
            } else {
              return true
            }
          })
          // https://github.com/webpack/webpack/blob/ab2270263e9af5b0dd83e454c20ab3aa1797424a/lib/TemplatedPathPlugin.js#L56
          // TODO: use this exact function instead, if we can
          .map((c) => `${c.name || c.id}.${c.renderedHash || c.hash}`)
        return m
      }, {})

      // get the webpack manifest source (this will be inlined)
      const manifest = compilation.assets[manifestName].source()

      // get the sources of all the html pages to be scanned for replacement
      const htmlOutputs = filter(compilation.assets, (v, k) => {
        return k.match(/\.html$/)
      })

      const sources = map(htmlOutputs, (v) => String(v.source()))

      // run reshape on each html file to scan for asset includes that need
      // to be replaced, and replace any script paths coming from webpack
      promiseMapObj(sources, (k, src) => {
        return reshape({
          plugins: [reshapeReplacePlugin(entryChunks, manifest)]
        }).process(src)
          .then((res) => {
            // replace old asset with the processed/replaced version
            const html = res.output()
            compilation.assets[k] = {
              source: () => html,
              size: () => html.length
            }
          })
      }).then(() => {
        // remove the manifest standalone, since we inline it
        delete compilation.assets[manifestName]
        // that's all!
        done()
      }).catch(done)
    })
  }
}

// Small utility for mapping through an object with promise values
function promiseMapObj (obj, cb) {
  const promises = []
  const results = {}
  map(obj, (v, k) => {
    promises.push(cb(k, v).then((res) => { results[k] = res }))
  })
  return Promise.all(promises).then(() => results)
}
