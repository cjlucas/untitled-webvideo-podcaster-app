module VidFeeder
  class App < Sinatra::Application
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

      haml :feed
    end

    get '/video/:id' do
      MAX_RETRIES = 10
      SLEEP_SECONDS = 1

      retry_count = 0
      dispatched_job = false
      ok = false
      url = "http://localhost:4567/jvofjdioas"
      until retry_count == MAX_RETRIES
        video = Video.find(params[:id])
        halt 404, 'Video with id does not exist' if video.nil?

        format = video.formats.detect { |f| f.resolution >= 720 }
        halt 400, 'Video does not have a video with a resolution of over 720p' if format.nil?

        resp = fetch(URI(url))
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

    def fetch(uri)
      Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme.eql?('https')) do |http|
        resp = http.head("#{uri.path}?#{uri.query}") rescue nil
        case resp
        when Net::HTTPRedirection
          fetch(URI(resp['location']))
        else
          return resp
        end
      end
    end
  end
end