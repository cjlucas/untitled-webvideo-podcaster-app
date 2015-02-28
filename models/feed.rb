module VidFeeder
  class Feed
    include MongoMapper::Document

    key :site, String
    key :site_id, String
    key :video_ids, Array

    many :videos, in: :video_ids, class_name: 'VidFeeder::Video'

    def self.from_url(url)
      feed = case url
             when /(https?\:\/\/)?youtube.com\/user\/([^\/]*)/i
               new_with_data('youtube', $2)
             else
               nil
             end

      feed.save unless feed.nil?
      feed
    end

    def url
      if site.eql?('youtube')
        return "http://youtube.com/user/#{site_id}"
      end
    end

    def to_json
      JSON.dump({
          id: id,
          site: site,
          site_id: site_id,
          url: url
      })
    end

    private

    def self.new_with_data(site, site_id)
      find_or_initialize_by_site_and_site_id(site, site_id)
    end
  end

  class Video
    include MongoMapper::Document

    many :formats, class_name: 'VidFeeder::VideoFormat'

    key :site_id, String
    key :title, String
    key :upload_date, Time
    key :description, String
  end

  class VideoFormat
    include MongoMapper::EmbeddedDocument

    embedded_in :video

    key :resolution, Integer
    key :url, String

  end
end