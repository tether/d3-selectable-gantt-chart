var timelineChart = require('../main');

d3.json('http://localhost:8080/sample.json', function (data) {
  var chartElement = document.getElementById('chart');
  var opts = {
    minDate: new Date(2016, 6, 6, 0, 0, 1),
    maxDate: new Date(2016, 6, 6, 23, 59, 59)
  };

  timelineChart(chartElement, data, opts);
});
