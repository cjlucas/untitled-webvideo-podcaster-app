var kue = require('kue');
var jobs = kue.createQueue({
  prefix: sails.config.redis.prefix,
  redis: {
    host: sails.config.redis.host,
    port: sails.config.redis.port,
    auth: sails.config.redis.password
  }
});

module.exports = {
  refreshFeed: function(feed, callback) {
    if (feed.id == null) {
      var err = new Error('feed id is missing');
      return callback(err, null);
    }

    var opts = {
      id: feed.id,
      url: feed.toUrl(),
      title: feed.toUrl()
    };
    var job = jobs
      .create('feed parser', opts)
      .save();

    callback(null, job);
  },

  refreshVideo: function(video, callback) {
    if (video.id == null) {
      var err = new Error('video id is missing');
      return callback(err, null);
    }

    var opts = {
      id: video.id,
      url: video.toUrl(),
      title: video.toUrl()
    };

    var job = jobs
      .create('refresh video data', opts)
      .save();

    callback(null, job);
  }
};