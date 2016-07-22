function extractLabels (data) {
  function unique (value, index, array) {
    return array.indexOf(value) === index;
  }

  return data.map(function (d) { return d.label; })
             .filter(unique);
}

function toDate (timeInSeconds) {
  return new Date(timeInSeconds * 1000);
}

function defaultMinDate (data) {
  return d3.min(data.map(function (d) {
    return toDate(d.startedAt);
  }));
}

function defaultMaxDate (data) {
  return d3.max(data.map(function (d) {
    return toDate(d.endedAt);
  }));
}

function initialize (element, data, opts) {
  opts           = opts || {};
  opts.minDate   = opts.minDate || defaultMinDate(data);
  opts.maxDate   = opts.maxDate || defaultMaxDate(data);
  opts.leftPad   = opts.leftPad || 80;
  opts.barHeight = opts.barHeight || 25;
  opts.margin    = { top: 200, right: 40, bottom: 200, left: 40 };
  opts.width     = element.clientWidth - opts.margin.left - opts.margin.right;

  return opts;
}

var createChart = function (element, data, opts) {
  opts = initialize(element, data, opts);
  var labels = extractLabels(data);
  var baseSVG = d3.select(element)
                  .append('svg')
                  .attr('width', opts.width);
  var chartData = baseSVG.append('g').attr('id', 'chart-data');

  var chartHeight = labels.length * opts.barHeight;
  var selectionInfo = d3.select('#selection-info').append('ul');
  var activitiesInfo = d3.select('#selection-info').append('dl');

  function updateSelectionInfo (timeRange) {
    selectionInfo.html('');
    selectionInfo.append('li').text('Start date: ' + timeRange[0]);
    selectionInfo.append('li').text('End date: ' + timeRange[1]);
  }

  function updateBarsInformation (bars) {
    function isSelected (bar) { return bar.selected; }
    activitiesInfo.html('');

    bars.filter(isSelected).each(function (bar) {
      activitiesInfo.append('dt').text('Label: ' + bar.label);
      activitiesInfo.append('dd').text('Bar start: ' + new Date(bar.startedAt * 1000));
      activitiesInfo.append('dd').text('Bar end: ' + new Date(bar.endedAt * 1000));
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
        return brushStart >= bar.startedAt && brushStart <= bar.endedAt;
      }

      function brushEndInsideBar () {
        return brushEnd >= bar.startedAt && brushEnd <= bar.endedAt;
      }

      function barInsideBrush () {
        return brushStart <= bar.startedAt && brushEnd >= bar.endedAt;
      }

      if (brushStartInsideBar() || brushEndInsideBar() || barInsideBrush()) {
        bar.selected = true;
      }
    });

    updateBarsInformation(bars);

    bars.classed('selected', function (bar) {
     return bar.selected;
    });
  }

  var timeScale = d3.time
                     .scale()
                     .domain([opts.minDate, opts.maxDate])
                     .range([opts.leftPad, opts.width]);

  var labelsScale = d3.scale
                      .ordinal()
                      .domain(data.map(function(d) { return d.label; }))
                      .rangeRoundBands([1, chartHeight]);

  var brush = d3.svg.brush();
  brush.x(timeScale).on('brush', brushed);

  var xAxis = d3.svg.axis()
                    .ticks(d3.time.hours, 2)
                    .scale(timeScale);

  var yAxis = d3.svg.axis()
                    .tickPadding([10])
                    .orient('right')
                    .scale(labelsScale);

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
       .attr('x2', opts.width)
       .attr('y1', opts.barHeight / 2)
       .attr('y2', opts.barHeight / 2);

  chartData.append('g')
       .selectAll('rect')
       .data(data)
       .enter()
       .append('rect')
       .attr('class', 'bar')
       .attr('x', function (d) {
         return timeScale(new Date(d.startedAt * 1000));
       })
       .attr('y', function (d) {
         return labelsScale(d.label);
       })
       .attr('height', opts.barHeight)
       .attr('width', function (d) {
         var startedAt = new Date(d.startedAt * 1000);
         var endedAt = new Date(d.endedAt * 1000);

         return timeScale(endedAt) - timeScale(startedAt);
       });
};

module.exports = createChart;
