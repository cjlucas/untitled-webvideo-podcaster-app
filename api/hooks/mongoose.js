function setupMongoose() {
  /**
   * Setup connection
   */
  var database = sails.config.mongo.database;
  var host = sails.config.mongo.host || 'localhost';
  var port = sails.config.mongo.port;
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


  console.log('ya im here');
};

module.exports = function(sails) {

  return setupMongoose;

};