/**
 * Ensures param id is given.
 *
 * Returns status code 500 if it is missing.
 */
module.exports = function(req, res, next) {
  if (req.param('id') == null) {
    return res
      .status(500)
      .json({error: 'Invalid parameters (missing id).'});
  }

  next();
};