function Scales (xScale, yScale, yPadding) {
  this.xScale = xScale;
  this.yScale = yScale;

  this.computeBarWidth = function computeBarWidth (d) {
    var startedAt = new Date(d.startedAt * 1000);
    var endedAt = new Date(d.endedAt * 1000);

    return xScale(endedAt) - xScale(startedAt);
  };

  this.computeBarHeight = function computeBarHeight (d) {
    return yScale(d.label) + yPadding;
  };
}

module.exports = Scales;
