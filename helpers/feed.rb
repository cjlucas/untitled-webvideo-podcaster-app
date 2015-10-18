module VidFeeder
  module Helpers
    def fmt_duration(seconds)
      seconds_left = seconds.to_i
      s = ''

      hours = seconds_left / 3600
      seconds_left -= hours * 3600
      s += "#{hours}:" unless hours.zero?

      minutes = seconds_left / 60
      seconds_left -= minutes * 60
      minute_fmt = hours.zero? ? "%d:" : "%02d:"
      s += sprintf(minute_fmt, minutes)

      s += sprintf("%02d", seconds_left)
      s
    end

    def best_format(video)
      video.formats.sort{ |a,b| (b.resolution || 0) <=> (a.resolution || 0) }.first
    end

    def prettify_video_desc(desc)
      desc.gsub!(/\n/, ' <br> ')

      pretty_desc = []
      desc.split(/\s/).each do |s|
        s = %Q{<a href="#{s}">#{s}</a>} if /https?:\/\/\S*/i =~ s
        pretty_desc << s
      end

      pretty_desc.join(' ')
    end
  end
end
