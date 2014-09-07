/**
 * Require that the current user has access to the specified feed.
 *
 * Users with role of user can only access feeds associated with user.
 * Users with role of admin can access any feed.
 *
 * @note this.currentUser and this.feed should both be available before this
 * policy is run.
 */

module.exports = function(req, res, next) {
  if (this.currentUser.role === 'admin') {
    return next();
  }

  Feed.findOneById(this.feed.id)
    .populate('users', {id: this.currentUser.id})
    .exec(function(err, feed) {
      if (err) {
        res
          .status(500)
          .json({error: 'Error when verifying api permissions', dbError: err});
      } else if (feed.users.length == 0) {
        console.log('here');
        res.status(403).send('Permission Denied');
      } else {
        next();
      }
    });
};