var kue = require('kue');
var jobs = kue.createQueue();

module.exports = {
  refreshFeed: function(feed) {
    var opts = {id: feed.guid, url: feed.toUrl() };
    jobs
      .create('feed parser', opts)
      .save()
  },

  refreshVideo: function(video) {
    var opts = {
      id: video.guid,
        url: video.toUrl()
    };

    jobs
      .create('refresh video data', opts)
      .save();
  }
};