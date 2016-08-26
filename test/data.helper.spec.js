var DataHelper = require('../lib/data.helper');

describe('Data Helper', function () {
  describe('extracts labels', function () {
    it('returns empty array when no data', function () {
      expect(DataHelper.labels({})).toEqual([]);
    });

    it('uses `labels` key', function() {
      var labels = DataHelper.labels({ labels: ['foo', 'bar'] });
      expect(labels).toEqual(['foo', 'bar']);
    });

    it('infers labels from events when no labels are specified', function () {
      var foo = { label: 'foo' };
      var bar = { label: 'bar' };
      var labels = DataHelper.labels({ events: [foo, bar] });
      expect(labels).toEqual(['foo', 'bar']);
    });

    it('merges labels keys with events labels when both are available', function () {
      var bar = { label: 'bar' };
      var labels = DataHelper.labels({ labels: ['foo'], events: [bar] });
      expect(labels).toEqual(['foo', 'bar']);
    });
  });
});
