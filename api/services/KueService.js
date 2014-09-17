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
  refreshFeed: function(feed) {
    var opts = {
      id: feed.id,
      url: feed.toUrl(),
      title: feed.toUrl()
    };
    jobs
      .create('feed parser', opts)
      .save()
  },

  refreshVideo: function(video) {
    var opts = {
      id: video.id,
      url: video.toUrl(),
      title: video.toUrl()
    };

    jobs
      .create('refresh video data', opts)
      .save();
  }
};