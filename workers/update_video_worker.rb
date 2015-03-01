require 'net/http'
require 'sidekiq'
require 'uri'

require_relative 'youtubedl'


module VidFeeder
  class UpdateVideoWorker
    include Sidekiq::Worker

    def perform(video)
      uri = URI("http://localhost:4567/api/videos/#{video['id']}")
      puts uri
      puts video
      puts video['url']
      video = FeedScraper.fetch_video(video['url'])

      Net::HTTP.start(uri.host, uri.port) do |http|
        puts 'rawr'
        req = Net::HTTP::Patch.new(uri.path)
        resp = http.request(req, JSON.dump({video: video}))
        raise Exception, "Received error response from server: #{resp.code} #{resp.msg}" unless resp.is_a?(Net::HTTPOK)
      end
    end
  end
end
