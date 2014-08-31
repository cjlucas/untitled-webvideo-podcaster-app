var SailsApp = require('sails').Sails;
var request = require('supertest');

function setAgent(agent) {
  module.exports.agent = agent;
}
function setSails(sails) {
  module.exports.sails = sails;
}

function TestHelper() {
  this.sailsLiftedCount = 0;
  this.agent = null;
  this.sails = null;

  this.liftSails = function(callback) {
    if (this.sailsLiftedCount > 0) return callback();

    this.sailsLiftedCount++;

    var sails = new SailsApp();
    sails.lift({}, function(err, sails) {
      if (err) {
        console.log('lift error:' + err);
        return callback(err);
      }


      setSails(sails);
      setAgent(request.agent(sails.hooks.http.app));
      callback(err);
    });
  };

  this.lowerSails = function(callback) {
    if (--this.sailsLiftedCount > 0) return callback();

    this.sails.lower(callback);
  };
}

module.exports = new TestHelper();