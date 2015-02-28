require 'mongo_mapper'
require 'sinatra/base'
require 'sidekiq'

module VidFeeder
  class App < Sinatra::Application
    enable :sessions

    configure do
      MongoMapper.connection = Mongo::Connection.new('localhost', 27017)
      MongoMapper.database = 'vidfeeder'
    end
  end
end

require_relative 'workers'
require_relative 'models'
require_relative 'routes'
