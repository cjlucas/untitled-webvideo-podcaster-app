require 'zlib'
require 'stringio'

module VidFeeder
  class App < Sinatra::Application
    helpers do
      def escape_html(text)
        Rack::Utils.escape_html(text)
      end
    end

    def user
      return @user unless @user.nil?
      return nil if session[:email].nil?
      @user = User.first(email: session[:email])
    end

    get '/' do
      redirect '/login' if user.nil?

      puts 'here'
      @feeds = user.feeds
      puts 'here2'

      haml :index
    end

    post '/add_feed' do
      feed = Feed.from_url(params[:url])
      halt 400, 'Bad url' if feed.nil?

      feed.save
      user.feeds << feed
      user.save

      redirect '/'
    end

    get '/update_feed/:id' do
      feed = Feed.find(params[:id])
      halt 404, 'Could not find feed' if feed.nil?
      FetchVideosWorker.perform_async(feed.to_hash)
      redirect '/'
    end

    get '/feed/:id' do
      @feed = Feed.find(params[:id])
      halt 404, 'Feed not found' if @feed.nil?

      key = @feed.id.to_s
      data = memcache_load(key)
      if data.nil?
        data = haml :feed
        memcache_save(key, data)
      end
      data
    end

    get '/video/:id' do
      puts 'here'
      MAX_RETRIES = 10
      SLEEP_SECONDS = 1

      retry_count = 0
      dispatched_job = false
      ok = false
      until retry_count == MAX_RETRIES
        video = Video.find(params[:id])
        halt 404, 'Video with id does not exist' if video.nil?

        format = best_format(video)

        resp = fetch(URI(format.url))
        if resp.is_a?(Net::HTTPOK) || resp.is_a?(Net::HTTPFound)
          ok = true
          break
        end

        unless dispatched_job
          UpdateVideoWorker.perform_async(video.to_hash)
          dispatched_job = true
        end

        retry_count += 1
        sleep SLEEP_SECONDS
        url = format.url
      end

      if ok
        redirect format.url
      else
        halt 500, 'Could not get valid URL for video'
      end
    end

    private

    def memcache_load(key)
      s = StringIO.new
      begin
        s.write(memcache.get(key))
      rescue
        return nil
      end

      s.rewind
      data = nil
      Zlib::GzipReader.wrap(s) do |gzip|
        data = gzip.read
        gzip.close
      end

      data
    end

    def memcache_save(key, data)
      s = StringIO.new
      Zlib::GzipWriter.wrap(s) do |gzip|
        gzip.write(data)
        gzip.finish
      end

      s.rewind
      memcache.set(key, s.read)
    end

    def fetch(uri)
      Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme.eql?('https')) do |http|
        resp = http.head("#{uri.path}?#{uri.query}") rescue nil
        return case resp
               when Net::HTTPRedirection
                 fetch(URI(resp['location']))
               else
                 resp
               end
      end
    end
  end
end