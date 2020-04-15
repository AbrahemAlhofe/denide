const glob = require('glob');
const path = require('path')

function entries (mode) {
  // add default root for both webpack and front / back sources
  const root = ( mode === 'entry' ) ? './pages/**/' : `./dist/${mode}/`

  const entries = {}

  for ( let filePath of glob.sync(root + '*.js') ) {
    let entry = ( mode === 'entry' ) ? filePath.split('/')[2] : path.basename(filePath).split('.')[0]
    entries[entry] = filePath
  }

  return entries
}

module.exports = entries
