/**
 * FeedsController
 *
 * @description :: Server-side logic for managing feeds
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  /**
   * /api/feeds
   */
  find: function(req, res) {
    var id = req.param('id');
    var query;

    if (id != null) {
      query = Feed.findById(id);
    } else {
      query = Feed.find();
    }

    query.populate('videos').exec(function(err, feed){
      if (err || !feed) return res.status(404).end();
      res.json(feed);
    });
  },

  /**
   * POST /api/feeds/:id/add_videos
   *
   * Request Body:
   *   videos: An array of Video objects
   *
   * See VideosController#update for the definition of a Video object.
   */

  addVideos: function(req, res) {
    var newVideos = req.param('videos');
    var videoIds = newVideos.map(function(video) {
      return video.videoId;
    });

    Feed.findById(req.feed.id).populate('videos')
      .exec(function(err, feed) {
        if (err) return res.status(500).json({dbError: err});

        // update existing videos, then remove them from array
        feed.videos.forEach(function(existingVideo) {
          // remove updated video from array
          var updatedVideoCriteria =
            getVideoWithId(existingVideo.videoId, newVideos);

          // continue if updated criteria doesn't exist in new videos
          if (updatedVideoCriteria == null) {
            return;
          }

          // remove updated video from array of new videos
          newVideos.splice(newVideos.indexOf(updatedVideoCriteria), 1);

          Video.update(existingVideo.id, updatedVideoCriteria,
            function(err, videos) {
              if (err) return res.status(500).json({dbError: err});
          });
        });

        // associate new videos with feed site
        newVideos.forEach(function(video) {
          video.site = feed.site;
        });

        // create new videos
        Video.create(newVideos, function(err) {
          if (err) return res.status(500).json({dbError: err});

          for (var i = 1; i < arguments.length; i++) {
            feed.videos.push(arguments[i]);
          }

          feed.save(function(err) {
            if (err) {
              return res
                .status(500)
                .json({error: 'Error when saving feed', dbError: err});
            } else {
              return res.status(200).end();
            }
          });
        });
      });
  },

  /**
   * /api/feeds/:id/refresh
   */

  refresh: function(req, res) {
    KueService.refreshFeed(req.feed, function(err, job) {
      if (err) return res.status(500).json({error: err.message});
      res.status(200).end();
    });
  }
};

function getVideoWithId(videoId, videos) {
  var video = null;
  for(var i = 0; i < videos.length; i++) {
    if (videos[i].videoId === videoId) {
      video = videos[i];
      break;
    }
  }

  return video;
}