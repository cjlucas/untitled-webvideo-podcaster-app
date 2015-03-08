require 'dotenv'
require 'memcached'
require 'mongo_mapper'
require 'sinatra/base'
require 'sinatra/json'
require 'sidekiq'

require_relative 'helpers'
require_relative 'middleware'

Dotenv.load

module VidFeeder
  class App < Sinatra::Application
    include Helpers

    enable :sessions

    use CompressResponse

    configure do
      MongoMapper.connection = Mongo::Connection.new(ENV['MONGODB_HOST'], ENV['MONGODB_PORT'].to_i)
      MongoMapper.database = ENV['MONGODB_DBNAME']
    end

    def memcache
      return @memcache unless @memcache.nil?

      host_port = %Q{#{ENV['MEMCACHED_HOST']}:#{ENV['MEMCACHED_PORT']}}
      @memcache = Memcached.new(host_port, prefix_key: ENV['MEMCACHED_PREFIX'])
    end
  end
end

require_relative 'workers'
require_relative 'models'
require_relative 'routes'
