/**
* Video.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

function videoToUrl(video) {
  if (video.site === 'youtube') {
    return 'https://youtube.com/watch?v=' + video.videoId;
  }

  throw new Error('Unknown site: ' + video.site);
}

module.exports = {

  attributes: {
    guid: {
      type: 'integer'
    },

    videoId: {
      type: 'string',
      required: true
    },

    site: {
      type: 'string',
      required: true,
      enum: ['youtube']
    },

    title: {
      type: 'string',
      required: true
    },

    description: {
      type: 'text'
    },

    uploadDate: {
      type: 'date'
    },

    duration: {
      type: 'integer'
    },

    image: {
      type: 'string'
    },

    feed: {
      model: 'feed'
    },

    formats: {
      collection: 'VideoFormat',
      via: 'video'
    },

    toUrl: function() {
      return videoToUrl(this);
    }
  },

  beforeCreate: function(criteria, callback) {
    GuidService.getGuid(Video, function(guid) {
      criteria.guid = guid;
      callback();
    });
  }
};
