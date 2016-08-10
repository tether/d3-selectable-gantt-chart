var OverlapDetector = require('./lib/overlap-detector');
var Bar = require('./lib/bar');

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
  opts              = opts || {};
  opts.minDate      = opts.minDate || defaultMinDate(data);
  opts.maxDate      = opts.maxDate || defaultMaxDate(data);
  opts.leftPad      = opts.leftPad || 80;
  opts.barHeight    = opts.barHeight || 25;
  opts.xAxisHeight  = opts.xAxisHeight || 60;
  opts.margin       = { top: 200, right: 40, bottom: 200, left: 40 };
  opts.width        = element.clientWidth - opts.margin.left - opts.margin.right;
  opts.onBarClicked = opts.onBarClicked || function () {};
  opts.onBarChanged = opts.onBarChanged || function () {};
  opts.onBrush      = opts.onBrush || function() {};
  opts.onBrushEnd   = opts.onBrushEnd || function() {};

  return opts;
}
var brush = d3.svg.brush();

function addBrush (height) {
  height = height || d3.select('#chart-data>#bars').attr('height');

  d3.select('#selectable-gantt-chart').append('g')
    .attr('class', 'brush')
    .attr('opacity', '.3')
    .call(brush)
    .selectAll('rect')
    .attr('height', height);
}

function removeBrush () {
  var brushSelection = d3.select('#selectable-gantt-chart .brush');
  brushSelection.call(brush.clear());
  brushSelection.remove();
}

function disableDragging () {
  d3.select('#selectionDragComponent').remove();
}

var clearBrush = function clearBrush() {
  d3.selectAll('rect.selected').classed('selected', false);
  var brushSelection = d3.selectAll('#selectable-gantt-chart .brush');
  brushSelection.call(brush.clear());
  if (brushSelection.empty()) { addBrush(); }
  disableDragging();
};

