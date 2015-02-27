require 'bcrypt'

module VidFeeder
  module Models
    class User
      include MongoMapper::Document

      key :email, String
      key :password, String

      timestamps!

      def self.register!(email, password)
        password = BCrypt::Password.create(password)
        user = new(email: email, password: password)
        user.save!
      end

      def self.is_valid_credentials?(email, password)
        user = User.first(email: email)
        return false if user.nil?

        return BCrypt::Password.new(user.password).is_password?(password)
      end
    end
  end
end
