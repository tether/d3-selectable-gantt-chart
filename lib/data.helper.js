module.exports = {
  labels: function extractLabels (data) {
    function unique (value, index, array) {
      return array.indexOf(value) === index;
    }

    return data.map(function (d) { return d.label; }).filter(unique);
  }
};