var createChart = function createChart (element, data, opts) {
  opts               = initialize(element, data, opts);

  var labels         = extractLabels(data);
  var chartHeight    = labels.length * opts.barHeight;
  var svgHeight      = chartHeight + opts.xAxisHeight;
  var baseSVG        = d3.select(element)
                         .append('svg')
                         .attr('id', 'selectable-gantt-chart')
                         .attr('width', opts.width)
                         .attr('height', svgHeight);
  var chartData      = baseSVG.append('g').attr('id', 'chart-data');

  var timeScale = d3.time
                    .scale()
                    .domain([opts.minDate, opts.maxDate])
                    .range([opts.leftPad, opts.width])
                    .clamp(true);

  var labelsScale = d3.scale
                      .ordinal()
                      .domain(data.map(function(d) { return d.label; }))
                      .rangeRoundBands([1, chartHeight]);

  function computeBarWidth (d) {
    var startedAt = new Date(d.startedAt * 1000);
    var endedAt = new Date(d.endedAt * 1000);

    return timeScale(endedAt) - timeScale(startedAt);
  }

  function computeBarY (d) {
    return labelsScale(d.label);
  }

  function isBarClicked(bar) {
    var y = d3.mouse(d3.select('g.brush').node())[1];

    var domain = labelsScale.domain();
    var range = labelsScale.range();

    var label = domain[d3.bisect(range, y) - 1];

    return (bar.label === label);
  }

  function enableDragging (selectedData) {
    function newTimeValue (date) {
      var currentX = timeScale(date);
      var newX = currentX + d3.event.dx;

      return {
        x: newX,
        time: timeScale.invert(newX).getTime() / 1000
      };
    }

    function onDragLeft (d) {
      var bar = new Bar(d);
      var newValue = newTimeValue(new Date(d.startedAt * 1000));
      var newBar = bar.expandLeft(newValue.time);

      if (newValue.time >= bar.endedAt) { return; }
      if (OverlapDetector.isOverlapping(newBar, data)) { return; }

      d.startedAt = newValue.time;

      d3.select('rect.selected')
        .attr('x', newValue.x)
        .attr('width', computeBarWidth);

      d3.select('rect#dragLeft')
        .attr('x', newValue.x - (dragBarSize / 2));

      opts.onBarChanged(newBar);
    }

    function onDragRight (d) {
      var bar = new Bar(d);
      var newValue = newTimeValue(new Date(d.endedAt * 1000));
      var newBar = bar.expandRight(newValue.time);

      if (newValue.time <= d.startedAt) { return; }
      if (OverlapDetector.isOverlapping(newBar, data)) { return; }

      d.endedAt = newValue.time;

      d3.select('rect.selected')
        .attr('width', computeBarWidth);

      d3.select('rect#dragRight')
        .attr('x', newValue.x - (dragBarSize / 2));

      opts.onBarChanged(newBar);
    }

    var dragLeft = d3.behavior.drag()
      .origin(Object)
      .on('drag', onDragLeft);

    var dragRight = d3.behavior.drag()
      .origin(Object)
      .on('drag', onDragRight);

    var selection = chartData.append('g')
      .attr('id', 'selectionDragComponent')
      .selectAll('rect')
      .data([selectedData])
      .enter();

    var dragBarSize = 10;

    function dragBarX (fieldName) {
      return function x (d) {
        return timeScale(new Date(d[fieldName] * 1000)) - (dragBarSize / 2);
      };
    }

    var dragBarLeft = selection.append('rect')
      .attr('x', dragBarX('startedAt'))
      .attr('y', computeBarY)
      .attr('height', opts.barHeight)
      .attr('width', dragBarSize)
      .attr('id', 'dragLeft')
      .attr('fill', 'blue')
      .attr('fill-opacity', 0.3)
      .attr('cursor', 'ew-resize')
      .call(dragLeft);

    var dragBarRight = selection.append('rect')
      .attr('x', dragBarX('endedAt'))
      .attr('y', computeBarY)
      .attr('height', opts.barHeight)
      .attr('width', dragBarSize)
      .attr('id', 'dragRight')
      .attr('fill', 'blue')
      .attr('fill-opacity', 0.3)
      .attr('cursor', 'ew-resize')
      .call(dragRight);

      removeBrush();
  }

  function brushed () {
    if (d3.select('.brush').empty()) { // FIXME brush events are being triggered when removing the brush element
      console.warn('brush has been removed, skipping brushed event listener...');
      return;
    }

    var timeRange  = brush.extent();
    var rects       = d3.selectAll('rect.bar');
    var brushStart = Math.floor(timeRange[0].getTime() / 1000);
    var brushEnd   = Math.floor(timeRange[1].getTime() / 1000);

    rects.each(function (bar) {
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
        if (brush.empty()) {
          bar.selected = isBarClicked(bar);
        } else {
          bar.selected = true;
        }
      }
    });


    rects.classed('selected', function (bar) {
      return bar.selected;
    });

    var selection = d3.selectAll('rect.selected');

    if (brush.empty()) {
      if (!selection.empty()) {
        var selectedData = selection.data()[0];
        opts.onBarClicked(selectedData);
        enableDragging(selectedData);
      }
    } else {
      opts.onBrush(timeRange, selection.data());
    }
  }

  function brushEnded () {
    if (d3.select('.brush').empty()) { // FIXME brush events are being triggered when removing the brush element
      console.warn('brush has been removed, skipping brushend event listener...');
      return;
    }

    if (!brush.empty()) {
      opts.onBrushEnd(brush.extent(), d3.selectAll('rect.selected').data());
    }
  }

  brush.x(timeScale).on('brush', brushed);
  brush.x(timeScale).on('brushend', brushEnded);

  function rectClicked (d) {
    var rects = d3.selectAll('rect.bar');

    rects.each(function (bar) {
      bar.selected = bar === d;
    });

    rects.classed('selected', function (bar) {
      return bar.selected;
    });

    if (!d3.select('#selectionDragComponent').empty()) {
      disableDragging();
    }

    enableDragging(d);
    opts.onBarClicked(d);
  }

  var xAxisOffset = chartHeight + 10;
  var xAxis = d3.svg.axis()
                    .ticks(d3.time.hours, 1)
                    .scale(timeScale)
                    .tickSize(xAxisOffset * -1, 0, 0);

  var yAxis = d3.svg.axis()
                    .tickPadding([10])
                    .orient('right')
                    .scale(labelsScale);

  addBrush(chartHeight);

  chartData.append('g')
           .attr('class', 'xaxis')
           .attr('transform', 'translate(0,' + xAxisOffset + ')')
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
           .attr('id', 'bars')
           .attr('height', chartHeight)
           .selectAll('rect')
           .data(data)
           .enter()
           .append('rect')
           .on('click', rectClicked)
           .attr('class', 'bar')
           .attr('x', function (d) {
             return timeScale(new Date(d.startedAt * 1000));
           })
           .attr('y', computeBarY)
           .attr('height', opts.barHeight)
           .attr('width', computeBarWidth);
};

module.exports = {
  create: createChart,
  clearBrush: clearBrush
};
