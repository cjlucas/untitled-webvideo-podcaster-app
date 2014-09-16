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

  /**
   * Setup Models
   */

  var models = require('require-all')(sails.config.paths.models);
//  console.log('modelsss');
  Object.keys(models).forEach(function(modelName) {
//    console.log(modelName);
//    console.log(models[modelName]);
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