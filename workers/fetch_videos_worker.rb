require 'net/http'
require 'sidekiq'
require 'uri'

require_relative 'youtubedl'


module VidFeeder
  class FetchVideosWorker
    include Sidekiq::Worker

    def perform(feed)
      uri = URI("http://localhost:4567/api/feed/#{feed['id']}/videos")

      FeedScraper.scrape(feed['url']) do |video|
        Net::HTTP.start(uri.host, uri.port) do |http|
          req = Net::HTTP::Put.new(uri.path)
          puts JSON.dump({videos: [video]})
          puts http.request(req, JSON.dump({videos: [video]}))
        end
      end
    end
  end
end
