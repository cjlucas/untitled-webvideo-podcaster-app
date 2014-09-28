var kue = require('kue');
var queue = kue.createQueue({
  prefix: sails.config.redis.prefix,
  redis: {
    host: sails.config.redis.host,
    port: sails.config.redis.port,
    auth: sails.config.redis.password
  }
});

function getJobAndRemove(jobId) {
  kue.Job.get(jobId, function(err, job) {
    removeJob(job);
  });
}

// remove completed/failed job from internal job array
queue.on('job complete', function(id, result) {
  getJobAndRemove(id);
});

queue.on('job error', function(id, result) {
  getJobAndRemove(id);
});

const REFRESH_FEED_JOB_TYPE = 'feed parser';
const REFRESH_VIDEO_JOB_TYPE = 'refresh video data';

var noop = function(){};

var jobs = [];

function findMatchingJobs(jobType, comp) {
  return jobs.filter(function(job) {
    return jobType === job.type && comp(job);
  });
}

function findMatchingRefreshFeedJobs(feed) {
  return findMatchingJobs(REFRESH_FEED_JOB_TYPE, function(job) {
    return job.data.id == feed.id;
  });
}

function findMatchingRefreshVideoJobs(video) {
  return findMatchingJobs(REFRESH_VIDEO_JOB_TYPE, function(job) {
    return job.data.id == video.id;
  });
}

function removeJob(job) {
  var matchingJobs;
  switch (job.type) {
    case REFRESH_FEED_JOB_TYPE:
      matchingJobs = findMatchingRefreshFeedJobs(job.data);
      break;
    case REFRESH_VIDEO_JOB_TYPE:
      matchingJobs = findMatchingRefreshVideoJobs(job.data);
      break;
    default:
      throw new Error('unknown job type: ' + job.type);
  }
  for (var i = 0; i < matchingJobs.length; i++) {
    var index = jobs.indexOf(matchingJobs[i]);
    jobs.splice(index, 1);
  }
}

module.exports = {
  removeJobs: function() {
    jobs.slice().forEach(function(job) {
      removeJob(job);
      job.remove(function(err) {
        if(err) throw err;
      });
    });
  },

  refreshFeed: function(feed, callback) {
    callback = callback == null ? noop : callback;

    var err;

    var matchingJobs = findMatchingRefreshFeedJobs(feed);
    if (matchingJobs.length > 0) err = new Error('job already exists');

    if (feed.id == null) err = new Error('feed id is missing');

    if (err) return callback(err, null);

    var opts = {
      id: feed.id,
      url: feed.toUrl(),
      title: feed.toUrl()
    };
    var job = queue
      .create(REFRESH_FEED_JOB_TYPE, opts)
      .save();

    jobs.push(job);

    callback(null, job);
  },

  refreshAllFeeds: function(callback) {
    callback = callback == null ? noop : callback;

    Feed.find(function(err, feeds) {
      if (err) return callback(err);

      var tasks = [];
      feeds.forEach(function(feed) {
        var task = function(cb) {
          KueService.refreshFeed(feed, cb);
        }
        tasks.push(task);
      });

      async.series(tasks, callback);
    });
  },

  refreshVideo: function(video, callback) {
    callback = callback == null ? noop : callback;

    var err;

    var matchingJobs = findMatchingRefreshVideoJobs(video);
    if (matchingJobs.length > 0) err = new Error('job already exists');

    if (video.id == null) err = new Error('video id is missing');

    if (err) return callback(err, null);

    var opts = {
      id: video.id,
      url: video.toUrl(),
      title: video.toUrl()
    };

    var job = queue
      .create(REFRESH_VIDEO_JOB_TYPE, opts)
      .save();

    jobs.push(job);

    callback(null, job);
  }
};
