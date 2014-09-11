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
    var guid = req.param('id');
    var query;

    if (guid != null) {
      query = Feed.findOneByGuid(guid);
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
   * Video definition:
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
  addVideos: function(req, res) {
    var videos = req.param('videos');
    var videoIds = videos.map(function(video) {
      return video.videoId;
    });

    Feed.findOneById(req.feed.id).populate('videos', {videoId: videoIds})
      .exec(function(err, feed) {
        if (err) return res.status(500).json({dbError: err});

        feed.videos.forEach(function(existingVideo) {
          var updatedVideoCriteria =
            getVideoWithId(existingVideo.videoId, videos);
          // remove updated video from array
          videos.splice(videos.indexOf(updatedVideoCriteria), 1);


          Video.update(existingVideo.id, updatedVideoCriteria,
            function(err, videos) {
              if (err) return res.status(500).json({dbError: err});
          });
        });

        videos.forEach(function(video) {
          video.site = req.feed.site;
          req.feed.videos.add(video);
        });

        req.feed.save(function(err) {
          if (err) {
            return res
              .status(500)
              .json({error: 'Error when saving feed', dbError: err});
          } else {
            return res.status(200).end();
          }
        });
      });
  },

  /**
   * /api/feeds/:id/refresh
   */

  refresh: function(req, res) {
    KueService.refreshFeed(req.feed);
    res.status(200).end();
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