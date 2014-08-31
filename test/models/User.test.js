var assert = require('assert');

describe('UserModel', function() {
  var Sails = require('sails');

  before(function(done) {
    Sails.lift({
    }, function(err, sails) {
      if (err) return done(err);
      done(err, sails);
    });
  });

  after(function(done) {
    sails.lower(done);
  });

  describe('#create()', function() {
    it('should fail if email was not specified', function(done) {
      User.create({password: 'password'})
        .exec(function(err, user) {
          assert.equal(user, null);
          done();
        });
    });

    it('should fail if password was not specified', function(done) {
      User.create({email: 'email'})
        .exec(function(err, user) {
          assert.equal(user, null);
          done();
        });
    });

    it('should save successfully if email and password were specified', function(done) {
      User.create({email: 'fake.email@google.com', password: 'password'})
        .exec(function(err, user) {
          assert.equal(err, null);
          assert.ok(user);
          done();
        });
    });

  });
});