var assert = require('chai').assert;
var expect = require('chai').expect;

var helper = require('../helper');

describe('VideosControllerPolicies', function() {
  var agent;
  var video;
  var user;
  var userPass;
  var admin;
  var adminPass;

  before(function (done) {
    helper.liftSails(function (err, sails) {
      agent = helper.getAgent(sails);

      // plain text passwords are encrypted on create
      user = helper.validUserCriteria();
      userPass = user.password;
      admin = helper.validAdminCriteria();
      adminPass = admin.password;

      helper.series()
        .destroyAll(Feed)
        .destroyAll(Video)
        .destroyAll(User)
        .createModels(User, [user, admin])
        .createModels(Video, helper.validVideoCriteria())
        .end(function (err, results) {
          if (err) return done(err);
          user = results[results.length - 3];
          admin = results[results.length - 2];
          video = results[results.length - 1];
          done();
        });
    });
  });

  after(function (done) {
    helper.lowerSails(done);
    agent = null;
  });

  function adminOnlyRequest() {
    return agent
      .put('/api/videos/' + video.guid);
  }

  describe('when logged in as an admin', function() {
    beforeEach(function(done) {
      helper.login(admin.email, adminPass, agent, done);
    });

    afterEach(function(done) {
      helper.logout(agent, done);
    });

    describe('when accessing an admin-only api', function() {
      it('should succeed', function(done) {
        adminOnlyRequest().end(function(err, res) {
          assert.notEqual(res.statusCode, 403);
          done();
        });
      });
    });
  });

  describe('when logged in as a user', function() {
    beforeEach(function(done) {
      helper.login(user.email, userPass, agent, done);
    });

    afterEach(function(done) {
      helper.logout(agent, done);
    });

    describe('when accessing an admin-only api', function() {
      it('should fail', function(done) {
        adminOnlyRequest().expect(403, done);
      });
    });
  });

});