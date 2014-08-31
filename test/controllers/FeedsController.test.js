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
});