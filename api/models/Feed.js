/**
 * Feed.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
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
      console.log('feed doesnt exist, creating');
      Feed.create(criteria)
        .then(function(feed) {
          console.log('feed created');
          callback(feed);
        })
        .fail(function(error) {
          console.log(error);
          throw error;
        });
    } else {
      callback(feed);
    }
  });
}

function feedForUrl(url, callback) {
  var foundMatch = false;

  for (var i = 0; i < feedMatchers.length; i++) {
    console.log('here1');
    var matcher = feedMatchers[i];
    if (matcher.isMatch(url)) {
      console.log('isMatch');
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

var FeedModel = {
  attributes: {
    site: {
      type: 'string',
      enum: ['youtube'],
      required: true
    },

    feedType: {
      type: 'string',
      enum: ['channel'],
      required: true
    },

    feedId: {
      type: 'string',
      required: true
    },

    users: {
      collection: 'user',
      via: 'feeds'
    },

    videos: {
      collection: 'video',
      via: 'feed'
    },

    toUrl: function() {
      return urlForFeed(this);
    },

    toJSON: function() {
      var obj = this.toObject();
      obj.url = this.toUrl();
      return obj;
    }
  },

  fromUrl: function(url, callback) {
    return feedForUrl(url, callback);
  }
};

module.exports = FeedModel;
