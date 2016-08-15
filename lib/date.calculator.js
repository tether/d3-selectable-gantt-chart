var _ = require('lodash');

function toDate (timeInSeconds) {
  return new Date(timeInSeconds * 1000);
}

module.exports = {
  minDate: function (data) {
    return _.min(data.map(function (d) {
      return toDate(d.startedAt || d.at);
    }));
  },
  maxDate: function (data) {
    return _.max(data.map(function (d) {
      return toDate(d.endedAt || d.at);
    }));
  }
};
