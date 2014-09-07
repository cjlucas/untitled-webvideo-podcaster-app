var assert = require('chai').assert;
var expect = require('chai').expect;

var helper = require('../helper');

describe('FeedsControllerPolicies', function() {
  var agent;
  var feed;
  var user;
  var userPass;
  var admin;
  var adminPass;

  before(function(done) {
    helper.liftSails(function(err, sails) {
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
        .createModels(Feed, helper.validFeedCriteria())
        .end(function(err, results) {
          if (err) return done(err);
          user = results[results.length - 3];
          admin = results[results.length - 2];
          feed = results[results.length - 1];
          done();
        });
    });

  });

  after(function(done) {
    helper.lowerSails(done);
    agent = null;
  });

  function adminOnlyApiRequest() {
    var videos = [
      helper.validVideoCriteria(),
      helper.validVideoCriteria()
    ];

    return agent
      .post('/api/feeds/' + feed.id + '/add_videos')
  }

  function loginRequiredApiRequest(feed) {
    return agent
      .get('/api/feeds/' + feed.id + '/refresh')
  }

  describe('when not logged in', function() {
    beforeEach(function(done) {
      helper.logout(agent, done);
    });

    describe('when attempting to access an admin-only api', function() {
      it('should disallow access', function(done) {
        adminOnlyApiRequest().expect(403, done);
      });
    });

    describe('when attempting to access a login-required api', function() {
      it('should disallow access', function(done) {
        loginRequiredApiRequest(feed).expect(403, done);
      });
    });
  });

  describe('when logged in as an admin', function() {
    before(function(done) {
      helper.login(admin.email, adminPass, agent, done);
    });

    after(function(done) {
      helper.logout(agent, done);
    });

    describe('when attempting to access an admin-only api', function() {
      it('should allow access', function(done) {
        adminOnlyApiRequest().end(function(err, res) {
          assert.notEqual(res.statusCode, 403);
          done();
        });
      });
    });

    describe('when attempting to access a login-required api', function() {
      it('should allow access', function(done) {
        loginRequiredApiRequest(feed).end(function(err, res) {
          assert.notEqual(res.statusCode, 403);
          done();
        });
      });
    });

    describe('when logged in as a user', function() {
      before(function(done) {
        helper.login(user.email, userPass, agent, done);
      });

      after(function(done) {
        helper.logout(agent, done);
      });

      describe('when attempting to access an admin-only api', function() {
        it('should disallow access', function(done) {
          adminOnlyApiRequest().expect(403, done);
        });
      });

      describe('when attemping to access a login-required api', function() {
        // feed associated with user
        var associatedFeed;
        // feed disassociated with user
        var disassociatedFeed;

        before(function(done) {
          // we only care about the database id, no need to modify attributes
          var feeds = [
            helper.validFeedCriteria(),
            helper.validFeedCriteria()
          ];

          helper.createModels(Feed, feeds, function(err, results) {
            if (err) return done(err);
            associatedFeed = results[0];
            disassociatedFeed = results[1];
            user.feeds.add(associatedFeed);
            user.save(done);
          });
        });

        it('should disallow access when specifying a feed disassociated with user',
          function(done) {
            loginRequiredApiRequest(disassociatedFeed).expect(403, done);
          }
        );

        it('should allow access when specifying feed associated with user',
          function(done) {
            loginRequiredApiRequest(associatedFeed).end(function(err, res) {
              assert.notEqual(res.statusCode, 403);
              done();
            });
        });

      });
    });
  });
});