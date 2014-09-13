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

    var cmd = 'youtube-dl -j ' + this.videoUrl;
    job.log('Executing: ' + cmd);
    exec(cmd, function(err, stdout, sterr) {
      if (err) return done(err);
      job.log('Finished executing');

      var data = JSON.parse('[' + stdout.toString() + ']');
      var video = common.parseYoutubeDlJSON(data)[0];

      job.log('Filtering video formats');
      video.formats = common.filterVideoFormats(video.formats);

      var url = '/api/videos/' + self.videoId;
      job.log('PUT %s', url);
      self.client.put(url, video, function(err, res, body) {
        if (err) return done(err);

        job.log('Request response code: ' + res.statusCode);
        done();
      })
    });


  }
}

module.exports = RefreshVideoDataWorker;
