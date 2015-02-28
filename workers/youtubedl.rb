require 'date'
require 'json'
require 'open4'

class FeedScraper
  def self.scrape(url, &block)
    pid, stdin, stdout, stderr = Open4::popen4("youtube-dl -j #{url}")
    until stdout.eof?
      line = stdout.readline
      line = JSON.parse(line)
      block.call(video_for_json(line))
    end
  end

  private

  def self.video_for_json(json)
    video = {}
    video[:title] = json['fulltitle']
    video[:upload_date] = Date.strptime(json['upload_date'], '%Y%m%d')
    video[:description] = json['description']

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
      next if format['vcodec'].eql?('none')

      out << format
    end

    out
  end
end