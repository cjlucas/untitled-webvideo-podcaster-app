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
  end
end