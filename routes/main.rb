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

      @feeds = user.feeds
      haml :index
    end

    post '/add_feed' do
      feed = Feed.from_url(params[:url])
      halt 400, 'Bad url' if feed.nil?

      feed.save
      user.feeds << feed
      user.save

      FetchVideosWorker.perform_async(feed.to_hash)
      AddFeedImageWorker.perform_async(feed.to_hash)

      redirect '/'
    end

    get '/update_feed/:id' do
      feed = Feed.find(params[:id])
      halt 404, 'Could not find feed' if feed.nil?
      FetchVideosWorker.perform_async(feed.to_hash)
      redirect '/'
    end

    get '/feed/:id' do
      content_type :rss

      feed = Feed.find(params[:id])
      halt 404, 'Feed not found' if feed.nil?
      unless feed.updated_at.nil?
        response['Last-Modified'] = feed.updated_at.utc.httpdate
      end

      data = cache.load_feed(feed.id)
      if data.nil?
        data = haml :feed, locals: {feed: feed}
        cache.save_feed(feed.id, data)
      end
      data
    end

    get '/video/:id' do
        video = Video.find(params[:id])
        halt 404, 'Video with id does not exist' if video.nil?

        site_url = "https://www.youtube.com/watch?v=#{video.site_id}"

        redirect "https://xzsc1ifa0m.execute-api.us-east-1.amazonaws.com/beta?url=#{site_url}"
    end

    private

    def fetch(uri)
      Net::HTTP.start(uri.host, uri.port,
                      use_ssl: uri.scheme.eql?('https'),
                      verify_mode: OpenSSL::SSL::VERIFY_NONE) do |http|
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
