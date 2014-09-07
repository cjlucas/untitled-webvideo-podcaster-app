/**
 * DashboardController
 *
 * @description :: Server-side logic for managing dashboards
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  index: function(req, res) {
    User
      .findOneById(this.currentUser.id)
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
      + this.currentUser.id
      + '/add_feed?url=' + url);
  }
};

