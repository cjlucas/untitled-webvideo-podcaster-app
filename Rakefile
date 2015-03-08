require 'rspec/core/rake_task'

require 'sidekiq/cli'
require 'dotenv/tasks'

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
  cli = Sidekiq::CLI.instance
  cli.parse(['-r', './workers.rb'])
  cli.run
end

require 'net/http'
require 'uri'

task refresh_feeds: :environment do
  uri = URI(%Q{http://#{ENV['API_HOST']}:#{ENV['API_PORT']}/api/feeds})
  Net::HTTP.start(uri.host, uri.port) do |http|
    JSON.load(http.get(uri.path).body).each do |feed|
      id = feed['id']
      http.get(%Q{/update_feed/#{id}})
    end
  end
end