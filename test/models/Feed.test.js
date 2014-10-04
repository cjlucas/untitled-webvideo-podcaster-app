var assert = require('chai').assert;
var helper = require('../helper');

describe.only('FeedModel', function() {
  before(function(done) {
    helper.liftSails(done);
  });

  after(function(done) {
    helper.lowerSails(done);
  });

  beforeEach(function(done) {
    helper.series()
      .destroyAll(Feed)
      .end(done);
  });

  describe('#toUrl()', function () {
    it('should return a valid feed url [youtube:channel]', function(done) {
      Feed.create({
        site: 'youtube',
        feedType: 'channel',
        feedId: 'SomeUser'}, function(err, feed) {
        assert.ifError(err);
        assert.equal(feed.toUrl(), 'https://www.youtube.com/user/SomeUser/videos');
        done();
      });
    });

    it('should return a valid feed url [youtube:playlist]', function(done) {
      Feed.create({
        site: 'youtube',
        feedType: 'playlist',
        feedId: 'PLrEnWoR732-AIjPtA71xNW3Uv98KkB31V'}, function(err, feed) {
        assert.ifError(err);
        assert.equal(feed.toUrl(), 'https://www.youtube.com/playlist?list=PLrEnWoR732-AIjPtA71xNW3Uv98KkB31V');
        done();
      });
    });
  });


  describe('#fromUrl()', function() {
    it('should return a valid Feed [youtube:channel]', function(done) {
      Feed.fromUrl('https://www.youtube.com/user/polygon', function(feed) {
        assert.isNotNull(feed);
        assert.equal(feed.feedId, 'polygon');
        assert.equal(feed.site, 'youtube');
        assert.equal(feed.feedType, 'channel');
        done();
      });
    });

    it('should return a valid Feed [youtube:playlist]', function(done) {
      var url = 'https://www.youtube.com/playlist?list=PLrEnWoR732-AIjPtA71xNW3Uv98KkB31V';
      Feed.fromUrl(url, function(feed) {
        assert.isNotNull(feed);
        assert.equal(feed.feedId, 'PLrEnWoR732-AIjPtA71xNW3Uv98KkB31V');
        assert.equal(feed.site, 'youtube');
        assert.equal(feed.feedType, 'playlist');

        done();
      });
    });
  });
});