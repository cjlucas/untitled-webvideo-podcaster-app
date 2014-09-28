var CronJob = require('cron').CronJob;

module.exports = function(sails) {
  return {
    initialize: function(cb) {
      if (process.env.NODE_ENV === 'test') return cb();

      // Update feeds
      new CronJob('* */4 * * * *', KueService.refreshAllFeeds).start();

      cb();
    }
  };
};