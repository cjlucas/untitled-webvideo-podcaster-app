/**
* Video.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
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

    width: {
      type: 'integer'
    },

    height: {
      type: 'integer'
    },

    videoUrl: {
      type: 'text',
      required: true
    },

    feed: {
      model: 'feed'
    }
  }
};
