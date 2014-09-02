/**
 * DashboardController
 *
 * @description :: Server-side logic for managing dashboards
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  index: function(req, res) {
    User
      .findById(this.currentUser.id)
      .populate('feeds')
      .exec(function(err, user) {
        res.render('feeds', {user: user});
      });
  }
};

