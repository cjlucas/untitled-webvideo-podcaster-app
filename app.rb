require 'sinatra/base'
require 'mongo_mapper'

module VidFeeder
  class App < Sinatra::Application
    enable :sessions

    configure do
      MongoMapper.connection = Mongo::Connection.new('localhost', 27017)
      MongoMapper.database = 'vidfeeder'
    end
  end
end

require_relative 'models'
require_relative 'routes'

VidFeeder::App.run!
