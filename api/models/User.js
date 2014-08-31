/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var UserModel = {

  attributes: {
    email: {
      type: 'string',
      required: true,
      index: true
    },

    password: {
      type: 'string',
      required: true
    },

    role: {
      type: 'string',
      enum: ['user', 'admin'],
      defaultsTo: 'user'
    },

    feeds: {
      collection: 'feed',
      via: 'users',
      dominant: true
    }
  }
};

module.exports = UserModel;