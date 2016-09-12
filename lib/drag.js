var Bar = require('./bar');
var OverlapDetector = require('./overlap.detector');

module.exports.enable = function (chartDataElement, opts, scales, selectedData, events) {
  function newTimeValue (date) {
    var currentX = scales.xScale(date);
    var newX = currentX + d3.event.dx;

    return {
      x: newX,
      time: scales.xScale.invert(newX).getTime() / 1000
    };
  }

  function onDragLeft (d) {
    var bar = new Bar(d);
    var newValue = newTimeValue(new Date(d.startedAt * 1000));
    var newBar = bar.expandLeft(newValue.time);

    if (newValue.time >= bar.endedAt) { return; }
    if (OverlapDetector.isOverlapping(newBar, events)) { return; }

    d.startedAt = newBar.startedAt;

    d3.select('rect.selected')
      .attr('x', newValue.x)
      .attr('width', scales.computeBarWidth);

    d3.select('#dragLeft')
      .attr('cx', newValue.x);

    opts.onBarChanged(newBar);
  }

  function onDragRight (d) {
    var bar = new Bar(d);
    var newValue = newTimeValue(new Date(d.endedAt * 1000));
    var newBar = bar.expandRight(newValue.time);

    if (newValue.time <= d.startedAt) { return; }
    if (OverlapDetector.isOverlapping(newBar, events)) { return; }

    d.endedAt = newBar.endedAt;

    d3.select('rect.selected')
      .attr('width', scales.computeBarWidth);

    d3.select('#dragRight')
      .attr('cx', newValue.x);

    opts.onBarChanged(newBar);
  }

  function onDragWhole (d) {
    var bar = new Bar(d);
    var newValue = newTimeValue(new Date(d.startedAt * 1000));
    var newBar = bar.move(newValue.time);
    var maxDateInSeconds = opts.maxDate.getTime() / 1000;

    if (newBar.endedAt > maxDateInSeconds) { return; }
    if (OverlapDetector.isOverlapping(newBar, events)) { return; }

    d.startedAt = newBar.startedAt;
    d.endedAt = newBar.endedAt;

    var rectWidth = scales.computeBarWidth(d);
    d3.select('rect.selected')
      .attr('x', newValue.x)
      .attr('width', rectWidth);

    d3.select('#dragLeft')
      .attr('cx', newValue.x);

    d3.select('#dragRight')
      .attr('cx', newValue.x  + rectWidth);

    opts.onBarChanged(newBar);
  }

  function onDragEnd (d) {
    opts.onBarEdited(new Bar(d));
  }

  var dragWhole = d3.behavior.drag()
    .origin(Object)
    .on('drag', onDragWhole)
    .on('dragend', onDragEnd);

  var dragLeft = d3.behavior.drag()
    .origin(Object)
    .on('drag', onDragLeft)
    .on('dragend', onDragEnd);

  var dragRight = d3.behavior.drag()
    .origin(Object)
    .on('drag', onDragRight)
    .on('dragend', onDragEnd);

    var selection = chartDataElement.append('g')
      .attr('id', 'selectionDragComponent')
      .selectAll('circle')
      .data([selectedData]);

  d3.select('rect.selected')
    .attr('cursor', 'move')
    .call(dragWhole);

  function dragBarX (fieldName) {
    return function x (d) {
      return scales.xScale(new Date(d[fieldName] * 1000));
    };
  }

  var dragBarHeight = opts.barHeight - (opts.barPadding * 2);
  var dragBarSize = 8;

  function appendDragHandle (selection) {
    return selection.enter().append('circle')
      .attr('cy', function (d) {
        var y = scales.computeBarHeight(d);
        return y + (dragBarHeight / 2);
      })
      .attr('r', dragBarSize)
      .attr('fill', 'white')
      .attr('stroke', 'black')
      .attr('stroke-width', '5px')
      .attr('cursor', 'ew-resize');
  }

  var dragBarLeft = appendDragHandle(selection)
    .attr('cx', dragBarX('startedAt'))
    .attr('id', 'dragLeft')
    .call(dragLeft);

  var dragBarRight = appendDragHandle(selection)
    .attr('cx', dragBarX('endedAt'))
    .attr('id', 'dragRight')
    .call(dragRight);
};

module.exports.disable = function () {
  var dragComponentSelection = d3.select('#selectionDragComponent');
  if (!dragComponentSelection.empty()) {
    dragComponentSelection.remove();
  }

  d3.selectAll('#chart-data .bar')
    .attr('cursor', 'auto')
    .on('.drag', null);
};
