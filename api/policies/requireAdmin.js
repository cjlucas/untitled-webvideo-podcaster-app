module.exports = function(req, res, next) {
  if (req.currentUser == null || req.currentUser.role !== 'admin') {
    return res.status(403).send('Permission Denied');
  }

  next();
}