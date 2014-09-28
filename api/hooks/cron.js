var CronJob = require('cron').CronJob;

module.exports = function(sails) {
  return {
    initialize: function(cb) {
      if (process.env.NODE_ENV === 'test') return cb();

      // Update feeds every 4 hours
      new CronJob('0 0 */4 * * *', KueService.refreshAllFeeds).start();

      cb();
    }
  };
};