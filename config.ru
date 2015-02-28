require_relative 'app'

require 'sidekiq/web'

run Rack::URLMap.new(
                    '/' => VidFeeder::App,
                    '/sidekiq' => Sidekiq::Web
)