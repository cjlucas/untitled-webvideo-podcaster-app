require 'bcrypt'

module VidFeeder
  class User
    include MongoMapper::Document

    key :email, String
    key :password, String
    key :feed_ids, Array
    many :feeds, in: :feed_ids, class_name: 'VidFeeder::Feed'

    timestamps!

    def self.register!(email, password)
      password = BCrypt::Password.create(password)
      user = new(email: email, password: password)
      user.save!
    end

    def self.is_valid_credentials?(email, password)
      user = first(email: email)
      return false if user.nil?

      return BCrypt::Password.new(user.password).is_password?(password)
    end
  end
end
