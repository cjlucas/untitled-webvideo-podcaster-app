module VidFeeder
  class Feed
    include MongoMapper::Document

    key :site, String
    key :site_id, String
    key :feed_type, String, default: 'user'
    key :video_ids, Array
    key :image_url, String
    timestamps!

    many :videos, in: :video_ids, class_name: 'VidFeeder::Video'

    def self.from_url(url)
      feed = case url
             when /(https?\:\/\/)?youtube.com\/user\/([^\/]*)/i
               new_with_data('youtube', 'user', $2)
             when /(https?\:\/\/)?(w{3}\.)?youtube.com\/playlist\?list\=([^\/]*)/i
               new_with_data('youtube', 'playlist', $3)
             when /(https?\:\/\/)?(w{3}\.)?youtube.com\/channel\/([^\/]*)/i
               new_with_data('youtube', 'channel', $3)
             end

      feed.save unless feed.nil?
      feed
    end

    def add_video(video)
      video.site = site
      videos << video
    end

    def url
        case site
        when 'youtube'
            case feed_type
            when 'user'
                "http://youtube.com/user/#{site_id}"
            when 'playlist'
                "https://www.youtube.com/playlist?list=#{site_id}"
            end
        end
    end

    def to_hash
      {
          id: id,
          site: site,
          site_id: site_id,
          feed_type: feed_type,
          url: url,
          image_url: image_url
      }
    end

    def to_json
      JSON.dump(to_hash)
    end

    private

    def self.new_with_data(site, feed_type, site_id)
      find_or_initialize_by_site_and_feed_type_and_site_id(site, feed_type, site_id)
    end
  end

  class Video
    include MongoMapper::Document

    key :site, String
    key :site_id, String
    key :title, String
    key :upload_date, Time
    key :description, String
    key :duration, Integer
    key :image_url, String


    belongs_to :feed
    many :formats, class_name: 'VidFeeder::VideoFormat'

    def update_metadata(new_video)
      key_names.each do |key|
        next if key.eql?('_id')
        self[key] = new_video[key] unless new_video[key].nil?
      end

      save
    end

    def update_formats(new_formats)
      new_formats.each do |nf|
        match = formats.detect { |of| nf == of }
        # add new format if wasn't previously associated with video
        if match.nil?
          nf.save
          formats << nf
        else
          match.update_attributes(resolution: nf.resolution, url: nf.url, size: nf.size)
          match.save
        end
      end

      save
    end

    def url
      case site
      when 'youtube'
        return "http://youtube.com/watch?v=#{site_id}"
      end
    end

    def to_hash
      {
          id: id,
          site_id: site_id,
          description: description,
          url: url,
      }
    end

    def to_json
      JSON.dump(to_hash)
    end
  end

  class VideoFormat
    include MongoMapper::EmbeddedDocument

    embedded_in :video

    key :resolution, Integer
    key :url, String
    key :size, Integer

    def ==(other)
      resolution == other.resolution
    end
  end
end
