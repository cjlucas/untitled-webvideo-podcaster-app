var helper = require('../helper');
var assert = require('chai').assert;
var expect = require('chai').expect;
var Mitm   = require('mitm');

describe('KueService', function() {
  var agent;

  before(function (done) {
    helper.liftSails(function (err, sails) {
      done();
    });
  });

  after(function (done) {
    helper.lowerSails(done);
    agent = null;
    redisClient.quit();
  });

  describe('#refreshFeed()', function() {
    describe('when given an unsaved feed', function() {
      it('error should not be null', function(done) {
        var feed = helper.validFeedCriteria();
        KueService.refreshFeed(feed, function(err, job) {
          assert.isNotNull(err);
          done();
        });
      });
    });

    describe('when given a valid feed', function() {
      var feed;
      beforeEach(function(done) {
        helper.series()
          .destroyAll(Feed)
          .createModels(Feed, helper.validFeedCriteria())
          .end(function(err, results) {
            if (err) return done(err);
            feed = results[results.length - 1];
            done();
          });
      });

      it('should contain valid job data', function(done) {
        KueService.refreshFeed(feed, function(err, job) {
          assert.ifError(err);
          assert.equal(job.data.id, feed.id);
          done();
        });
      });
    })
  });

  describe('#refreshVideo()', function() {
    describe('when given an unsaved video', function() {
      it('error should not be null', function(done) {
        var video = helper.validVideoCriteria();
        KueService.refreshVideo(video, function(err, job) {
          assert.isNotNull(err);
          done();
        });
      });
    });

    describe('when given a valid video', function() {
      var video;

      beforeEach(function(done) {
        helper.series()
          .destroyAll(Video)
          .createModels(Video, helper.validVideoCriteria())
          .end(function(err, results) {
            video = results[results.length - 1];
            done();
          });
      });

      it('should contain valid job data', function(done) {
        KueService.refreshVideo(video, function(err, job) {
          assert.ifError(err);
          assert.equal(job.data.id, video.id);
          done();
        });
      })
    });
  });
});