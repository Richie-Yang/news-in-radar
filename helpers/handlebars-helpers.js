const moment = require('moment')

module.exports = {
  ifCond: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  },

  fromNow: (a) => moment(a).fromNow(),

  currentYear: () => moment().format('YYYY')
}