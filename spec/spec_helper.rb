require 'rspec'
require 'mongo_mapper'

require_relative '../models'
require_relative '../helpers'

def destroy_all
  VidFeeder::constants.each do |model_name|
    klass = VidFeeder.const_get(model_name)
    klass.destroy_all if klass.respond_to?(:destroy_all)
  end
end

RSpec.configure do |config|
  config.before(:suite) do
    MongoMapper.connection = Mongo::Connection.new('localhost', 27017)
    MongoMapper.database = 'vidfeeder-test'
  end

  config.before(:each) do
    destroy_all
  end

  config.after(:suite) do
    destroy_all
  end
end