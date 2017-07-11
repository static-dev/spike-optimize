const webpack = require('webpack')
const RewriteAssetsPlugin = require('./rewrite_assets_plugin')

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

  if (opts.minify) {
    res.push(new webpack.optimize.UglifyJsPlugin())
  }

  if (opts.aggressiveSplitting || opts.hashNaming) {
    res.push(new webpack.optimize.CommonsChunkPlugin({ names: ['manifest'] }))
    res.push(new RewriteAssetsPlugin())
  }

  // publish spike-util update
  // make output name configurable in spike-core
  // on hashNaming, mod output to be [name].[chunkhash].js, or instruct user on how to do this manually if not possible from the plugin

  return res
}
