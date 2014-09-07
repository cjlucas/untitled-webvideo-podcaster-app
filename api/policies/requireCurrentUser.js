module.exports = function(req, res, next) {
  if (this.currentUser == null) {
    // don't redirect to login if trying to access api
    if (req.path.match(/^\/api\//)) {
      return res.status(403).send('Permission denied');
    }
    return res.redirect('/login')
  }

  next();
}