var SailsApp = require('sails').Sails;
var request = require('supertest');
var async = require('async');

function setAgent(agent) {
  module.exports.agent = agent;
}
function setSails(sails) {
  module.exports.sails = sails;
}

function Series() {
  this.tasks = [];
  this.numRunningTaskProducers = 0;
  this.endCallback = null; // set when end() is called

  this.incrNumRunningTaskProducers = function() {
    this.numRunningTaskProducers++;
  };

  this.decrNumRunningTaskProducers = function() {
    if (--this.numRunningTaskProducers == 0 && this.endCallback != null) {
      this.end(this.endCallback);
    }
  };

  this.then = function(func) {
    this.tasks.push(func);
    return this;
  };

  this.end = function(callback) {
    // Don't execute series() if there are still task producers running
    // In this case, decrNumRunningTaskProducers will call end()
    if (this.numRunningTaskProducers > 0) {
      this.endCallback = callback;
      return;
    }

    async.series(this.tasks, callback);
  };

  this.destroyAll = function(Model) {
    this.numRunningTaskProducers++;
    var self = this;
    Model.find().exec(function(err, models) {
      if (err) throw err;

      var destroyModel = function(model) {
        return function(cb) {
          model.destroy(function(err) {
            cb(err, model);
          });
        }
      };

      models.forEach(function(model) {
        self.then(destroyModel(model));
      });

      self.decrNumRunningTaskProducers();
    });

    return this;
  };

  this.createModels = function(Model, modelCriteria) {
    this.incrNumRunningTaskProducers();
    if (typeof modelCriteria !== 'array') modelCriteria = [modelCriteria];

    var createModel = function(criteria) {
      return function(cb) {
        Model.create(criteria).exec(cb);
      }
    };

    modelCriteria.forEach(function(criteria) {
      this.then(createModel(criteria));
    }, this);

    this.decrNumRunningTaskProducers();
    return this;
  };
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

  this.series = function() {
    return new Series();
  };

  this.destroyAll = function(Model, callback) {
    new Series().destroyAll(Model).end(callback);
  };

  this.createModels = function(Model, modelCriteria, callback) {
    new Series().createModels(Model, modelCriteria).end(callback);
  };

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