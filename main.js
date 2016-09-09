var DateCalculator = require('./lib/date.calculator');
var DataHelper = require('./lib/data.helper');
var Drag = require('./lib/drag');
var Scales = require('./lib/scales');
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
    opts.onBrush      = opts.onBrush || function() {};
    opts.onBrushEnd   = opts.onBrushEnd || function() {};

    return opts;
  }

  opts = initialize(element, data.events, opts);

  var labels         = DataHelper.labels(data);
  var events         = data.events;
  var brush          = d3.svg.brush();
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

  var scales = new Scales(timeScale, labelsScale, opts.barPadding);

  function isBarClicked (obj) {
    var y = d3.mouse(d3.select('g.brush').node())[1];

    var domain = labelsScale.domain();
    var range = labelsScale.range();

    var label = domain[d3.bisect(range, y) - 1];

    if (!DataHelper.isEditable(obj.label, data)) { return false; }

    return (obj.label === label);
  }

  function brushBars (brushStart, brushEnd) {
    var rects = d3.selectAll('rect.bar');

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
  }

  function brushCircles (brushStart, brushEnd) {
    var circles = d3.selectAll('circle.instance');

    circles.each(function (circle) {
      if (brush.empty()) {
        // NOTE: do not allow "clicking" on an instance for now
        circle.selected = false;
      } else {
        circle.selected = circle.at >= brushStart && circle.at <= brushEnd;
      }
    });

    circles.classed('selected', function (circle) {
      return circle.selected;
    });
  }

  function brushed () {
    var timeRange  = brush.extent();
    var brushStart = Math.floor(timeRange[0].getTime() / 1000);
    var brushEnd   = Math.floor(timeRange[1].getTime() / 1000);

    brushBars(brushStart, brushEnd);
    brushCircles(brushStart, brushEnd);

    var selection = d3.selectAll('.selected');

    if (!brush.empty()) {
      opts.onBrush(timeRange, selection.data());
    }
  }

  function brushEnded () {
    if (brush.empty()) {
      var selection = d3.selectAll('.selected');
      if (!selection.empty()) {
        var selectedData = selection.data()[0];
        opts.onBarClicked(selectedData);
        Drag.enable(chartData, opts, scales, selectedData, events);
        removeBrush();
      }
    } else {
      opts.onBrushEnd(brush.extent(), d3.selectAll('.selected').data());
    }
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

    Drag.disable();
    Drag.enable(chartData, opts, scales, d, events);
    removeBrush();
    opts.onBarClicked(d);
  }

  function addBrush () {
    brush.x(timeScale)
      .on('brush', brushed)
      .on('brushend', brushEnded);

    d3.select('#selectable-gantt-chart').insert('g', ':first-child')
      .attr('class', 'brush')
      .attr('opacity', '.3')
      .call(brush)
      .selectAll('rect')
      .attr('height', chartHeight);
  }

  function removeBrush () {
    brush.x(timeScale)
      .on('brush', null)
      .on('brushend', null);

    var brushSelection = d3.select('#selectable-gantt-chart .brush');
    brushSelection.call(brush.clear());
    brushSelection.remove();
  }

  this.clearBrush = function clearBrush() {
    d3.selectAll('.selected').classed('selected', false);
    var brushSelection = d3.selectAll('#selectable-gantt-chart .brush');
    brushSelection.call(brush.clear());
    if (brushSelection.empty()) { addBrush(); }
    Drag.disable();
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

    addBrush();

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

    function propagateEventToBrush () {
      var brushNode = baseSVG.select('.brush').node();
      if (brushNode) {
        var fakeMouseEvent = new Event('mousedown');
        fakeMouseEvent.pageX = d3.event.pageX;
        fakeMouseEvent.clientX = d3.event.clientX;
        fakeMouseEvent.pageY = d3.event.pageY;
        fakeMouseEvent.clientY = d3.event.clientY;
        brushNode.dispatchEvent(fakeMouseEvent);
      }
    }

    chartDataGroup
      .selectAll('rect')
      .data(events.filter(intervals))
      .enter()
      .append('rect')
      .on('mousedown', propagateEventToBrush)
      .on('click', rectClicked)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
      .attr('class', rectClass)
      .attr('x', function (d) {
        return timeScale(new Date(d.startedAt * 1000));
      })
      .attr('y', scales.computeBarHeight)
      .attr('rx', opts.barRoundSize)
      .attr('ry', opts.barRoundSize)
      .attr('height', opts.barHeight - (opts.barPadding * 2))
      .attr('width', scales.computeBarWidth);

    chartDataGroup
      .selectAll('circle')
      .data(events.filter(instances))
      .enter()
      .append('circle')
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
      .on('mousedown', propagateEventToBrush)
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
