module.exports = function(req, res, next) {
  if (req.session.user != null) {
    User.findOneByEmail(req.session.user)
      .then(function(user) {
        req.currentUser = user;
        return next();
      });
  } else if (req.headers['x-auth-token'] != null) {
    User.findOneByToken(req.headers['x-auth-token'])
      .then(function(user) {
        req.currentUser = user;
        return next();
      });
  } else {
    return next();
  }
};