require 'rspec/core/rake_task'

require 'sidekiq/cli'
require 'dotenv/tasks'

require_relative 'workers'

task :default => [:spec]

task :spec do
  RSpec::Core::RakeTask.new do |task|
    task.verbose = false
    task.rspec_opts = '--color'
  end
end

task test: :spec

task :clean do
  system 'rm -f *.gem'
end

task server: :environment do
  system %Q{rackup -o #{ENV['BIND_HOST']} -p #{ENV['BIND_PORT']}}
end

task s: :server

task work: :environment do
  REDIS_URL = "redis://#{ENV['CACHE_HOST']}:#{ENV['CACHE_PORT']}/0"
  Sidekiq.configure_server { |config| config.redis = { url: REDIS_URL } }
  Sidekiq.configure_client { |config| config.redis = { url: REDIS_URL } }
  cli = Sidekiq::CLI.instance
  cli.parse(['-r', './workers.rb', '-c', '1'])
  cli.run
end

require 'net/http'
require 'uri'

task refresh_feeds: :environment do
  uri = URI(%Q{http://#{ENV['API_HOST']}:#{ENV['API_PORT']}/api/feeds})
  puts uri
  Net::HTTP.start(uri.host, uri.port) do |http|
    JSON.load(http.get(uri.path).body).each do |feed|
      id = feed['id']
      puts id
      http.get(%Q{/update_feed/#{id}})
    end
  end
end

task add_missing_feed_images: :environment do
  uri = URI(%Q{http://#{ENV['API_HOST']}:#{ENV['API_PORT']}/api/feeds})
  Net::HTTP.start(uri.host, uri.port) do |http|
    JSON.load(http.get(uri.path).body).each do |feed|
      next unless feed['image_url'].nil?
      VidFeeder::AddFeedImageWorker.perform_async(feed)
    end
  end
end

task :run_worker do
  loop do
    Rake::Task['refresh_feeds'].execute
    # sleep(60 * 60 * 2)
  end
end
