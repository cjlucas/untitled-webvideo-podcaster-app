module.exports = function(req, res, next) {
  if (req.session.user != null) {
    User.findOne({email: req.session.user}, function(err, user) {
      if(err) return res.status(500).json({dbError: err});
      req.currentUser = user;
      return next();
    });

  } else if (req.headers['x-auth-token'] != null) {
    User.findOne({token: req.headers['x-auth-token']}, function(err, user) {
      if (err) return res.status(500).json({dbError: err});
      req.currentUser = user;
      return next();
    });
  } else {
    return next();
  }
};