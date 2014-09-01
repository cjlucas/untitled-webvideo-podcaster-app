/**
 * Load a feed when given an id, or return a 404 if a feed doesn't exist.
 *
 * This policy will provide this.feed to all actions that adopt it.
 *
 * @note This policy should be used in conjunction with requireIdParameter.
 */
module.exports = function(req, res, next) {
  Feed.findOneById(req.param('id'))
    .then(function(feed) {
      if (!feed) return res.status(404).json({error: 'Feed not found'});
      this.feed = feed;
      next();
    })
    .fail(function(err) {
      return res
        .status(500)
        .json({error: 'Error occured during query', dbError: err});
    });

};