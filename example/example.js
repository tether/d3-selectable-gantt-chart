var TimelineChart = require('../main');
var chart;

var selectionInfo  = d3.select('#selection-info').append('ul');
var activitiesInfo = d3.select('#selection-info').append('dl');

var clearBrushButton = document.getElementById('clearBrush');
clearBrushButton.onclick = function clearBrush () {
  selectionInfo.html('');
  activitiesInfo.html('');
  chart.clearBrush();
};

function updateSelectionInfo (timeRange) {
  selectionInfo.html('');
  selectionInfo.append('li').text('Start date: ' + timeRange[0]);
  selectionInfo.append('li').text('End date: ' + timeRange[1]);
}

function appendItemInformation (item) {
  activitiesInfo.append('dt').text('Label: ' + item.label);
  if (item.hasOwnProperty('startedAt')) {
    activitiesInfo.append('dd').text('Bar start: ' + new Date(item.startedAt * 1000));
    activitiesInfo.append('dd').text('Bar end: ' + new Date(item.endedAt * 1000));
  } else if (item.hasOwnProperty('at')) {
    activitiesInfo.append('dd').text('At: ' + new Date(item.at * 1000));
  }
}

function updateItemsInformation (items) {
  activitiesInfo.html('');

  items.forEach(appendItemInformation);
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
    onBrush: function (timeRange) {
      updateSelectionInfo(timeRange);
    },
    onBrushEnd: function (timeRange, selectedItems) {
      updateItemsInformation(selectedItems);
    },
    onBarClicked: updateBarInfo,
    onBarChanged: updateBarInfo
  };

  chart = new TimelineChart(chartElement, data, opts);
});
