/**
 * Require that the current user has access to the specified feed.
 *
 * Users with role of user can only access feeds associated with user.
 * Users with role of admin can access any feed.
 *
 * @note req.currentUser and req.feed should both be available before this
 * policy is run.
 */

module.exports = function(req, res, next) {
  if (req.currentUser.role === 'admin') {
    return next();
  }

  User.findById(req.currentUser.id)
    .populate('feeds')
    .exec(function(err, user) {
      if (err) {
        res
          .status(500)
          .json({error: 'Error when verifying api permissions', dbError: err});
      } else if (getIds(user.feeds).indexOf(req.feed.id)) {
        res.status(403).send('Permission Denied');
      } else {
        next();
      }
    });
};

function getIds(models) {
  return models.map(function(model) {
    return model.id;
  });
}