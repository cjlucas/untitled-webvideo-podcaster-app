/**
 * UsersController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var UsersController = {

  create: function(req, res) {
    var email = req.param('email');
    var password = req.param('password');

    if (email == null
      || email.length == 0
      || password == null
      || password.length == 0) {
      return res
        .status(400)
        .json({error: 'email or password is missing.'});
    }

    User.count({email: email}, function(err, count) {
      if (err) return res.status(500).json({dbError: err});
      if (count > 0) return res.status(400).json({error: 'User already exists'});

      User.create({email: email, password: password}, function(err, user) {
        if (err) return res.status(500).json({dbErr: err});
        res.json(user);
      });
    });
  },

  /**
   * /api/users/:id/add_feed
   */
  addFeed: function(req, res) {
    var userId = req.param('id');
    var url = req.param('url');

    Feed.fromUrl(url, function onFeedLoad(feed) {
      if (feed == null) {
        return res.status(400).json({error: 'Invalid feed url'});
      }

      User.findById(userId).populate('feeds').exec(function(err, user) {
        if (err) return res.status(500).json({dbError: err});

        user.feeds.push(feed);
        user.save(function(err) {
          if (err) res.status(500).json({dbError: err});
          KueService.refreshFeed(feed, function(err, job) {
            res.json(feed);
          });
        });

      });
    });

  },

  login: function(req, res) {
    res.render('login', {layout: 'layout'});
  }
};

module.exports = UsersController;
