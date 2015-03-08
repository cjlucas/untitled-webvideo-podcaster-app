require 'memcached'
require 'mongo_mapper'
require 'sinatra/base'
require 'sidekiq'

require_relative 'helpers'
require_relative 'middleware'

module VidFeeder
  class App < Sinatra::Application
    include Helpers

    use CompressResponse

    enable :sessions

    configure do
      MongoMapper.connection = Mongo::Connection.new('localhost', 27017)
      MongoMapper.database = 'vidfeeder'
    end

    def memcache
      @memcache ||= Memcached.new('localhost:11211', prefix_key: 'vidfeeder')
    end
  end
end

require_relative 'workers'
require_relative 'models'
require_relative 'routes'
