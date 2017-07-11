// get names of entries, save them away
// inject a reshape plugin that scans files and uses entries to detect when there's a script include
// now we're in the emit hook so we get the records
// we also get each of the entries from assets
// take each entry's contents and run reshape on it, transforming the script tag to the outputs
const Util = require('spike-util')
const reshapeScanPlugin = require('./reshape_scan_plugin')

module.exports = class RewriteAssetsPlugin {
  constructor (options) {
    Object.assign(this, options)
  }

  apply (compiler) {
    this.util = new Util(compiler.options)
    // get reshape opts, ensure plugin key
    const reshapeOpts = this.util.getSpikeOptions().reshape
    if (!reshapeOpts.plugins) reshapeOpts.plugins = []
    // add the scan plugin, it will return its matches here
    this.matches = {}
    reshapeOpts.plugins.push(reshapeScanPlugin(compiler, this.matches))
    compiler.plugin('emit', (compilation, done) => {
      console.log(this.matches)
      done()
    })
  }
}
