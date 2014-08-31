module.exports = function(req, res, next) {
  console.log('here');
  if (req.session.user == null) {
    return next();
  } else {
    console.log('here1');
    User.findOneByEmail(req.session.user)
      .then(function(user) {
        console.log('here2');
        this.currentUser = user;
        return next();
      });
  }
}