const MAX_INT = Math.pow(2, 31);

module.exports = {
  getGuid: function(Model, callback) {
    var findUniqueId = function() {
      var guid = Math.floor(Math.random() * MAX_INT);
      Model.count({guid: guid})
        .exec(function(err, result) {
          return result == 0
            ? callback(guid)
            : findUniqueId();
        });
    };

    return findUniqueId();
  }
};