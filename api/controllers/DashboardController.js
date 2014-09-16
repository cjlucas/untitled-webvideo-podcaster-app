/**
 * DashboardController
 *
 * @description :: Server-side logic for managing dashboards
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  index: function(req, res) {
    User
      .findOneById(req.currentUser.id)
      .populate('feeds')
      .exec(function(err, user) {
        res.render('feeds', {user: user});
      });
   },

  /**
   * POST /add_feed
   */
  addFeed: function(req, res) {
    var url = req.param('url');
    res.redirect('/api/users/'
      + req.currentUser.id
      + '/add_feed?url=' + url);
  },

  /**
   * GET /feed/:id
   */

  feed: function(req, res) {
    Feed.findOneByGuid(req.param('id')).populate('videos').exec(function(err, feed) {
      if(err) return res.status(500).json({dbError: err});
      if(!feed) return res.status(404).send('Feed not found');

      var address = PublicAddressService.getPublicAddress();

      res.set('Content-Type', 'application/rss+xml');
      res.render('feedxml', {feed: feed, address: address, layout: false});
    })
  }
};
