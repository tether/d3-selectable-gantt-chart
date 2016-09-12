function Bar (props) {
  this.id = props.id;
  this.label = props.label;
  this.startedAt = props.startedAt;
  this.endedAt = props.endedAt;
  this.selected = props.selected;
}

Bar.prototype.expandLeft = function expandLeft (startedAt) {
  return new Bar({
    id: this.id,
    label: this.label,
    selected: this.selected,
    startedAt: startedAt,
    endedAt: this.endedAt
  });
};

Bar.prototype.expandRight = function expandRight (endedAt) {
  return new Bar({
    id: this.id,
    label: this.label,
    selected: this.selected,
    startedAt: this.startedAt,
    endedAt: endedAt
  });
};

Bar.prototype.move = function move (startedAt) {
  var duration = this.endedAt - this.startedAt;

  return new Bar({
    id: this.id,
    label: this.label,
    selected: this.selected,
    startedAt: startedAt,
    endedAt: startedAt + duration
  });
};

module.exports = Bar;
