var calc = require('../lib/date.calculator');

describe('Date Calculator', function () {
  describe('min date', function () {
    it('finds the lowest startedAt', function() {
      var data = [
        { startedAt: 1000, endedAt: 2000 },
        { at: 1500 },
        { startedAt: 500,  endedAt: 1400 }
      ];
      var min = calc.minDate(data);

      expect(min.getTime()).toEqual(500000);
    });

    it('finds the lowest at', function() {
      var data = [
        { startedAt: 1000, endedAt: 2000 },
        { at: 350 },
        { startedAt: 500,  endedAt: 1400 }
      ];
      var min = calc.minDate(data);

      expect(min.getTime()).toEqual(350000);
    });
  });

  describe('max date', function () {
    it('finds the biggest startedAt', function() {
      var data = [
        { startedAt: 1000, endedAt: 2000 },
        { at: 1500 },
        { startedAt: 500,  endedAt: 1400 }
      ];
      var max = calc.maxDate(data);

      expect(max.getTime()).toEqual(2000000);
    });

    it('finds the biggest at', function() {
      var data = [
        { startedAt: 1000, endedAt: 1500 },
        { at: 350 },
        { at: 1700 },
        { startedAt: 500,  endedAt: 1400 }
      ];
      var max = calc.maxDate(data);

      expect(max.getTime()).toEqual(1700000);
    });
  });
});
