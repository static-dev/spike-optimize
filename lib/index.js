module.exports = 'test'

// The plan:
//
// - inject reshape plugin which detects files that use the <js> wrapper (or could even not use the js wrapper and scan for processed asset paths)
// - inject webpack hoisting/splitting/commonschunk/chunkhash/etc plugins
// - mod settings to use [name].[chunkhash].js for output
// - on records hook, reshape processes files using js wrapper or that include assets using a custom plugin that replaces with the correct name and re-sets the source
// - consider inlining and minifying the commons chunk as well during this process
// - that's all!
