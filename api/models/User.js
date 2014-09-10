/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var crypto = require('crypto');
var bcrypt = require('bcrypt');

function isEncrypted(string) {
  try {
    bcrypt.getRounds(string);
    return true;
  } catch (e) {
    return false;
  }
}

function createToken() {
  var hash = crypto.createHash('sha1');
  hash.update(Date.now().toString());
  return hash.digest('hex');
}

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

    token: {
      type: 'string'
    },

    feeds: {
      collection: 'feed',
      via: 'users',
      index: true
    }
  },

  beforeCreate: function(userData, callback) {
    userData.token = createToken();

    if(!isEncrypted(userData.password)) {
      bcrypt.hash(userData.password, 10, function(err, encryptedPassword) {
        userData.password = encryptedPassword;
        callback();
      });
    } else {
      callback();
    }
  },

  login: function(email, password, callback) {
    User.findOneByEmail(email)
      .then(function(user) {
        bcrypt.compare(password, user.password, function(err, same) {
          if (same) {
            callback(null, user);
          } else {
            callback('Incorrect password', null);
          }
        });
      })
      .fail(function(err) {
        callback('User with email not found', null);
      });
  }
};

module.exports = UserModel;