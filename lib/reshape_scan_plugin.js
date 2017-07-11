const util = require('reshape-plugin-util')

module.exports = function reshapeScanAssets (compiler, matches) {
  return function scanAssetsPlugin (tree, options) {
    return util.modifyNodes(tree, (node) => {
      return node.type === 'tag' && node.name === 'script'
    }, (node) => {
      if (!node.attrs.src) return node
      // TODO: handle multi nodes
      const scriptPath = node.attrs.src[0].content
      const webpackOutputs = Object.keys(compiler.options.entry).map((e) => {
        return `${e}.js`
      })
      const match = webpackOutputs.filter((out) => {
        return scriptPath.match(new RegExp(`${out}$`))
      })[0]
      if (match) {
        // create key for the filename if needed
        if (!matches[options.filename]) matches[options.filename] = []
        // add our matched asset path
        matches[options.filename].push(match)
      }
      return node
    })
  }
}
