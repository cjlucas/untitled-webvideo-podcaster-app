require 'net/http'
require 'sidekiq'
require 'thread'
require 'uri'

require_relative 'youtubedl'

module VidFeeder
  class FetchVideosWorker
    include Sidekiq::Worker

    MAX_VIDEOS_PER_REQ = 100
    FORMAT_SIZE_WORKER_COUNT = 5

    sidekiq_options retry: 2

    def initialize
      @video_count = 0
      @pending_vid_q = Queue.new
      @processed_vid_q = Queue.new
      @format_size_workers = []
    end

    def perform(feed)
      puts "WEEE"
      start_format_size_workers

      id = feed['id']
      uri = URI("http://#{ENV['API_HOST']}:#{ENV['API_PORT']}/api/feed/#{id}/videos")

      FeedScraper.scrape(feed['url'], feed['site'], existing_videos(id)) do |video|
        @video_count += 1
        @pending_vid_q << video
      end

      logger.info 'Waiting for workers'
      wait_for_format_size_workers
      kill_format_size_workers

      until @processed_vid_q.empty?
        videos = []
        videos << @processed_vid_q.pop until @processed_vid_q.empty? || videos.size == MAX_VIDEOS_PER_REQ

        logger.info "Putting #{videos.size} videos"

        Net::HTTP.start(uri.host, uri.port) do |http|
          logger.info(uri.path)
          req = Net::HTTP::Put.new(uri.path)
          req.content_type = 'application/json'
          resp = http.request(req, JSON.dump({videos: videos}))
          raise Exception, "Received error response from server: #{resp.code}" unless resp.is_a?(Net::HTTPOK)
        end
      end
    end

    private

    def existing_videos(id)
      uri = URI("http://#{ENV['API_HOST']}:#{ENV['API_PORT']}/api/feed/#{id}/video_ids")
      body = Net::HTTP.get(uri)
      JSON.parse(body)
    end

    def start_format_size_workers
      FORMAT_SIZE_WORKER_COUNT.times do
        thr = Thread.new do
          loop do
            v = @pending_vid_q.pop
            FeedScraper.set_format_sizes!(v)
            @processed_vid_q << v
          end
        end

        @format_size_workers << thr
      end
    end

    def wait_for_format_size_workers
      sleep 1 until @processed_vid_q.size == @video_count
    end

    def kill_format_size_workers
      @format_size_workers.each { |t| Thread.kill(t) }
    end
  end
end
