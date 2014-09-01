/**
 * FeedsController
 *
 * @description :: Server-side logic for managing feeds
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  find: function(req, res) {
    var feedId = req.param('feedId');
    var id = req.param('id');
    var query;

    if (feedId != null) {
      query = Feed.findOneByFeedId(feedId);
    } else if (id != null) {
      query = Feed.findOneById(id);
    } else {
      query = Feed.find()
    }

    query.exec(function(err, feed){
      if (err || !feed) return res.status(404).end();

      res.json(feed);
    });
  },

  addVideos: function(req, res) {
    var videos = req.param('videos');

    videos.forEach(function(video) {
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

  getVideoIds: function(req, res) {
    Feed.findOneById(req.param('id')).populate('videos')
      .then(function(feed) {
        if (!feed) return res.status(404).json({error: 'Feed not found'});

        var videosIds = feed.videos.map(function(video) {
          return video.videoId;
        });

        res.json(videosIds);

      })
      .fail(function(err) {
        return res
          .status(500)
          .json({error: 'Error occurred during query', dbError: err});
      });
  }
};

