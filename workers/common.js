var request = require('request-json');

/**
 * Map youtube-dl json data to data suitable for /api/feeds/add_videos
 */
function parseYoutubeDlJSON(data) {
  var videos = [];

  data.forEach(function(from) {
    var video = {
      videoId: from.display_id,
      title: from.title,
      description: from.description,
      image: from.thumbnail,
      duration: from.duration,
      uploadDate: new Date(
        from.upload_date.slice(0, 4),
        from.upload_date.slice(4, 6),
        from.upload_date.slice(6, 8)
      ),
      formats: []
    };

    from.formats.forEach(function(format) {
      this.formats.push({
        videoUrl: format.url,
        height: format.height,
        width: format.width,
        ext: format.ext,
        acodec: format.acodec
      });
    }, video);

    videos.push(video);
  });

  return videos;
}

module.exports.parseYoutubeDlJSON = parseYoutubeDlJSON;

function newRequestClient(host, port, token) {
  var client = request.newClient('http://' + host + ':' + port);
  if (token != null) client.setToken(token);
  return client;
}

module.exports.newRequestClient = newRequestClient;

function filterVideoFormats(formats) {
  return formats.filter(function(format) {
    // filter audio formats
    if (format.height == null && format.width == null) {
      return false;
    }

    // filter non-mp4 videos
    if (format.ext !== 'mp4') {
      return false;
    }

    // filter DASH video
    if (format.acodec === 'none') {
      return false;
    }

    // filter tiny videos
    if (format.height < 240) {
      return false;
    }

    return true;
  });
}

module.exports.filterVideoFormats = filterVideoFormats;