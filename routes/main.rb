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
      FetchVideosWorker.perform_async(feed.to_json)
      redirect '/'
    end
  end
end