var helper = require('../helper');
var assert = require('chai').assert;
var expect = require('chai').expect;

describe('UsersController', function() {
  var agent;

  before(function(done) {
    helper.liftSails(function(err, sails) {
      agent = helper.getAgent(sails);
      // allow full access to api
      helper.loginWithAdminAuthority(agent, done);
    });

  });

  after(function(done) {
    helper.lowerSails(done);
    agent = null;
  });

  describe('#create()', function() {
    function createUserRequest(email, password) {
      return agent
        .post('/api/users/create')
        .send({email: email, password: password})
    }

    it('should fail if email not specified', function(done) {
      createUserRequest(null, 'some pass').expect(400, done);
    });

    it('should fail if email is blank', function(done) {
      createUserRequest('', 'some pass').expect(400, done);
    });

    it('should fail if password not specified', function(done) {
      createUserRequest('some.email@google.com', null).expect(400, done);
    });

    it('should fail if password is blank', function(done) {
      createUserRequest('some.email@google.com', '').expect(400, done);
    });

    it('should succeed if email and password are given', function(done) {
      var user = helper.validUserCriteria();
      createUserRequest(user.email, user.password).expect(200, done);
    });
  });

  describe('#addFeed()', function() {
    var user;
    var feed;
    // we need a user in the db to make
    before(function(done) {
      helper.createModels(
        User, helper.validUserCriteria(), function(err, results) {
          if (err) return done(err);
          user = results[results.length - 1];
          done();
      });
    });

    function addFeedRequest(url) {
      return agent
        .get('/api/users/' + user.id + '/add_feed?url=' + url);
    }

    it('should fail if no url given', function(done) {
      addFeedRequest(null).expect(400, done);
    });

    it('should fail if invalid url given', function(done) {
      addFeedRequest('http://fakefeed.com').expect(400, done);
    });

    it('should succeed if a valid url given', function(done) {
      var url = 'https://www.youtube.com/user/androiddevelopers';

      var onFeedCreated = function(feed) {
        addFeedRequest(url)
          .expect(200)
          .end(function(err, res) {
            assert.ifError(err);
            // api should return the feed as the response
            assert.equal(res.body.feedId, feed.feedId);

            // check if feed was actually added to user
            User.findById(user.id)
              .populate('feeds')
              .exec(function(err, user) {
                assert.ifError(err);
                assert.lengthOf(user.feeds, 1);
                assert.equal(user.feeds[0].feedId, feed.feedId);
                done();
              });
          });
      };

      Feed.fromUrl(url, onFeedCreated);
    })
  });
});
