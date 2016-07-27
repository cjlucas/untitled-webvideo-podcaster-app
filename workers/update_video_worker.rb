require 'net/http'
require 'sidekiq'
require 'uri'

require_relative 'youtubedl'


module VidFeeder
  class UpdateVideoWorker
    include Sidekiq::Worker

    sidekiq_options retry: 2

    def perform(video)
      uri = URI("http://#{ENV['API_HOST']}:#{ENV['API_PORT']}/api/videos/#{video['id']}")
      video = FeedScraper.fetch_video(video['url'])
      FeedScraper.set_format_sizes!(video)

      Net::HTTP.start(uri.host, uri.port) do |http|
        req = Net::HTTP::Patch.new(uri.path)
        req.content_type = 'application/json'
        resp = http.request(req, JSON.dump({video: video}))
        raise Exception, "Received error response from server: #{resp.code} #{resp.msg}" unless resp.is_a?(Net::HTTPOK)
      end
    end
  end
end
