function byLabel (label) {
  return function (obj) {
    return obj.label === label;
  };
}

function isOverlapping (bar, data) {
  var siblings = data.filter(byLabel(bar.label));

  var overlappingBars = siblings.filter(function (sibling) {
    return sibling.selected !== true &&
           ((sibling.startedAt > bar.startedAt && sibling.startedAt < bar.endedAt) ||
            (sibling.endedAt > bar.startedAt && sibling.endedAt < bar.endedAt))
  });

  return overlappingBars.length > 0;
};

module.exports = {
  isOverlapping: isOverlapping
};
