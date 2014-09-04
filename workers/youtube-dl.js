var temp = require('node-temp');
var fs = require('fs');

function youtubeDlScraperJob(feedUrl, archiveIds) {
  writeArchiveIds(archiveIds, function(err, downloadArchivePath) {
    var opts = ['youtube-dl', '-j', feedUrl];
    if (downloadArchivePath != null) {
      opts.push('--download-archive');
      opts.push(downloadArchivePath);
    }

    var cmd = opts.join(' ');

  });
}

function writeArchiveIds(archiveIds, callback) {
  temp.open('archive', function(err, info) {
    if (err) {
      console.log('Error when creating temp file. skipping --download-archive')
      return;
    }

    fs.write(info.fd, archiveIds.join('\n'))
    fs.close(info.fd)
    callback(info.path);
  });
}