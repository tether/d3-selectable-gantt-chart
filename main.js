var TWENTY_FOUR_HS_IN_SEC = 86400;
var MARGIN = {top: 200, right: 40, bottom: 200, left: 40};
var WIDTH = 960 - MARGIN.left - MARGIN.right;
var BAR_HEIGHT = 25;
var LEFT_PAD = 80;

function extractActivityTypes (data) {
  function unique (value, index, array) {
    return array.indexOf(value) === index;
  }

  return data.map(function (d) { return d.label; })
             .filter(unique);
}

var createChart = function (data) {
  var activityTypes = extractActivityTypes(data);
  var baseSVG = d3.select('#chart')
                  .append('svg')
                  .attr('width', WIDTH);
  var chartData = baseSVG.append('g').attr('id', 'chart-data');

  var chartHeight = activityTypes.length * BAR_HEIGHT;
  var selectionInfo = d3.select('#selection-info').append('ul');
  var activitiesInfo = d3.select('#selection-info').append('dl');

  function updateSelectionInfo (timeRange) {
    selectionInfo.html('');
    selectionInfo.append('li').text('Start date: ' + timeRange[0]);
    selectionInfo.append('li').text('End date: ' + timeRange[1]);
  }

  function updateActivitiesInfo (bars) {
    function isSelected (bar) { return bar.selected; }
    activitiesInfo.html('');

    bars.filter(isSelected).each(function (bar) {
      activitiesInfo.append('dt').text('Activity type: ' + bar.label);
      activitiesInfo.append('dd').text(bar);
    });
  }

  function brushed () {
    var timeRange = brush.extent();
    var bars = d3.selectAll('rect.bar');
    var brushStart = Math.floor(timeRange[0].getTime() / 1000);
    var brushEnd = Math.floor(timeRange[1].getTime() / 1000);

    updateSelectionInfo(timeRange);

    bars.each(function (bar) {
      bar.selected = false;

      function brushStartInsideBar () {
        return brushStart > bar.startedAt && brushStart < bar.endedAt;
      }

      function brushEndInsideBar () {
        return brushEnd > bar.startedAt && brushEnd < bar.endedAt;
      }

      function barInsideBrush () {
        return brushStart < bar.startedAt && brushEnd > bar.endedAt;
      }

      if (brushStartInsideBar() || brushEndInsideBar() || barInsideBrush()) {
        bar.selected = true;
      }
    });

    updateActivitiesInfo(bars);

    bars.classed('selected', function (bar) {
     return bar.selected;
    });
  }

  // TODO use actual dates coming from a filter in the page
  var timeScaler = d3.time
                     .scale()
                     .domain([new Date('2016-07-06 00:00:01'), new Date('2016-07-06 23:59:59')])
                     .range([LEFT_PAD, WIDTH]);

  var valueScale = d3.scale
                     .linear()
                     .domain([0, TWENTY_FOUR_HS_IN_SEC])
                     .range([0, WIDTH]);

  var activitiesScale = d3.scale
                          .ordinal()
                          .domain(data.map(function(d) { return d.label; }))
                          .rangeRoundBands([1, chartHeight]);

  var brush = d3.svg.brush();
  brush.x(timeScaler).on('brush', brushed);

  var xAxis = d3.svg.axis()
                    .ticks(d3.time.hours, 2)
                    .scale(timeScaler);

  var yAxis = d3.svg.axis()
                    .tickPadding([10])
                    .orient('right')
                    .scale(activitiesScale);

  baseSVG.append('g').attr('class', 'brush')
                     .attr('opacity', '.3')
                     .call(brush)
                     .selectAll('rect')
                     .attr('height', chartHeight);

  chartData.append('g')
       .attr('class', 'xaxis')
       .attr('transform', 'translate(0,' + (chartHeight + 10) + ')')
       .call(xAxis);

  chartData.append('g')
       .attr('class', 'yaxis')
       .attr('transform', 'translate(0, 0)')
       .call(yAxis);

  chartData.selectAll('.yaxis line')
       .attr('stroke', 'black')
       .attr('x1', 0)
       .attr('x2', WIDTH)
       .attr('y1', (BAR_HEIGHT / 2) - 1)
       .attr('y2', (BAR_HEIGHT / 2) - 1);

  chartData.append('g')
       .selectAll('rect')
       .data(data)
       .enter()
       .append('rect')
       .attr('class', 'bar')
       .attr('x', function (d) {
         return timeScaler(new Date(d.startedAt * 1000));
       })
       .attr('y', function (d) {
         var activityType = d.label;
         return activityTypes.indexOf(activityType) * BAR_HEIGHT;
       })
       .attr('height', BAR_HEIGHT)
       .attr('width', function (d) {
         return valueScale(d.endedAt - d.startedAt);
       });
};

module.exports = createChart;
