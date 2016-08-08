var timelineChart = require('../main');

var selectionInfo  = d3.select('#selection-info').append('ul');
var activitiesInfo = d3.select('#selection-info').append('dl');

var clearBrushButton = document.getElementById('clearBrush');
clearBrushButton.onclick = function clearBrush () {
  selectionInfo.html('');
  activitiesInfo.html('');
  timelineChart.clearBrush();
};

function updateSelectionInfo (timeRange) {
  selectionInfo.html('');
  selectionInfo.append('li').text('Start date: ' + timeRange[0]);
  selectionInfo.append('li').text('End date: ' + timeRange[1]);
}

function appendBarInformation (bar) {
  activitiesInfo.append('dt').text('Label: ' + bar.label);
  activitiesInfo.append('dd').text('Bar start: ' + new Date(bar.startedAt * 1000));
  activitiesInfo.append('dd').text('Bar end: ' + new Date(bar.endedAt * 1000));
}

function updateBarsInformation (bars) {
  activitiesInfo.html('');

  bars.forEach(appendBarInformation);
}

function updateBarInfo (bar) {
  activitiesInfo.html('');
  selectionInfo.html('');
  appendBarInformation(bar);
}

d3.json('http://localhost:8080/sample.json', function (data) {
  var chartElement = document.getElementById('chart');
  var opts = {
    minDate: new Date(2016, 6, 6, 0, 0, 1),
    maxDate: new Date(2016, 6, 6, 23, 59, 59),
    onBrush: function (timeRange, selectedBars) {
      updateSelectionInfo(timeRange);
    },
    onBrushEnd: function (timeRange, selectedBars) {
      updateBarsInformation(selectedBars);
    },
    onBarClicked: updateBarInfo,
    onBarChanged: updateBarInfo
  };

  timelineChart.create(chartElement, data, opts);
});
