const util = require('reshape-plugin-util')

module.exports = function reshapeReplaceAssets (entryChunks, manifest) {
  return function replaceAssetsPlugin (tree) {
    let manifestAdded = false

    return util.modifyNodes(tree, (node) => {
      return node.type === 'tag' && node.name === 'script'
    }, (node) => {
      if (!node.attrs || !node.attrs.src) return node

      // Check if the script src matches a webpack entry name
      // TODO: handle multi nodes
      const scriptPath = node.attrs.src[0].content
      const webpackOutputs = Object.keys(entryChunks).map((e) => `${e}.js`)
      const match = webpackOutputs.filter((out) => {
        return scriptPath.match(new RegExp(`${out}$`))
      })[0]

      // If there's no match we don't need to do any processing
      if (!match) { return node }

      // If it does match, replace it with webpack-processed outputs
      const entryKey = match.replace(/\.js$/, '')
      const replacementChunks = entryChunks[entryKey]
      const res = []
      if (!manifestAdded) {
        res.push({
          type: 'tag',
          name: 'script',
          location: node.location,
          content: [{
            type: 'text',
            content: manifest
          }]
        })
        manifestAdded = true
      }
      res.push(...replacementChunks.map((id) => {
        const newNode = deepClone(node)
        newNode.attrs.src[0].content = newNode.attrs.src[0].content.replace(new RegExp(`${match}$`), `${id}.js`)
        return newNode
      }))
      return res
    })
  }
}

function deepClone (obj) {
  return JSON.parse(JSON.stringify(obj))
}
