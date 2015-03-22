require 'redis'
require 'stringio'
require 'zlib'

module VidFeeder
  class CacheStore
    def initialize(*opts)
      opts = opts.first
      @host = opts[:host]
      @port = opts[:port]
      @db = opts[:db]
      @prefix = opts[:prefix]
      @enabled = opts[:enabled]
      @logger = opts[:logger]
      @conn = nil
    end

    def save_feed(feed_id, data)
      return unless enabled?

      sio = compress(data)
      key = feed_key(feed_id)
      logger.info("Caching feed at key: #{key}")
      conn.set(key, sio.read)
    end

    def load_feed(feed_id)
      return nil unless enabled?

      key = feed_key(feed_id)
      data = conn.get(key)
      return nil if data.nil?

      sio = StringIO.new
      sio.write(data)
      sio.rewind

      decompress(sio)
    end

    def flush_feed(feed_id)
      return unless enabled?

      conn.del(feed_key(feed_id))
    end

    def flush!
      return unless enabled?

      pattern = "#{@prefix}:*"
      logger.info "Flushing keys matching pattern: #{pattern}"
      conn.scan_each(match: pattern) { |key| conn.del(key) }
    end

    private

    def conn
      @conn ||= Redis.new(host: @host, port: @port, db: @db, driver: :hiredis)
    end

    def compress(data)
      s = StringIO.new
      Zlib::GzipWriter.wrap(s) do |gzip|
        gzip.write(data)
        gzip.finish
      end

      s.rewind
      s
    end

    def decompress(data)
      s = StringIO.new
      Zlib::GzipReader.wrap(data) do |gzip|
        s.write(gzip.read)
        gzip.finish
      end

      s.rewind
      s
    end

    def enabled?
      !!@enabled
    end

    def logger
      @logger
    end

    def feed_key(feed_id)
      key_components = @prefix.split(':').select { |s| !s.empty? }
      key_components << 'feed'
      key_components << feed_id.to_s
      key_components.join(':')
    end
  end
end