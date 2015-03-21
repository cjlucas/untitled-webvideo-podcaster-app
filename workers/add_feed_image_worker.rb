require 'mechanize'
require 'sidekiq'
require 'uri'

module VidFeeder
  class AddFeedImageWorker
    include Sidekiq::Worker

    sidekiq_options retry: 3

    def perform(feed)
      p = agent.get(feed['url'])
      img = p.search('img[class="channel-header-profile-image"]').first
      raise Exception, 'Could not find feed image' if img.nil?

      image_url = img.attr('src')
      raise Exception, '<img> element has no src attribute' if image_url.nil?

      id = feed['id']
      uri = URI("http://localhost:4567/api/feeds/#{id}")
      Net::HTTP.start(uri.host, uri.port) do |http|
        req = Net::HTTP::Patch.new(uri.path)
        req.content_type = 'application/json'
        http.request(req, JSON.dump({image_url: image_url}))
      end
    end

    private

    def agent
      Mechanize.new
    end
  end
end