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
      res.status(500).json({error: 'Invalid parameters given'});
    }

    query.exec(function(err, feed){
      if (err || !feed) return res.status(404).end();

      res.json(feed);
    });
  }
};

