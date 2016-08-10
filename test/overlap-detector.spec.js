var OverlapDetector = require('../lib/overlap-detector');

describe('isOverlapping', function () {
  var bar = {
    label: 'red',
    startedAt: 200,
    endedAt: 500
  };

  it('is true when bar dragged right over another bar', function () {
    var data = [ { label: 'red', startedAt: 100, endedAt: 300 } ];

    expect(OverlapDetector.isOverlapping(bar, data)).toBe(true);
  });

  it('is true when bar dragged left over another bar', function () {
    var data = [ { label: 'red', startedAt: 400, endedAt: 600 } ];

    expect(OverlapDetector.isOverlapping(bar, data)).toBe(true);
  });

  it('is true when bar somehow exists within another bar', function () {
    var data = [ { label: 'red', startedAt: 300, endedAt: 400 } ];

    expect(OverlapDetector.isOverlapping(bar, data)).toBe(true);
  });

  it('is not true when no overlap', function () {
    var data = [ { label: 'red', startedAt: 800, endedAt: 900 } ];

    expect(OverlapDetector.isOverlapping(bar, data)).toBe(false);
  });

  it('is not true when bar has a different label', function () {
    var data = [ { label: 'blue', startedAt: 100, endedAt: 300 } ];

    expect(OverlapDetector.isOverlapping(bar, data)).toBe(false);
  });

  it('is does not compare selected bars', function () {
    var data = [{ label: 'red', startedAt: 300, endedAt: 400, selected: true }];

    expect(OverlapDetector.isOverlapping(bar, data)).toBe(false);
  });
});
