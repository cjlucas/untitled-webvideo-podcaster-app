module VidFeeder
  class App < Sinatra::Application
    def validate_api_key!
      return if ENV['RACK_ENV'].eql?('development')
      key = env['HTTP_API_KEY']
      halt 403, 'Bad API key' if key.nil? || !key.eql?(ENV['VIDFEEDER_API_KEY'])
    end

    def json_body
      return @json_body unless @json_body.nil?
      @json_body = JSON.parse(env['rack.input'].read)
    end

    get '/api/feed/:id/video_ids' do
      validate_api_key!

      feed_id = params[:id]
      feed = Feed.find(feed_id)
      halt 404, "Feed with id #{feed_id} not found" if feed.nil?


      JSON.dump(feed.videos.collect { |video| video.site_id})
    end

    put '/api/feed/:feed_id/videos' do
      validate_api_key!

      feed_id = params[:feed_id]
      feed = Feed.find(feed_id)
      halt 404, "Feed with id #{feed_id} not found" if feed.nil?
      halt 400, "videos key should point to array of videos" unless json_body['videos'].is_a?(Array)

      json_body['videos'].each { |video| feed.add_video(Video.new(video)) }

      feed.save
    end

    patch '/api/videos/:video_id' do
      validate_api_key!

      video = Video.find(params[:video_id])
      halt 404, %Q{Video with id "#{params[:video_Id]}" not found} if video.nil?

      video.update_metadata(Video.new(json_body['video']))

      new_formats = json_body['video']['formats'].collect{ |f| VideoFormat.new(f) }
      video.update_formats(new_formats)
    end
  end
end