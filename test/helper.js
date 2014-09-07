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
  /*
    A bucket of tasks, tasks are an array of functions.
    Each tasks producer creates it's own array of tasks.

    When end() is called, the bucket is flattened into a one-dimensional
    array of functions.

    The purpose of this is to guarantee that the results
    returned in the async.series callback are in the order in which the
    Series method chain is called.
   */
  this.tasksBucket = [];
  this.numRunningTaskProducers = 0;
  this.endCallback = null; // set when end() is called

  this.incrNumRunningTaskProducers = function() {
    this.numRunningTaskProducers++;
  };

  this.decrNumRunningTaskProducers = function() {
    if (--this.numRunningTaskProducers == 0
      && this.endCallback != null) {
      this.end(this.endCallback);
    }
  };

  this.newTasks = function() {
    var i = this.tasksBucket.push([]) - 1;
    return this.tasksBucket[i];
  };

  this.then = function(func) {
    this.newTasks().push(func);
    return this;
  };

  this.end = function(callback) {
    // Don't execute series() if there are still task producers running
    // In this case, decrNumRunningTaskProducers will call end()
    if (this.numRunningTaskProducers > 0) {
      this.endCallback = callback;
      return;
    }

    var t = [];
    for (var i = 0; i < this.tasksBucket.length; i++) {
      for (var j = 0; j < this.tasksBucket[i].length; j++) {
        t.push(this.tasksBucket[i][j]);
      }
    }

    async.series(t, callback);
  };

  this.destroyAll = function(Model) {
    this.incrNumRunningTaskProducers();
    var tasks = this.newTasks();
    var self = this;

    Model.find().exec(function(err, models) {
      if (err) throw err;

      var destroyModel = function(model) {
        return function(cb) {
          model.destroy(function(err) {
            cb(err, "destroyed: " + model);
          });
        }
      };

      models.forEach(function(model) {
       this.push(destroyModel(model));
      }, tasks);

      self.decrNumRunningTaskProducers();
    });

    return this;
  };

  this.createModels = function(Model, modelCriteria) {
    this.incrNumRunningTaskProducers();
    if (!Array.isArray(modelCriteria)) modelCriteria = [modelCriteria];
    var tasks = this.newTasks();

    var createModel = function(criteria) {
      return function(cb) {
        Model.create(criteria).exec(cb);
      }
    };

    modelCriteria.forEach(function(criteria) {
      this.push(createModel(criteria));
    }, tasks);

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

  this.login = function(email, password, agent, callback) {
    agent
      .post('/login')
      .send({email: email, password: password})
      .end(function(err, res) {
        if (!err && res.statusCode != 302) {
          err = new Error(res.body.error);
        }
        agent.saveCookies(res);
        callback(err, agent);
      })
  };

  this.logout = function(agent, callback) {
    agent
      .post('/logout')
      .end(function(err, res) {
        agent.saveCookies(res);
        callback(err);
      });
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

  this.validUserCriteria = function() {
    return {
      email: 'fake.email@google.com',
      password: 'pass123',
      role: 'user'
    }
  };

  this.validAdminCriteria = function() {
    var admin = this.validUserCriteria();
    admin.email = 'fake.admin@google.com';
    admin.role = 'admin';
    return admin;
  };

  this.validFeedCriteria = function() {
    return {
      feedId: 'someFeedId',
      site: 'youtube',
      feedType: 'channel'
    };
  };

  this.validVideoCriteria = function() {
    return {
      videoId: 'someVideoId',
      site: 'youtube',
      title: 'Test Video',
      videoUrl: 'http://example.com/path/to/video.mp4'
    }
  };
}

module.exports = new TestHelper();