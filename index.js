var Oreo = require('oreo')
var thunkify = require('thunkify')
var row = require('./row')
var methods = {
  main: ['execute', 'discover'],
  table: ['find', 'findOne', 'get', 'insert', 'mget', 'save'],
  row: ['hydrate', 'save', 'update']
}

module.exports = oreo

function oreo(config){
  if (!(this instanceof oreo)) {
    return new oreo(config)
  }

  var self = this
  var codb = {}

  return function(done){
    var called;

    // this callback is passed to oreo and executes after oreo initializes
    function callback(err, db){
      if (called) return;
      called = true;

      Object.keys(db).forEach(function(table) {
        if (table.substring(0, 1) === '_') return
        if (methods.main.indexOf(table) !== -1) return
        codb[table] = {}
        methods.table.forEach(function(method) {
          codb[table][method] = thunkify(db[table][method].bind(db[table]))

          console.log(table, method)
          console.log('ir1:', codb[table].instantiateRow)
          codb[table].instantiateRow = row.bind(db[table])
          console.log('ir2:', codb[table].instantiateRow)

        })
      })

      methods.main.forEach(function(method) {
        codb[method] = thunkify(db[method].bind(db))
      })

      done.call(null, err, codb);
    }

    try {
      Oreo.call(self, config, callback)
    } catch (err) {
      done(err)
    }
  }
}
