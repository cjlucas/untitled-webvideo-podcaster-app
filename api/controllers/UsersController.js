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

    User.findOneByEmail(email).exec(function(err, user) {
      if (user != null) {
        return res
          .status(500)
          .json({error: 'User with that email already exists.'});
      }

      User.create({email: email, password: password})
        .then(function(user) {
          res.json(user);
        })
        .fail(function(error) {
          res.status(500).json({error: 'Database Error: User creation failed.'})
        });
    })
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

      User.findOneById(userId)
        .then(function(user) {
          var saveUser = function() {
            user.save(function(err) {
              if (err) res.status(500).json({dbError: err});
              res.json(feed);
            });
          };
          user.feeds.add(feed);
          saveUser();
        })
        .fail(function(err) {
          res.status(500).json({dbError: err});
        });
    });

  },

  login: function(req, res) {
    res.render('login', {layout: 'layout'});
  }
};

module.exports = UsersController;
