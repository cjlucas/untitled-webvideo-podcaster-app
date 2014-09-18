var spawn = require('child_process').spawn;
var fs = require('fs');
var temp = require('temp');
var async = require('async');

var newRequestClient = require('./common').newRequestClient;
var filterFormats = require('./common').filterVideoFormats;
var YoutubeDLScraper = require('./common').YoutubeDLScraper;

var job;

function FeedParserWorker(apiHost, apiPort, apiToken, feedId, feedUrl) {
  this.feedId  = feedId;
  this.feedUrl = feedUrl;
  this.client = newRequestClient(apiHost, apiPort, apiToken);

  this.work = function(j, done) {
    var self = this;
    job = j;

    var url = '/api/feeds/' + self.feedId;
    job.log('Fetching %s', url);
    self.client.get(url, function(err, res, feed) {
      if (err) return done(err);
      if (res.statusCode == 403) return done(new Error('Permission denied'));
      if (!feed) return done(new Error('Could not get feed'));

      job.log('Feed has %d existing videos', feed.videos.length);

      temp.open('youtubedlDownloadArchive', function(err, info) {
        if (err) return done(err);
        job.log('Writing download archive to: ' + info.path);

        feed.videos.forEach(function(video) {
          // the format of the youtube-dl download archive is "SITE VIDEOID"
          var line = 'youtube ' + video.videoId;
          fs.writeSync(info.fd, line + '\n');
        });

        fs.closeSync(info.fd);

        var opts = {downloadArchive: info.path};
        var scraper = new YoutubeDLScraper(self.feedUrl, opts);
        scraper.on('video', function(video) {
          self.client
            .post('/api/feeds/' + self.feedId + '/add_videos',
            {videos: [video]},
            function(err, res, body) {
              job.log('/add_videos response status code: %d', res.statusCode);
            });
        });

        scraper.on('done', done);

        scraper.scrape();
      });
    });
  };
}

module.exports = FeedParserWorker;
