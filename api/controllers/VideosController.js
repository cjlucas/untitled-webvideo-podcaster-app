/**
 * VideosController
 *
 * @description :: Server-side logic for managing videos
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var http = require('http');
var https = require('https');
var urlParser = require('url').parse;

module.exports = {

  /**
   * GET /videos/:id/download
   *
   * Request Parameters:
   *   - maxHeight: the maximum height of the requested video
   *   - timeout: If a video's url is stale, the system will attempt to
   *              retrieve a a valid url. This parameter limits how long
   *              the system should stall before returning a response.
   */
  download: function(req, res) {
    var guid = req.param('id');
    var maxHeight = req.param('maxHeight');
    var timeout = req.param('timeout') || 30;
    var retryCount = Math.ceil(timeout / 2);
    var timer;
    var refreshJobQueued = false;

    var looper = function() {
      if (retryCount == 0) {
        clearInterval(timer);
        res.set('Retry-After', 2 * 60);
        return res.status(503).end();
      }

      retryCount--;

      Video.findOneByGuid(guid)
        .populate('formats', {sort: 'height DESC'})
        .exec(function(err, video) {
          if (err || !video) clearInterval(timer);
          if(err) return res.status(500).json({dbError: err});
          if (!video) return res.status(404).json({err: 'Video not found'});

          // check if video url is still alive
          var videoUrl = formatWithMaxHeight(maxHeight, video.formats).videoUrl;
          pingUrl(videoUrl, function(isValid) {
            if (!isValid) {
                if (!refreshJobQueued) {
                  refreshJobQueued = true;
                  KueService.refreshVideo(video);
                }
            } else {
              clearInterval(timer);
              res.redirect(videoUrl);
            }
          });
        });
    };


    looper();
    timer = setInterval(looper, 2000);
  },

  /**
   * PUT /videos/:id
   *
   * Request body: A single Video object
   *
   * Video definition:
   *   guid: the guid of an existing Video object
   *   videoId: site-specific video id
   *   title
   *   description
   *   image: url to video image
   *   duration: video duration in seconds
   *   uploadDate
   *   formats: an array of Format objects
   *
   * Format definition:
   *   videoUrl: direct link to video
   *   height
   *   width
   */
  update: function(req, res) {
    var guid = req.param('id');
    var newVideo = req.body;

    Video.update({guid: guid}, newVideo, function(err, results) {
      if (err) return res.status(500).json({dbError: err});
      if (results.length == 0) return res
        .status(404)
        .send('No video found');

      var afterDestroy = function(err) {
        if(err) return res.status(500).json({dbError: err});
        Video.findOneById(results[0].id)
          .populate('formats')
          .exec(function(err, video) {
            res.status(200).json(video);
          });
      };

      // Because Video##update() will create new formats and disassociate
      // any formats that were previously associated with the video,
      // we have to manually destroy the orphaned formats
      VideoFormat.destroy({video: null}).exec(afterDestroy);
    });
  }
};

function pingUrl(url, callback) {
  var opts = urlParser(url);
  opts.method = 'HEAD';
  var transport = opts.protocol === 'http:' ? http : https;
  var req = transport.request(opts, function(res) {
    return callback(res.statusCode == 200);
  });

  req.end();
}

function formatWithMaxHeight(maxHeight, formats) {
  formats.sort(function(a, b) {
    return a.height - b.height;
  });

  // return the largest format if max height not given
  if (maxHeight == null) {
    return formats[formats.length - 1];
  }

  var format = formats[0];

  formats.forEach(function(f) {
    if (f.height <= maxHeight
      && (format == null || format.height < f.height)) {
      format = f;
    }
  });

  return format;
}