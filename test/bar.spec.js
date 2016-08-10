var Bar = require('../lib/bar');

describe('Bar', function () {
  var bar = new Bar({startedAt: 500, endedAt: 700, label: 'sitting', selected: false});

  it('can be expanded left', function() {
    var newBar = bar.expandLeft(300);

    expect(newBar.startedAt).toEqual(300);
    expect(newBar.endedAt).toEqual(700);
    expect(newBar.selected).toBe(false);
  });

  it('can be expanded right', function() {
    var newBar = bar.expandRight(400);

    expect(newBar.startedAt).toEqual(500);
    expect(newBar.endedAt).toEqual(400);
    expect(newBar.selected).toBe(false);
  });
});
