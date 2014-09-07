/**
 * Require that the current user has access to the specified user.
 *
 * Users with role of user can only access itself.
 * Users with role of admin can access any user.
 *
 * @note req.currentUser should both be available before this policy is run.
 */
module.exports = function(req, res, next) {
  if (req.currentUser.role !== 'admin'
      && req.param('id') != req.currentUser.id) {
    return res.status(403).send('Permission denied');
  }

  next();
};