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
    var feedId = req.param('feedId');
    var id = req.param('id');
    var query;

    if (feedId != null) {
      query = Feed.findOneByFeedId(feedId);
    } else if (id != null) {
      query = Feed.findOneById(id);
    } else {
      query = Feed.find();
    }

    query.populate('videos').exec(function(err, feed){
      if (err || !feed) return res.status(404).end();
      res.json(feed);
    });
  },

  /**
   * /api/feeds/:id/add_videos
   */
  addVideos: function(req, res) {
    var videos = req.param('videos');

    videos.forEach(function(video) {
      video.site = this.feed.site;
      this.feed.videos.add(video);
    });

    this.feed.save(function(err) {
      if (err) {
        return res
          .status(500)
          .json({error: 'Error when saving feed', dbError: err});
      }

      Feed.findOneById(this.feed.id)
        .populate('videos')
        .exec(function(err, feed) {
          res.json(feed);
        })
    });
  },

  /**
   * /api/feeds/:id/refresh
   */

  refresh: function(req, res) {
    KueService.refreshFeed(feed);
    res.status(200).end();
  }
};

