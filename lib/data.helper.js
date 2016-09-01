var _ = require('lodash');

module.exports = {
  labels: function extractLabels (data) {
    var labels = [];

    if (data.labels) {
       labels = _.concat(labels, _.map(data.labels, 'name'));
    }

    if (data.events) {
      var eventsLabels = data.events.map(function (d) { return d.label; });
      labels = _.concat(labels, eventsLabels);
    }

    return _.uniq(labels);
  }
};
