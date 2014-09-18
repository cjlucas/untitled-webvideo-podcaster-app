var exec = require('child_process').exec;
var fs = require('fs');
var temp = require('temp');

var common = require('./common');

var job;

function RefreshVideoDataWorker(apiHost, apiPort, apiToken, videoId, videoUrl) {
  this.videoId = videoId;
  this.videoUrl = videoUrl;
  this.client = common.newRequestClient(apiHost, apiPort, apiToken);

  this.work = function(j, done) {
    var self = this;
    job = j;

    var scraper = new common.YoutubeDLScraper(this.videoUrl);

    scraper.on('video', function(video) {
      var url = '/api/videos/' + self.videoId;
      job.log('PUT %s', url);
      self.client.put(url, video, function(err, res, body) {
        if (err) return done(err);

        job.log('Request response code: ' + res.statusCode);
      });
    });

    scraper.on('done', done);

    scraper.scrape();
  }
}

module.exports = RefreshVideoDataWorker;
