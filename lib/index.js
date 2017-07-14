const webpack = require('webpack')
const RewriteAssetsPlugin = require('./rewrite_assets_plugin')

module.exports = function spikeOptimize (opts) {
  const res = []

  // Add scope hosting plugin if requested
  if (opts.scopeHoisting) {
    res.push(new webpack.optimize.ModuleConcatenationPlugin())
  }

  // Add aggressive splitting plugin if requested
  if (opts.aggressiveSplitting) {
    let minSize = 30000
    let maxSize = 50000
    if (Array.isArray(opts.aggressiveSplitting)) {
      minSize = opts.aggressiveSplitting[0]
      maxSize = opts.aggressiveSplitting[1]
    }
    res.push(new webpack.optimize.AggressiveSplittingPlugin({ minSize, maxSize }))
  }

  // Add minify plugin if requested
  if (opts.minify) {
    res.push(new webpack.optimize.UglifyJsPlugin())
  }

  // Always add commons chunk and rewrite assets plugin
  res.push(new webpack.optimize.CommonsChunkPlugin({ names: ['manifest'] }))
  res.push(new RewriteAssetsPlugin())

  return res
}
