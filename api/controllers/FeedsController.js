/**
 * FeedsController
 *
 * @description :: Server-side logic for managing feeds
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  index: function(req, res) {
    res.render('feeds', {user: this.currentUser} );
  },

  find: function(req, res) {
    var feedId = req.param('feedId');
    var id = req.param('id');
    var query;

    if (feedId != null) {
      query = Feed.findOneByFeedId(feedId);
    } else if (id != null) {
      query = Feed.findOneById(id);
    } else {
      return res.status(500).json({error: 'Invalid parameters given'});
    }

    query.exec(function(err, feed){
      if (err || !feed) return res.status(404).end();

      res.json(feed);
    });
  },

  addVideos: function(req, res) {
    var id = req.param('id');
    var videos = req.param('videos');

    Feed.findOneById(id).exec(function(err, feed) {
      videos.forEach(function(video) {
        feed.videos.add(video);
      });

      feed.save(function(err) {
        if (err) return res.status(500).json({error: 'Error when saving feed', dbError: err});

        Feed.findOneById(id)
          .populate('videos')
          .exec(function(err, feed) {
            res.json(feed);
        })
      });
    });
  },
};

