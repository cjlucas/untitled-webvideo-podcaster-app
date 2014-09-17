function setupMongoose(sails) {
  /**
   * Setup connection
   */
  var database = sails.config.mongo.database;
  var host = sails.config.mongo.host || 'localhost';
  var port = sails.config.mongo.port || 27017;
  var user = sails.config.mongo.user;
  var password = sails.config.mongo.password;


  var mongoose = require('mongoose');
  mongoose.connect(
    host,
    database,
    port,
    {
      user: user,
      pass: password
    }
  );

  if (sails.config.environment === 'test') {
    mongoose.connection.db.dropDatabase();
  }

  /**
   * Setup Models
   */

  var models = require('require-all')(sails.config.paths.models);
  Object.keys(models).forEach(function(modelName) {
    global[modelName] = mongoose.model(modelName, models[modelName]);
  });

  sails.on('lower', function() {
    mongoose.disconnect();
  });
}

module.exports = function(sails) {
  return {
    initialize: setupMongoose(sails)
  };
};