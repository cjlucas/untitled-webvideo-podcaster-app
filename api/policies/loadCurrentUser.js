module.exports = function(req, res, next) {
  if (req.session.user == null) {
    return next();
  } else {
    User.findOneByEmail(req.session.user)
      .then(function(user) {
        req.currentUser = user;
        return next();
      });
  }
}