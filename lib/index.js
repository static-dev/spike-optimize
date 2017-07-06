const webpack = require('webpack')

module.exports = function spikeOptimize (opts) {
  const res = []

  if (opts.scopeHoisting) {
    res.push(new webpack.optimize.ModuleConcatenationPlugin())
  }

  if (opts.aggressiveSplitting) {
    let minSize = 30000
    let maxSize = 50000
    if (Array.isArray(this.aggressiveSplitting)) {
      minSize = [this.aggressiveSplitting[0]]
      maxSize = [this.aggressiveSplitting[1]]
    }
    res.push(new webpack.optimize.AggressiveSplittingPlugin({ minSize, maxSize }))
  }

  if (opts.aggressiveSplitting || opts.hashNaming) {
    res.push(new webpack.optimize.CommonsChunkPlugin({ names: ['manifest'] }))
  }

  if (opts.minify) {
    res.push(new webpack.optimize.UglifyJsPlugin())
  }

  return res
}

// The plan:
//
// - inject reshape plugin which detects files that use the <js> wrapper (or could even not use the js wrapper and scan for processed asset paths)
// - inject webpack hoisting/splitting/commonschunk/chunkhash/etc plugins
// - mod settings to use [name].[chunkhash].js for output
// - on records hook, reshape processes files using js wrapper or that include assets using a custom plugin that replaces with the correct name and re-sets the source
// - consider inlining and minifying the commons chunk as well during this process
// - that's all!
