var assert = require('chai').assert;
var expect = require('chai').expect;

var helper = require('../helper');

describe('FeedsController', function() {
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

  describe('#find()', function() {
    var feed;
    var videoIds;

    var getIds = function(models) {
      return models.map(function(model) {
        return model.id;
      })
    };

    var createFeedWithVideos = function(done) {
      var videos = [
        helper.validVideoCriteria(),
        helper.validVideoCriteria(),
        helper.validVideoCriteria()
      ];

      for (var i = 0; i < videos.length; i++) {
        videos[i].videoId = 'vid' + (i+1);
      }

      helper.series()
        .destroyAll(Feed)
        .destroyAll(Video)
        .createModels(Feed, helper.validFeedCriteria())
        .createModels(Video, videos)
        .end(function(err, results) {
          if (err) throw err;

          // last 4 elements are from createModels calls
          var models = results.slice(results.length - 4);
          feed = models[0];
          videos = models.slice(1);

          videoIds = getIds(videos);

          // associate videos with feed
          for (var i = 0; i < videos.length; i++) {
            feed.videos.add(videos[i]);
          }

          feed.save(done);
        })
    };

    describe('when a feedId parameter is specified', function() {
      before(createFeedWithVideos);

      it('should return a 404 if feed not found', function(done) {
        agent
          .get('/api/feeds?feedId=fakeId')
          .expect(404)
          .end(function(err, res) { console.log(res.body); done()});
      });

      it('should return a feed when given valid feedId', function(done) {
        var feedId = feed.feedId;
        agent
          .get('/api/feeds?feedId=' + feedId)
          .expect(200)
          .end(function(err, res) {
            assert.equal(res.body.feedId, feedId);
            assert.sameMembers(videoIds, getIds(res.body.videos));
            done();
          });
      });
    });

    describe('when an id parameter is specified', function() {
      before(createFeedWithVideos);

      it('should return a feed when given valid id', function(done) {
        var id = feed.id;
        agent
          .get('/api/feeds/' + id)
          .expect(200)
          .end(function(err, res) {
            assert.equal(res.body.id, id);
            assert.sameMembers(videoIds, getIds(res.body.videos));
            done();
          });
      });
    });

    describe('when no parameters are specified', function() {
      beforeEach(function(done) {
        helper.destroyAll(Feed, done);
      });

      it('should return an empty array if no feeds exist', function(done) {
        agent
          .get('/api/feeds')
          .expect(200)
          .end(function(err, res) {
            assert.equal(res.body.length, 0);
            done();
          });
      });

      it('should return all feeds', function(done) {
        var feeds = [
          helper.validFeedCriteria(),
          helper.validFeedCriteria()
        ];

        helper.createModels(Feed, feeds, function() {
          agent
            .get('/api/feeds')
            .expect(200)
            .end(function(err, res) {
              assert.equal(res.body.length, 2);
              done();
            });
        });
      });

      it('should return the videos for all feeds', function(done) {
        createFeedWithVideos(function() {
          agent
            .get('/api/feeds')
            .expect(200)
            .end(function(err, res) {
              assert.ifError(err);
              assert.equal(res.body.length, 1);
              assert.sameMembers(videoIds, getIds(res.body[0].videos));
              done();
            });
        });
      });
    });

  });

  describe('#addVideos()', function() {
    function apiEndpoint(feedId) {
      return '/api/feeds/' + feedId + '/add_videos';
    }

    var feed;

    before(function(done) {
      helper.series()
        .destroyAll(Feed)
        .createModels(Feed, helper.validFeedCriteria())
        .end(function(err, results) {
          if (err) return done(err);
          feed = results.slice(-1)[0];
          done();
        });
    });

    var videos = [
      helper.validVideoCriteria(),
      helper.validVideoCriteria()
    ];

    it('should add videos to a feed', function(done) {
      agent
        .post(apiEndpoint(feed.id))
        .send({videos: videos})
        .expect(200)
        .end(function(err, res) {
          assert.ifError(err);
          Feed.findOneById(feed.id).populate('videos')
            .exec(function(err, feed) {
              assert.ifError(err);
              expect(feed.videos).to.have.length(2);
              done();
            });
        });
    });

    it('should return a 404 if an invalid feed id is given', function(done) {
      agent
        .post(apiEndpoint(feed.id + 1))
        .send({videos: videos})
        .expect(404, done);
    });
  });
});