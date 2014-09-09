var helper = require('../helper');
var assert = require('chai').assert;
var expect = require('chai').expect;

describe('UsersControllerPolicies', function() {
  var agent;
  var user;
  var userPass;

  before(function(done) {
    helper.liftSails(function(err, sails) {
      agent = helper.getAgent(sails);

      // plain text passwords are encrypted on create
      user = helper.validUserCriteria();
      userPass = user.password;

      helper.series()
        .destroyAll(Feed)
        .destroyAll(Video)
        .destroyAll(User)
        .createModels(User, user)
        .end(function(err, results) {
          if (err) return done(err);
          user = results[results.length - 1];
          done();
        });
    });
  });

  after(function(done) {
    helper.lowerSails(done);
    agent = null;
  });

  function anyUserApiRequest() {
    return agent
      .get('/api/users/' + user.id + '/add_feed')
  }

  function anonymousApiRequest() {
    return agent
      .post('/api/users/create')
  }

  describe('when not logged in', function() {
    before(function(done) {
      helper.logout(agent, done);
    });

    it('should forbid access to any-user api', function(done) {
      anyUserApiRequest().expect(403, done);
    });

    it('should allow access to anonymous user api', function(done) {
      anonymousApiRequest().end(function(err, res) {
        assert.notEqual(res.statusCode, 403);
        done();
      });
    });
  });

  describe('when user logged in', function() {
    before(function(done) {
      helper.login(user.email, userPass, agent, done);
    });

    after(function(done) {
      helper.logout(agent, done);
    });

    it('should allow access to any-user api', function(done) {
      anyUserApiRequest().end(function(err, res) {
        assert.notEqual(res.statusCode, 403);
        done();
      });
    });

    it('should allow access to anonymous user api', function(done) {
      anonymousApiRequest().end(function(err, res) {
        assert.notEqual(res.statusCode, 403);
        done();
      });
    });
  });

});