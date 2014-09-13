var spawn = require('child_process').spawn;
var fs = require('fs');
var temp = require('temp');

var parseYoutubeDlJSON = require('./common').parseYoutubeDlJSON;
var newRequestClient = require('./common').newRequestClient;
var filterFormats = require('./common').filterVideoFormats;

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
      if (feed == null) {
        return done(new Error('Could not get feed'));
      }

      job.log('Feed has %d existing videos', feed.videos.length);
      var downloadArchive = [];
      feed.videos.forEach(function(video) {
        // the format of the youtube-dl download archive is "SITE VIDEOID"
        var line = 'youtube ' + video.videoId;
        if (downloadArchive.indexOf(line) == -1) {
          downloadArchive.push(line);
        }
      });

      scrape(self.feedUrl, downloadArchive, function(err, videos) {
        if (err) return done(err);
        job.log('Filtering video formats');
        videos.forEach(function(video) {
          video.formats = filterFormats(video.formats);
        });

        // filter videos with no formats
        videos = videos.filter(function(video) {
          return video.formats.length != 0;
        });

        if (videos.length == 0) {
          job.log('No new videos. Finishing.');
          return done();
        }

        const BATCH_SIZE = 100;
        var cursor = 0;

        job.log('New videos found: %d', videos.length);

        while (videos.length - cursor > 0) {
          self.client
            .post('/api/feeds/' + self.feedId + '/add_videos',
            {videos: videos.slice(cursor, cursor + BATCH_SIZE)},
            function(err, res, body) {
              job.log('/add_videos response status code: %d', res.statusCode);
            });
          cursor += BATCH_SIZE;
        }

        done();
      });
    });
  };


  function scrape(feedUrl, downloadArchive, callback) {
    buildScrapeArgs(feedUrl, downloadArchive, function(err, args) {
      if (err) return callback(err);
      // save stdout to temp file
      temp.open('youtubedl', function(err, info) {
        if (err) return callback(err);
        job.log('Executing: youtube-dl ' + args.join(' '));
        job.log('Writing temp data to ' + info.path);
        var child = spawn('youtube-dl', args);

        child.on('close', function() {
          job.log('youtube-dl finished executing');

          fs.close(info.fd, function(err) {
            if (err) return callback(err);
            // conveniently, youtube-dl splits each video by newline
            var data = fs.readFileSync(info.path).toString().trim();

            // if no new videos available, respond to callback with an empty array
            if (data.length == 0) {
              return callback(null, []);
            }

            var videos = data.trim().split('\n').map(function(line) {
              return JSON.parse(line);
            });

            videos = videos.filter(function(video) {
              return video != null;
            });

            callback(null, parseYoutubeDlJSON(videos));
          });
        });

        child.on('error', function(err) {
          return callback(err);
        });

        child.stdout.on('data', function(chunk) {
          fs.writeSync(info.fd, chunk.toString());
        });

        child.stdout.on('error', function(err) {
          return callback(err);
        });
      })
    });
  }

  function buildScrapeArgs(feedUrl, downloadArchive, callback) {
    var args = ['-j', feedUrl];
    if (downloadArchive.length > 0) {
      temp.open('youtubedlarchive', function(err, info) {
        if (err) return callback(err);
        job.log('Writing temp download archive to ' + info.path);

        var data = downloadArchive.join('\n');
        fs.write(info.fd, data);
        fs.close(info.fd, function(err) {
          if (err) return callback(err);

          args.unshift(info.path);
          args.unshift('--download-archive');
          callback(null, args);
        });
      });
    } else {
      callback(null, args);
    }

  }
}



module.exports = FeedParserWorker;
