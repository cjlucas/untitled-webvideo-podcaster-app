module VidFeeder
  class App < Sinatra::Application
    def validate_api_key!
      return if ENV['RACK_ENV'].eql?('development')
      key = env['HTTP_API_KEY']
      halt 403, 'Bad API key' if key.nil? || !key.eql?(ENV['VIDFEEDER_API_KEY'])
    end

    def inject_body!
      data = JSON.parse(env['rack.input'].read)
      params.merge!(data)
    end

    put '/api/feed/:feed_id/videos' do
      validate_api_key!
      inject_body!

      feed_id = params[:feed_id]
      feed = Feed.find(feed_id)
      halt 404, "Feed with id #{feed_id} not found" if feed.nil?
      halt 400, "videos key should point to array of videos" unless params[:videos].is_a?(Array)

      params[:videos].each { |video| feed.videos << Video.new(video) }

      feed.save
    end

    patch '/api/videos/:video_id' do
      validate_api_key!

      video = Video.find(params[:video_id])
      halt 404, %Q{Video with id "#{params[:video_Id]}" not found} if video.nil?

      video.set(params)
      video.save
    end
  end
end