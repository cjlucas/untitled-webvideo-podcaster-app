require 'net/http'
require 'sidekiq'
require 'uri'

require_relative 'youtubedl'


module VidFeeder
  class FetchVideosWorker
    include Sidekiq::Worker

    sidekiq_options retry: 2

    def perform(feed)
      id = feed['id']
      uri = URI("http://localhost:4567/api/feed/#{id}/videos")

      FeedScraper.scrape(feed['url'], feed['site'], existing_videos(id)) do |video|
        Net::HTTP.start(uri.host, uri.port) do |http|
          logger.info "Received video with site_id: #{video[:site_id]}"
          logger.info(uri.path)
          logger.info JSON.dump({videos: [video]})
          req = Net::HTTP::Put.new(uri.path)
          req.content_type = 'application/json'
          resp = http.request(req, JSON.dump({videos: [video]}))
          File.open('/Users/chris/omg.html', 'wb') { |fp| fp.write(resp.body)}
          raise Exception, "Received error response from server: #{resp.code}" unless resp.is_a?(Net::HTTPOK)
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
