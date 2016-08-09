function Bar (props) {
  this.label = props.label;
  this.startedAt = props.startedAt;
  this.endedAt = props.endedAt;
  this.selected = props.selected;
}

Bar.prototype.expandLeft = function expandLeft (startedAt) {
  return new Bar({
    label: this.label,
    selected: this.selected,
    startedAt: startedAt,
    endedAt: this.endedAt
  });
};

Bar.prototype.expandRight = function expandRight (endedAt) {
  return new Bar({
    label: this.label,
    selected: this.selected,
    startedAt: this.startedAt,
    endedAt: endedAt
  });
};

module.exports = Bar;
