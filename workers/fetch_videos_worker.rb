require 'net/http'
require 'sidekiq'
require 'uri'

require_relative 'youtubedl'


module VidFeeder
  class FetchVideosWorker
    include Sidekiq::Worker

    def perform(feed)
      id = feed['id']
      uri = URI("http://localhost:4567/api/feed/#{id}/videos")

      FeedScraper.scrape(feed['url'], feed['site'], existing_videos(id)) do |video|
        Net::HTTP.start(uri.host, uri.port) do |http|
          req = Net::HTTP::Put.new(uri.path)
          resp = http.request(req, JSON.dump({videos: [video]}))
          raise Exception, "Received error response from server: #{resp.code} #{resp.json_body}" unless resp.is_a?(Net::HTTPOK)
        end
      end
    end

    private

    def existing_videos(id)
      uri = URI("http://localhost:4567/api/feed/#{id}/video_ids")
      body = Net::HTTP.get(uri)
      JSON.parse(body)
    end
  end
end
