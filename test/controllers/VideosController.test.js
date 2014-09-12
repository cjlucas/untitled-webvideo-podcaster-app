var helper = require('../helper');
var assert = require('chai').assert;
var expect = require('chai').expect;

describe('VideosController', function() {
  var agent;

  before(function (done) {
    helper.liftSails(function (err, sails) {
      agent = helper.getAgent(sails);
      // allow full access to api
      helper.loginWithAdminAuthority(agent, done);
    });

  });

  after(function (done) {
    helper.lowerSails(done);
    agent = null;
  });

  describe('#download()', function() {
    var video = helper.validVideoCriteria();
    video.formats = [];
    var format1080 = {
      height: 1080,
      width: 1920,
      videoUrl: 'http://example.org?vid=1'
    };
    var format720 = {
      height: 720,
      width: 1280,
      videoUrl: 'http://example.org?vid=2'
    };

    function downloadRequest(video, maxHeight) {
      var url = '/videos/' + video.guid + '/download';
      if (maxHeight != null) {
        url = url + '?maxHeight=' + maxHeight;
      }
      return agent.get(url);
    }

    beforeEach(function(done) {
      helper.series()
        .destroyAll(Video)
        .destroyAll(VideoFormat)
        .createModels(Video, video)
        .end(function(err, results) {
          if (err) return done(err);
          video = results[results.length - 1];
          video.formats.add(format1080);
          video.formats.add(format720);
          video.save(done);
        });
    });

    describe('when no maxHeight argument given', function(done) {
      it('should redirect to the correct url', function(done) {
        downloadRequest(video)
          .expect(302)
          .end(function(err, res) {
          assert.ifError(err);
          assert.equal(res.headers.location, format1080.videoUrl);
          done();
        });
      });
    });

    describe('when maxHeight is set to largest format', function(done) {
      it('should redirect to the correct url', function(done) {
        downloadRequest(video, 1080)
          .expect(302)
          .end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.headers.location, format1080.videoUrl);
            done();
          });
      });
    });

    describe('when maxHeight is set to smallest format', function(done) {
      it('should redirect to the correct url', function(done) {
        downloadRequest(video, 720)
          .expect(302)
          .end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.headers.location, format720.videoUrl);
            done();
          });
      });

    });

    describe('when maxHeight is set to smaller than smallest height', function(done) {
      it('should redirect to the correct url', function(done) {
        downloadRequest(video, 1)
          .expect(302)
          .end(function (err, res) {
            assert.ifError(err);
            assert.equal(res.headers.location, format720.videoUrl);
            done();
          });
      });
    });

    describe('when url for requested format is not valid', function() {
      it('should return a 503', function(done) {
        var video = helper.validVideoCriteria();
        video.formats = [
          {
            height: 720,
            width: 1280,
            videoUrl: 'http://httpbin.org/status/403'
          }
        ];

        helper.createModels(Video, video, function(err, results) {
          assert.ifError(err);
          downloadRequest(results[results.length - 1]).expect(503).end(done);
        });
      });
    });
  });
});