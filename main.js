var OverlapDetector = require('./lib/overlap-detector');
var Bar = require('./lib/bar');
var DateCalculator = require('./lib/date.calculator');
var DataHelper = require('./lib/data.helper');
var Tooltip = require('./lib/tooltip');

function TimelineChart (element, data, opts) {
  function initialize (element, events, opts) {
    opts              = opts || {};
    opts.minDate      = opts.minDate || DateCalculator.minDate(events);
    opts.maxDate      = opts.maxDate || DateCalculator.maxDate(events);
    opts.leftPad      = opts.leftPad || 80;
    opts.barHeight    = opts.barHeight || 25;
    opts.barPadding   = opts.barPadding || 5;
    opts.barRoundSize = opts.barRoundSize || 10;
    opts.xAxisHeight  = opts.xAxisHeight || 60;
    opts.margin       = { top: 200, right: 40, bottom: 200, left: 40 };
    opts.width        = element.clientWidth - opts.margin.left - opts.margin.right;
    opts.onBarClicked = opts.onBarClicked || function () {};
    opts.onBarChanged = opts.onBarChanged || function () {};

    return opts;
  }

  opts = initialize(element, data.events, opts);

  var labels         = DataHelper.labels(data);
  var events         = data.events;
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
                      .domain(labels)
                      .rangeRoundBands([1, chartHeight]);

  function computeBarWidth (d) {
    var startedAt = new Date(d.startedAt * 1000);
    var endedAt = new Date(d.endedAt * 1000);

    return timeScale(endedAt) - timeScale(startedAt);
  }

  function computeBarY (d) {
    return labelsScale(d.label) + opts.barPadding;
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
      if (OverlapDetector.isOverlapping(newBar, events)) { return; }

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
      if (OverlapDetector.isOverlapping(newBar, events)) { return; }

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

    var dragBarHeight = opts.barHeight - (opts.barPadding * 2);

    var dragBarLeft = selection.append('rect')
      .attr('x', dragBarX('startedAt'))
      .attr('y', computeBarY)
      .attr('height', dragBarHeight)
      .attr('width', dragBarSize)
      .attr('id', 'dragLeft')
      .attr('fill', 'blue')
      .attr('fill-opacity', 0.3)
      .attr('cursor', 'ew-resize')
      .call(dragLeft);

    var dragBarRight = selection.append('rect')
      .attr('x', dragBarX('endedAt'))
      .attr('y', computeBarY)
      .attr('height', dragBarHeight)
      .attr('width', dragBarSize)
      .attr('id', 'dragRight')
      .attr('fill', 'blue')
      .attr('fill-opacity', 0.3)
      .attr('cursor', 'ew-resize')
      .call(dragRight);
  }

  function rectClicked (d) {
    if (!DataHelper.isEditable(d.label, data)) { return; }

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

  function disableDragging () {
    d3.select('#selectionDragComponent').remove();
  }

  this.clear = function clear() {
    d3.selectAll('.selected').classed('selected', false);
    disableDragging();
  };

  function createChart (element, events, opts) {
    var xAxisOffset = chartHeight + 10;
    var xAxis = d3.svg.axis()
                      .ticks(d3.time.hours, 1)
                      .scale(timeScale)
                      .tickSize(xAxisOffset * -1, 0, 0);

    var yAxis = d3.svg.axis()
                      .tickPadding([10])
                      .orient('right')
                      .scale(labelsScale);

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

    var chartDataGroup = chartData.append('g').attr('height', chartHeight);

    function intervals (d) {
      return d.hasOwnProperty('startedAt');
    }

    function instances (d) {
      return d.hasOwnProperty('at');
    }

    function rectClass (d) {
      return 'bar ' + (DataHelper.isEditable(d.label, data) ? 'editable' : 'readonly');
    }

    var tip = Tooltip.create();
    baseSVG.call(tip);

    chartDataGroup
      .selectAll('rect')
      .data(events.filter(intervals))
      .enter()
      .append('rect')
      .on('click', rectClicked)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
      .attr('class', rectClass)
      .attr('x', function (d) {
        return timeScale(new Date(d.startedAt * 1000));
      })
      .attr('y', computeBarY)
      .attr('rx', opts.barRoundSize)
      .attr('ry', opts.barRoundSize)
      .attr('height', opts.barHeight - (opts.barPadding * 2))
      .attr('width', computeBarWidth);


    chartDataGroup
      .selectAll('circle')
      .data(events.filter(instances))
      .enter()
      .append('circle')
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
      .attr('class', 'instance')
      .attr('cx', function (d) {
        return timeScale(new Date(d.at * 1000));
      })
      .attr('cy', function (d) {
        return labelsScale(d.label) + opts.barHeight / 2;
      })
      .attr('r', 2);
  }

  createChart(element, events, opts);
}

module.exports = TimelineChart;
