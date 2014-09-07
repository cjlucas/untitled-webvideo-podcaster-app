module.exports = function(req, res, next) {
  if (this.currentUser == null || this.currentUser.role !== 'admin') {
    return res.status(403).send('Permission Denied');
  }

  next();
}