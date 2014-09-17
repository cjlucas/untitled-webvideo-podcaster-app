/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var crypto = require('crypto');
var bcrypt = require('bcrypt');
var Schema = require('mongoose').Schema;

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

//var UserModel = {
//
//  attributes: {
//    email: {
//      type: 'string',
//      required: true,
//      index: true
//    },
//
//    password: {
//      type: 'string',
//      required: true
//    },
//
//    role: {
//      type: 'string',
//      enum: ['user', 'admin'],
//      defaultsTo: 'user'
//    },
//
//    token: {
//      type: 'string'
//    },
//
//    feeds: {
//      collection: 'feed',
//      via: 'users',
//      index: true
//    }
//  },
//
//  beforeCreate: function(userData, callback) {
//    userData.token = createToken();
//
//    if(!isEncrypted(userData.password)) {
//      bcrypt.hash(userData.password, 10, function(err, encryptedPassword) {
//        userData.password = encryptedPassword;
//        callback();
//      });
//    } else {
//      callback();
//    }
//  },
//
//  login: function(email, password, callback) {
//    User.findOneByEmail(email)
//      .then(function(user) {
//        bcrypt.compare(password, user.password, function(err, same) {
//          if (same) {
//            callback(null, user);
//          } else {
//            callback('Incorrect password', null);
//          }
//        });
//      })
//      .fail(function(err) {
//        callback('User with email not found', null);
//      });
//  }
//};
//
//module.exports = UserModel;

var validRoles = ['user', 'admin'];

var UserSchema = new Schema({
  email: {type: String, required: true},
  password: {type: String, required: true},
  role: {type: String, required: true, enum: validRoles, default: 'user'},
  token: String,
  feeds: [{type: Schema.Types.ObjectId, ref: 'Feed'}]
});

UserSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

/**
 * Middleware
 */

UserSchema.pre('save', true, function(next, done) {
  next();
  if (isEncrypted(this.password)) return done();

  var self = this;

  bcrypt.hash(this.password, 10, function(err, encryptedPassword) {
    if(err) return done(err);
    self.password = encryptedPassword;
    done();
  });
});

UserSchema.pre('save', function(next) {
  if (this.token == null) {
    this.token = createToken();
  }
  next();
});

/**
 Statics
 */

UserSchema.statics.login = function(email, password, callback) {
  this.findOne({email: email}, function(err, user) {
    if (err) return callback(err, null);
    if (!user) return callback('User with email not found', null);

    bcrypt.compare(password, user.password, function(err, same) {
      if (err) return callback(err, null);

      return same
        ? callback(null, user)
        : callback('Incorrect Password', null);
    })
  });
};

module.exports = UserSchema;