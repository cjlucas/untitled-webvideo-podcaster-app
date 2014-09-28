/**
 * VideosController
 *
 * @description :: Server-side logic for managing videos
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var request = require('request');

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
    const INTERVAL_SECS = 2;
    var id = req.param('id');
    var maxHeight = req.param('maxHeight');
    var timeout = req.param('timeout') || 30;
    var retryCount = Math.ceil(timeout / INTERVAL_SECS);
    var refreshJobQueued = false;

    var loadVideoUrl = function() {
      if (retryCount == 0) {
        res.set('Retry-After', 2 * 60);
        return res.status(503).end();
      }
      retryCount--;

      Video.findById(id)
        .populate('formats', {sort: 'height DESC'})
        .exec(function(err, video) {
          if(err) return res.status(500).json({dbError: err});
          if (!video) return res.status(404).json({err: 'Video not found'});

          if (video.formats.length == 0) {
            console.log("WARNING: video.formats is empty");
            return;
          }

          // check if video url is still alive
          var videoUrl = video.formatWithMaxHeight(maxHeight).videoUrl;
          var reqOptions = {
            url: videoUrl,
            method: 'HEAD',
            timeout: 2000,
            followRedirect: false
          };
          request(reqOptions, function(err, resp, body) {
            if (err || resp.statusCode >= 400) {
              if (!refreshJobQueued) {
                refreshJobQueued = true;
                KueService.refreshVideo(video);
              }

              setTimeout(loadVideoUrl, INTERVAL_SECS * 1000);
            } else {
              res.redirect(videoUrl);
            }
          });
        });
    };


    loadVideoUrl();
  },

  /**
   * PUT /videos/:id
   *
   * Request body: A single Video object
   *
   * Video definition:
   *   id: the id of an existing Video object
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
    var id = req.param('id');
    var newVideo = req.body;

    Video.findByIdAndUpdate(id, newVideo, function(err, video) {
      // TODO: should return a 400 if err because
      // it means an invalid id was given
      if (err) return res.status(500).json({dbError: err});
      if (!video) return res.status(404).send('No video found');

      return res.json(video);
    });
  }
};
