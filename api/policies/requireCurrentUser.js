module.exports = function(req, res, next) {
  if (this.currentUser == null) {
    return res.redirect('/login')
  }

  next();
}