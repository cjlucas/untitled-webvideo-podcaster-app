require 'date'
require 'json'
require 'open4'
require 'tempfile'
require 'uri'

ScraperException = Class.new(Exception)

class FeedScraper
  def self.scrape(url, feed_site, existing_videos, &block)

    vid_archive_fp = Tempfile.new('feedscraper')
    existing_videos.each { |video_id| vid_archive_fp.write("#{feed_site} #{video_id}\n") }
    vid_archive_fp.close

    archive_path = existing_videos.empty? ? nil : vid_archive_fp.path

    Open4::popen4(cmd(url, archive_path)) do |pid, stdin, stdout, stderr|
      until stdout.eof?
        line = stdout.readline
        line = JSON.parse(line)
        video = video_for_json(line)
        unless video[:formats].empty?
          block.call(video)
        end
      end
    end

    vid_archive_fp.unlink
    # raise ScraperException, stderr.read unless stderr.eof?
  end

  def self.fetch_video(url)
    vid = nil
    scrape(url, nil, []) { |v| vid = v }
    vid
  end

  def self.set_format_sizes!(video)
    video[:formats].each do |format|
      format[:size] = get_content_size(URI(format[:url]))
    end
  end

  private

  def self.video_for_json(json)
    video = {}
    video[:title] = json['fulltitle']
    video[:site_id] = json['display_id']
    video[:upload_date] = DateTime.strptime(json['upload_date'], '%Y%m%d')
    video[:description] = json['description']
    video[:image_url] = json['thumbnail']
    video[:duration] = json['duration']

    video[:formats] = []
    filter_formats(json['formats']).each do |format_json|
      format = {}
      format[:resolution] = format_json['height']
      format[:url] = format_json['url']

      video[:formats] << format
    end

    video
  end

  def self.filter_formats(formats)
    out = []

    formats.each do |format|
      # Filter audio/DASH formats
      next if format['vcodec'].eql?('none') || format['acodec'].eql?('none')

      # Filter 3D
      next if format['format_node'].eql?('3D')

      out << format
    end

    out
  end

  def self.cmd(url, archive_path)
    s = "youtube-dl --ignore-errors -j #{url}"
    s += " --download-archive #{archive_path}" unless archive_path.nil?
    s
  end

  def self.get_content_size(uri)
    Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme.eql?('https')) do |http|
      resp = http.head("#{uri.path}?#{uri.query}") rescue nil
      return case resp
             when Net::HTTPRedirection
               get_content_size(URI(resp['location']))
             when Net::HTTPOK
               resp.content_length
      end
    end
  end
end
