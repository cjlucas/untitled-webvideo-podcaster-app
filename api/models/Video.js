/**
* Video.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var Schema = require('mongoose').Schema;

function videoToUrl(video) {
  if (video.site === 'youtube') {
    return 'https://youtube.com/watch?v=' + video.videoId;
  }

  throw new Error('Unknown site: ' + video.site);
}


var validSites = ['youtube'];

var VideoSchema = new Schema({
  videoId: {type: String, required: true},
  site: {type: String, enum: validSites, required: true},
  title: {type: String, required: true},
  description: String,
  uploadDate: Date,
  duration: Number,
  image: String,
  feed: {type: Schema.Types.ObjectId, ref: 'Feed'},
  formats: [
    {
      width: {type: Number, index: true},
      height: {type: Number, index: true},
      videoUrl: {type: String, required: true}
    }
  ]
});

VideoSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

VideoSchema.methods.toUrl = function() {
  return videoToUrl(this);
};

module.exports = VideoSchema;