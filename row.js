var thunkify = require('thunkify')

module.exports = function instantiateRow(data) {
  var self = this
  var row = new Row(data, self)

  row.update = thunkify(row.update)

  console.log('row:')

  return row
}
