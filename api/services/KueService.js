var kue = require('kue');
var jobs = kue.createQueue();

module.exports = {
  scrapeFeed: function(feed) {
    var opts = {url: feed.toUrl() };
    jobs
      .create('feed parser', opts)
      .save()
  }
}