function toDate (timeInSeconds) {
  return new Date(timeInSeconds * 1000);
}

function defaultTooltip (d) {
  if (d.hasOwnProperty('at')) {
    return 'at: ' + toDate(d.at);
  } else {
    return 'from ' + toDate(d.startedAt) + ' to ' + toDate(d.endedAt);
  }
}

function tipHtml (d) {
  return d.tooltip || defaultTooltip(d);
}

function create (d) {
  return d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(tipHtml);
}

module.exports = {
  create: create
};
