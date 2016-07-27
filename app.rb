require 'dotenv'
require 'mongo_mapper'
require 'sinatra/base'
require 'sinatra/json'
require 'sidekiq'
require 'active_model/serializers'

require_relative 'cache_store'
require_relative 'helpers'
require_relative 'middleware'

Dotenv.load

REDIS_URL = "redis://#{ENV['CACHE_HOST']}:#{ENV['CACHE_PORT']}/0"

Sidekiq.configure_server do |config|
  config.redis = { url: REDIS_URL }
end

Sidekiq.configure_client do |config|
  config.redis = { url: REDIS_URL }
end

module VidFeeder
  class App < Sinatra::Application
    include Helpers

    enable :sessions
    set :session_secret, 'abc'

    use CompressResponse

    def self.logger
      Logger.new($stdout)
    end

    def self.cache
      CacheStore.new(host: ENV['CACHE_HOST'],
                     port: ENV['CACHE_PORT'],
                     db: 0,
                     prefix: 'vidfeeder_cache',
                     enabled: ENV['CACHE_ENABLED'].eql?('true'),
                     logger: logger)
    end

    configure do
      MongoMapper.connection = Mongo::Connection.new(ENV['MONGODB_HOST'], ENV['MONGODB_PORT'].to_i, logger: nil)
      MongoMapper.database = ENV['MONGODB_DBNAME']
      cache.flush!
    end

    def cache
      @cache ||= self.class.cache
    end
  end
end

require_relative 'workers'
require_relative 'models'
require_relative 'routes'
