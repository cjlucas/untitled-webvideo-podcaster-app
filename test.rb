require_relative 'workers/youtubedl'

FeedScraper.scrape('http://youtube.com/user/CannataJeff') { |v| puts v }
