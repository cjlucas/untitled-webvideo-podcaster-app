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

    it('should return a feed when given valid id', function(done) {
      Feed.create({feedId: 'someid'}).exec(function(err, feed) {
        var id = feed.id;
        agent
          .get('/api/feeds?id=' + id)
          .expect(200)
          .end(function(err, res) {
            assert.equal(res.body.id, id);
            done();
          });
      });
    });

    it('should return a 500 if incorrect parameters given', function(done) {
      agent
        .get('/api/feeds?wrongParam=1')
        .expect(500, done);
    });
  });

  describe('#addVideos()', function() {
    var feed;
    before(function(done) {
      Feed.create({feedId: 'someid'}, function(err, f) {
        if (err) throw err;
        feed = f;
        done();
      });
    });

    it('should add a video', function(done) {
      var videos = [
        {videoId: 'somevideoid', title: 'video title'}
      ];

      agent
        .post('/api/feeds/' + feed.id + '/add_videos')
        .send({videos: videos})
        .expect(200)
        .end(function(err, res) {
          if(err) throw err;
          assert.equal(res.body.videos.length, 1);
          done();
        });
    });
  });
});