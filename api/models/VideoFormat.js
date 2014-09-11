/**
* VideoFormat.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    width: {
      type: 'integer',
      index: true
    },

    height: {
      type: 'integer',
      index: true
    },

    videoUrl: {
      type: 'text',
      required: true
    },

    video: {
      model: 'video'
    }
  }
};

