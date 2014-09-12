var spawn = require('child_process').spawn;
var fs = require('fs');
var request = require('request-json');
var temp = require('temp');

function FeedParserWorker(apiHost, apiPort, feedId, feedUrl) {
  this.feedId  = feedId;
  this.feedUrl = feedUrl;
  this.client = request.newClient('http://' + apiHost + ':' + apiPort);
  this.client.setToken('aac027c483d1b880bf60f88431bff7d26e65fd55');

  this.work = function(job, done) {
    var self = this;

    self.client.get('/api/feeds/' + self.feedId, function(err, res, feed) {
      var downloadArchive = [];
      console.log(feed);
      feed.videos.forEach(function(video) {
        // the format of the youtube-dl download archive is "SITE VIDEOID"
        var line = 'youtube ' + video.videoId;
        if (downloadArchive.indexOf(line) == -1) {
          downloadArchive.push(line);
        }
      });

      scrape(self.feedUrl, downloadArchive, function(videos) {
        videos.forEach(function(video) {
          video.formats = filterFormats(video.formats);
        });

        if (videos.length == 0) {
          console.log('No new videos.');
          done();
          return;
        }

        const BATCH_SIZE = 100;
        var cursor = 0;

        while (videos.length - cursor > 0) {
          console.log('cursor: ' + cursor);
          self.client
            .post('/api/feeds/' + self.feedId + '/add_videos',
            {videos: videos.slice(cursor, cursor + BATCH_SIZE)},
            function(err, res, body) {
              console.log(res.statusCode);
//              console.log(body);
              console.log(res.headers);
            });
          cursor += BATCH_SIZE;
        }
        done();
      });
    });
  };

  function filterFormats(formats) {
    return formats.filter(function(format) {
      // filter audio formats
      if (format.height == null && format.width == null) {
        return false;
      }

      // filter non-mp4 videos
      if (format.ext !== 'mp4') {
        return false;
      }

      // filter DASH video
      if (format.acodec === 'none') {
        return false;
      }

      // filter tiny videos
      if (format.height < 240) {
        return false;
      }

      return true;
    });
  }


  function scrape(feedUrl, downloadArchive, callback) {
    buildScrapeArgs(feedUrl, downloadArchive, function(args) {
      // save stdout to temp file
      temp.open('youtubedl', function(err, info) {
        if (err) throw err;
        console.log('Saving data to ' + info.path);

        console.log('youtube-dl ' + args.join(' '));
        var child = spawn('youtube-dl', args);

        child.on('close', function() {
          console.log('child close');

          fs.close(info.fd, function(err) {
            if (err) throw err;
            // conveniently, youtube-dl splits each video by newline
            var data = fs.readFileSync(info.path).toString().trim();

            // if no new videos available, respond to callback with an empty array
            if (data.length == 0) {
              return callback([]);
            }

            var videos = data.trim().split('\n').map(function(line) {
              return JSON.parse(line);
            });

            videos = videos.filter(function(video) {
              return video != null;
            });

            callback(parseYoutubeDlJSON(videos));
          });
        });

        child.on('error', function(err) {
          console.log('child err');
          throw err;
        });

        child.stdout.on('data', function(chunk) {
          fs.writeSync(info.fd, chunk.toString());
        });

        child.stdout.on('error', function(err) {
          console.log('on child.stdout error: ' + err);
        });

        child.stderr.on('data', function(chunk) {
          console.log('stderr on data');
          console.log(chunk.toString());
        });
      })
    });
  }

  function buildScrapeArgs(feedUrl, downloadArchive, callback) {
    var args = ['-j', feedUrl];
    if (downloadArchive.length > 0) {
      temp.open('youtubedlarchive', function(err, info) {
        if (err) throw err;
        console.log('Writing temp download archive to ' + info.path);

        var data = downloadArchive.join('\n');
        fs.write(info.fd, data);
        fs.close(info.fd, function(err) {
          if (err) throw err;

          args.unshift(info.path);
          args.unshift('--download-archive');
          callback(args);
        });
      });
    } else {
      callback(args);
    }

  }
}

/**
 * Map youtube-dl json data to data suitable for /api/feeds/add_videos
 */
function parseYoutubeDlJSON(data) {
  var videos = [];

  data.forEach(function(from) {
    var video = {
      videoId: from.display_id,
      title: from.title,
      description: from.description,
      image: from.thumbnail,
      duration: from.duration,
      uploadDate: new Date(
        from.upload_date.slice(0, 4),
        from.upload_date.slice(4, 6),
        from.upload_date.slice(6, 8)
      ),
      formats: []
    };

    from.formats.forEach(function(format) {
      this.formats.push({
        videoUrl: format.url,
        height: format.height,
        width: format.width,
        ext: format.ext,
        acodec: format.acodec
      });
    }, video);

    videos.push(video);
  });

  return videos;
}

module.exports = FeedParserWorker;
