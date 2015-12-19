module VidFeeder
  class App < Sinatra::Application
    helpers Sinatra::JSON

    def validate_api_key!
      return if ENV['RACK_ENV'].eql?('development')
      key = env['API_KEY']
      halt 403, 'Bad API key' if key.nil? || !key.eql?(ENV['API_KEY'])
    end

    def json_body
      return @json_body unless @json_body.nil?
      @json_body = JSON.parse(env['rack.input'].read)
    end

    get '/api/feeds' do
      validate_api_key!
      json Feed.all.collect { |f| puts f.to_hash; f.to_hash }
    end

    patch '/api/feeds/:id' do
      validate_api_key!

      feed_id = params[:id]
      feed = Feed.find(feed_id)
      halt 404, "Feed with id #{feed_id} not found" if feed.nil?

      feed.update_attributes(json_body)
      feed.save

      cache.flush_feed(feed.id)

      json feed.to_hash
    end

    get '/api/feed/:id/video_ids' do
      validate_api_key!

      feed_id = params[:id]
      feed = Feed.find(feed_id)
      halt 404, "Feed with id #{feed_id} not found" if feed.nil?

      json feed.videos.collect { |video| video.site_id }
    end

    put '/api/feed/:feed_id/videos' do
      validate_api_key!

      feed_id = params[:feed_id]
      feed = Feed.find(feed_id)
      halt 404, "Feed with id #{feed_id} not found" if feed.nil?
      halt 400, "videos key should point to array of videos" unless json_body['videos'].is_a?(Array)

      json_body['videos'].each { |video| feed.add_video(Video.new(video)) }

      cache.flush_feed(feed.id)

      if feed.save
        json feed.to_hash
      else
        halt 500, 'Error saving feed'
      end
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
