var SailsApp = require('sails').Sails;
var request = require('supertest');

function setAgent(agent) {
  module.exports.agent = agent;
}
function setSails(sails) {
  module.exports.sails = sails;
}

// From http://book.mixu.net/node/ch7.html
function series(callbacks, last) {
  function next() {
    var callback = callbacks.shift();
    if(callback) callback(function() { next() });
    else last();
  }
  next();
}

function TestHelper() {
  this.sailsLiftedCount = 0;
  this.agent = null;
  this.sails = null;

  /**
   * Lift Sails
   * @param callback
   */
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

  /**
   * Lower Sails
   * @param callback
   */
  this.lowerSails = function(callback) {
    if (--this.sailsLiftedCount > 0) return callback();

    this.sails.lower(callback);
  };

  /**
   * Destroy all models
   *
   * @param Model {Object} The model class
   * @param callback {Function} Called when all objects are destroyed
   */
  this.destroyAll = function(Model, callback) {
    Model.find().exec(function(err, models) {
      if (err) throw err;

      var destroyedCount = 0;
      var callbacks = [];
      models.forEach(function(model) {
        callbacks.push(function(next) {
          model.destroy(function(err, status) {
            next();
          })
        });
      });

      series(callbacks, callback);
    });
  };

  /**
   * Creates multiple models
   *
   * @param Model {Object} The model class
   * @param modelCriteria {Array} An array of model criteria
   * @param callback {Function} Called when all objects are created
   */
  this.createModels = function(Model, modelCriteria, callback) {
    var callbacks = [];

    modelCriteria.forEach(function(criteria) {
      var create = function(next) {
        Model.create(criteria).exec(function(err, model) { next() });
      };

      callbacks.push(create);
    });

    series(callbacks, callback)
  }

  /**
   * Valid Model Criteria
   */

  this.validFeedCriteria = function() {
    return {
      feedId: 'someFeedId',
      site: 'youtube',
      feedType: 'channel'
    };
  }

  this.validVideoCriteria = function() {
    return {
      videoId: 'someVideoId',
      site: 'youtube',
      title: 'Test Video',
      videoUrl: 'http://example.com/path/to/video.mp4'
    }
  }
}

module.exports = new TestHelper();