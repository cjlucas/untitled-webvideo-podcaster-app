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

    title: {
      type: 'string',
      required: true
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
    }
  }
};

