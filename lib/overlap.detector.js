function byLabel (label) {
  return function (obj) {
    return obj.label === label;
  };
}

function unselected (obj) {
  return obj.selected !== true;
}

function isOverlapping (bar, data) {
  var siblings = data.filter(byLabel(bar.label)).filter(unselected);

  var overlappingBars = siblings.filter(function (sibling) {
    return (sibling.startedAt > bar.startedAt && sibling.startedAt < bar.endedAt) ||
            (sibling.endedAt > bar.startedAt && sibling.endedAt < bar.endedAt);
  });

  return overlappingBars.length > 0;
};

module.exports = {
  isOverlapping: isOverlapping
};
