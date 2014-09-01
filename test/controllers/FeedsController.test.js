var assert = require('assert');

var helper = require('../helper');

describe('FeedsController', function() {
  var agent;

  before(function(done) {
    helper.liftSails(function() {
      agent = helper.agent;
      done();
    })

  });

  after(function(done) {
    helper.lowerSails(done);
    agent = null;
  });

  describe('#find()', function() {
    describe('when a feedId parameter is specified', function() {

      it('should return a 404 if feed not found', function(done) {
        agent
          .get('/api/feeds?feedId=fakeId')
          .expect(404, done);
      });

      it('should return a feed when given valid feedId', function(done) {
        var feedId = '4vjao';
        Feed.create({feedId: feedId}).exec(function(err, feed) {
          agent
            .get('/api/feeds?feedId=' + feedId)
            .expect(200)
            .end(function(err, res) {
              assert.equal(res.body.feedId, feedId);
              done();
            });
        });
      });
    });

    describe('when an id parameter is specified', function() {
      it('should return a feed when given valid id', function(done) {
        Feed.create({feedId: 'someid'}).exec(function(err, feed) {
          var id = feed.id;
          agent
            .get('/api/feeds/' + id)
            .expect(200)
            .end(function(err, res) {
              assert.equal(res.body.id, id);
              done();
            });
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
          {feedId: 'feed1'}, {feedId: 'feed2'}
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
    });

  });

  describe('#addVideos()', function() {
    function apiEndpoint(feedId) {
      return '/api/feeds/' + feedId + '/add_videos';
    }

    var feed;

    before(function(done) {
      Feed.create({feedId: 'someid'}, function(err, f) {
        if (err) throw err;
        feed = f;
        done();
      });
    });

    var videos = [
      {videoId: 'videoId1', title: 'video1'},
      {videoId: 'videoId2', title: 'video2'}
    ];


    it('should add videos to a feed', function(done) {
      agent
        .post(apiEndpoint(feed.id))
        .send({videos: videos})
        .expect(200)
        .end(function(err, res) {
          if(err) throw err;
          assert.equal(res.body.videos.length, 2);
          done();
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