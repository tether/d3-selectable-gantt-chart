var timelineChart = require('../main');

d3.json('http://localhost:8080/sample.json', function (data) {
  var chartElement = document.getElementById('chart');
  var opts = {
    minDate: new Date('2016-07-06 00:00:01'),
    maxDate: new Date('2016-07-06 23:59:59')
  };

 timelineChart(chartElement, data, opts);
});
