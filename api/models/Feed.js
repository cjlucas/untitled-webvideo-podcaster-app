/**
 * Feed.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var Schema = require('mongoose').Schema;

/**
 * Helpers
 */

FeedMatcher = function(regex, feedIdIndex, site, feedType) {
  this.regex = regex;
  this.feedIdIndex = feedIdIndex;
  this.site = site;
  this.feedType = feedType;
  this._match = null;

  this.isMatch = function(url) {
    this._match = this.regex.exec(url);
    return this._match != null;
  };

  this.getFeedId = function() {
    return this._match[this.feedIdIndex];
  };
};

var feedMatchers = [];

function addFeedMatcher(regex, feedIdIndex, site, feedType) {
  feedMatchers.push(new FeedMatcher(regex, feedIdIndex, site, feedType));
}

addFeedMatcher(/youtube.com\/user\/(\w*)[\?\&]?/i, 1, 'youtube', 'channel');

function findOrCreateFeed(criteria, callback) {
  Feed.findOne(criteria).exec(function(error, feed) {
    if (feed == null) {
      Feed.create(criteria, function(err, feed) {
        if (err) throw err;
        callback(feed);
      });
    } else {
      callback(feed);
    }
  });
}

function feedForUrl(url, callback) {
  var foundMatch = false;

  for (var i = 0; i < feedMatchers.length; i++) {
    var matcher = feedMatchers[i];
    if (matcher.isMatch(url)) {
      var criteria = {
        site: matcher.site,
        feedType: matcher.feedType,
        feedId: matcher.getFeedId()
      };
      return findOrCreateFeed(criteria, callback);
    }
  }

  callback(null);
}

function urlForFeed(feed) {
  if (feed.site === 'youtube' && feed.feedType === 'channel') {
    return 'https://www.youtube.com/user/' +
      feed.feedId + '/videos';
  }

  throw new Error("Can't generate url for feed");
}

/**
 * Schema
 */

//var FeedModel = {
//  attributes: {
//    guid: {
//      type: 'integer',
//      index: true
//    },
//
//    site: {
//      type: 'string',
//      enum: ['youtube'],
//      required: true
//    },
//
//    feedType: {
//      type: 'string',
//      enum: ['channel'],
//      required: true
//    },
//
//    feedId: {
//      type: 'string',
//      required: true
//    },
//
//    users: {
//      collection: 'user',
//      via: 'feeds'
//    },
//
//    videos: {
//      collection: 'video',
//      via: 'feed'
//    },
//
//    toUrl: function() {
//      return urlForFeed(this);
//    },
//
//    toJSON: function() {
//      var obj = this.toObject();
//      obj.url = this.toUrl();
//      return obj;
//    }
//
//  },
//
//  beforeCreate: function(criteria, callback) {
//    GuidService.getGuid(Feed, function(guid) {
//      criteria.guid = guid;
//      callback();
//    });
//  },
//
//  fromUrl: function(url, callback) {
//    return feedForUrl(url, callback);
//  }
//};
//
//module.exports = FeedModel;

var validSites = ['youtube'];
var validFeedTypes = ['channel'];

var FeedSchema = new Schema({
  site: {type: String, enum: validSites, required: true},
  feedType: {type: String, enum: validFeedTypes, required: true},
  feedId: {type: String, required: true},
  users: [{type: Schema.Types.ObjectId, ref: 'User'}],
  videos: [{type: Schema.Types.ObjectId, ref: 'Video'}]
});

FeedSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

FeedSchema.statics.fromUrl = function(url, callback) {
  return feedForUrl(url, callback);
};

FeedSchema.methods.toUrl = function() {
  return urlForFeed(this);
};

module.exports = FeedSchema;