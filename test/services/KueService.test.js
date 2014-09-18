var helper = require('../helper');
var assert = require('chai').assert;
var expect = require('chai').expect;
var Mitm   = require('mitm');

describe.only('KueService', function() {
  var agent;

  before(function (done) {
    helper.liftSails(function (err, sails) {
      done();
    });
  });

  after(function (done) {
    helper.lowerSails(done);
    agent = null;
  });

  describe('#refreshFeed()', function() {
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

      it('should contain valid job data', function(done) {
        KueService.refreshFeed(feed, function(err, job) {
          assert.ifError(err);
          assert.equal(job.data.id, feed.id);
          done();
        });
      });
    });

    describe('when submitting the same feed multiple times', function() {
      it('should return an error if the job is still queued', function(done) {
        var queueSecondJob = function() {
          KueService.refreshFeed(feed, function(err, job) {
            assert.isNotNull(err);
            done();
          });
        };

        KueService.refreshFeed(feed, queueSecondJob);
      });

      it('should succeed if the job doesnt exist in the queue', function(done) {
        var queueSecondJob = function() {
          // simulate first job being dequeued
          KueService.removeJobs();
          KueService.refreshFeed(feed, function(err, job) {
            assert.ifError(err);
            assert.isNotNull(job);
            done();
          });
        };

        KueService.refreshFeed(feed, queueSecondJob);
      });
    });
  });

  describe('#refreshVideo()', function() {
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
      it('should contain valid job data', function(done) {
        KueService.refreshVideo(video, function(err, job) {
          assert.ifError(err);
          assert.equal(job.data.id, video.id);
          done();
        });
      })
    });

    describe('when submitting the same video multiple times', function() {
      it('should return an error if the job is still queued', function(done) {
        var queueSecondJob = function() {
          KueService.refreshVideo(video, function(err, job) {
            assert.isNotNull(err);
            done();
          });
        };

        KueService.refreshVideo(video, queueSecondJob);
      });

      it('should succeed if the job doesnt exist in the queue', function(done) {
        var queueSecondJob = function() {
          // simulate first job being dequeued
          KueService.removeJobs();
          KueService.refreshVideo(video, function(err, job) {
            assert.ifError(err);
            assert.isNotNull(job);
            done();
          });
        };

        KueService.refreshVideo(video, queueSecondJob);
      });
    });
  });
});