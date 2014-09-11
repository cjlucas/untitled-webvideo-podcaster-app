/**
 * VideosController
 *
 * @description :: Server-side logic for managing videos
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  // GET /videos/:id/download
  download: function(req, res) {
    var guid = req.param('id');
    var maxHeight = req.param('maxHeight');

    var videoFormatCriteria = {sort: 'height DESC'};
    if (maxHeight != null) {
      videoFormatCriteria.where = {
        height: {'<=': maxHeight}
      }
    }

    Video.findOneByGuid(guid)
      .populate('formats', videoFormatCriteria)
      .exec(function(err, video) {
        if(err) return res.status(500).json({dbError: err});
        res.redirect(video.formats[0].videoUrl);
      });
  }
};

