var CronJob = require('cron').CronJob;

module.exports = function(sails) {
  return {
    initialize: function(cb) {
      // Update feeds
      var job = new CronJob('* */4 * * * *', function() {
        Feed.find(function(err, feeds) {
          if (err) return console.log('CRON: Error fetching feeds');
          feeds.forEach(function(feed) {
            KueService.refreshFeed(feed);
          });
        });
      });

      job.start();
      cb();
    }
  };
};