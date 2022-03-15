const moment = require('moment')

module.exports = {
  ifCond: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  },

  moment: a => moment(a).format('YYYY/MM/DD'),
  fromNow: a => moment(a).fromNow(),
  currentYear: () => moment().format('YYYY')
}
