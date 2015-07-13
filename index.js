var ngDeps = require('ng-dependencies')
var R = require('ramda')

function collectFileDep(buffer) {
  var deps = ngDeps(buffer.toString());
  return {
    buffer: buffer,
    deps: deps,
    dependencies: deps.dependencies,
    modules: R.keys(deps.modules)
  }
}

function sortDeps(depFiles){
  if(!depFiles || depFiles.length === 0){
    return []
  } else {
    var declaredModules = R.uniq(R.reduce(function(modules, dep){
      return modules.concat(dep.modules)
    }, [], depFiles))

    var groupedByDeps = R.groupBy(function(dep){
      if (0 <  R.intersection(declaredModules, dep.dependencies).length){
        return 'depended'
      } else {
        return 'independed'
      }
    }, depFiles)

    return groupedByDeps.independed.concat(sortDeps(groupedByDeps.depended))
  }
}

module.exports = function sort(buffers){
  return R.map(function(depFile){
    return depFile.buffer
  }, sortDeps(R.map(function(buffer){
    return collectFileDep(buffer)
  }, buffers)))
}
