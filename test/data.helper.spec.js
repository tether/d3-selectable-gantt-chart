var DataHelper = require('../lib/data.helper');

describe('Data Helper', function () {
  describe('extracts labels', function () {
    it('returns empty array when no data', function () {
      expect(DataHelper.labels({})).toEqual([]);
    });

    it('uses `labels` key', function() {
      var labels = DataHelper.labels({ labels: [{ name: 'foo' }, { name: 'bar' }] });
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
      var labels = DataHelper.labels({ labels: [{ name: 'foo' }], events: [bar] });
      expect(labels).toEqual(['foo', 'bar']);
    });

    it('removes duplicate keys', function () {
      var bar = { label: 'bar' };
      var labels = DataHelper.labels({ labels: [{ name: 'foo' }, { name: 'bar' }], events: [bar] });
      expect(labels).toEqual(['foo', 'bar']);
    });
  });

  describe('is editable', function () {
    it('sets editable as default when no data', function () {
      expect(DataHelper.isEditable('walking')).toBeTruthy();
    });

    it('sets editable as default when no labels', function () {
      expect(DataHelper.isEditable('walking', { labels: undefined })).toBeTruthy();
    });

    it('returns editable when editable is true', function () {
      var data = { labels: [{ name: 'walking', editable: true }] };
      expect(DataHelper.isEditable('walking', data)).toBeTruthy();
    });

    it('returns not editable when editable is false', function () {
      var data = { labels: [{ name: 'walking', editable: false }] };
      expect(DataHelper.isEditable('walking', data)).toBeFalsy();
    });

    it('sets editable as default when label doesnt specify', function () {
      var data = { labels: [{ name: 'walking' }] };
      expect(DataHelper.isEditable('walking', data)).toBeTruthy();
    });
  });
});
