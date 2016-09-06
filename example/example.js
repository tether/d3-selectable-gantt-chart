var TimelineChart = require('../main');
var chart;

var selectionInfo  = d3.select('#selection-info').append('ul');
var activitiesInfo = d3.select('#selection-info').append('dl');

var clearButton = document.getElementById('clear');
clearButton.onclick = function clear () {
  selectionInfo.html('');
  activitiesInfo.html('');
  chart.clear();
};

function appendItemInformation (item) {
  activitiesInfo.append('dt').text('Label: ' + item.label);
  if (item.hasOwnProperty('startedAt')) {
    activitiesInfo.append('dd').text('Bar start: ' + new Date(item.startedAt * 1000));
    activitiesInfo.append('dd').text('Bar end: ' + new Date(item.endedAt * 1000));
  } else if (item.hasOwnProperty('at')) {
    activitiesInfo.append('dd').text('At: ' + new Date(item.at * 1000));
  }
}

function updateBarInfo (item) {
  activitiesInfo.html('');
  selectionInfo.html('');
  appendItemInformation(item);
}

d3.json('http://localhost:8080/sample.json', function (data) {
  var chartElement = document.getElementById('chart');
  var opts = {
    minDate: new Date(2016, 6, 6, 0, 0, 1),
    maxDate: new Date(2016, 6, 6, 23, 59, 59),
    onBarClicked: updateBarInfo,
    onBarChanged: updateBarInfo
  };

  chart = new TimelineChart(chartElement, data, opts);
});
